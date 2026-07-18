// VRMヒーローの three.js シーン構築(DESIGN.md §7)。
//
// Reactから独立したプレーンなTSモジュールにしている(VrmCanvas.tsx はDOM要素の
// マウント/アンマウントとフォールバック表示の切替だけを担当し、three.js自体の
// セットアップ・待機モーション・マウス追従・破棄はすべてここに閉じる)。
//
// `createVrmScene` は `public/models/avatar.vrm` のロードに失敗した場合
// (ファイル未配置・破損など)、例外を投げて reject する。呼び出し側は
// これを catch してフォールバック(VrmFallback)へ切り替える想定のため、
// ここでは console.error を使わず、失敗時のログは呼び出し側に委ねる。
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import {
  VRM,
  VRMExpressionPresetName,
  VRMHumanBoneName,
  VRMLoaderPlugin,
  VRMUtils,
} from "@pixiv/three-vrm"
import {
  VRMAnimationLoaderPlugin,
  createVRMAnimationClip,
  type VRMAnimation,
} from "@pixiv/three-vrm-animation"

export interface VrmSceneOptions {
  /** 描画先。VrmCanvas がマウントする <canvas> 要素そのもの。 */
  canvas: HTMLCanvasElement
  /** サイズ計測・IntersectionObserver の対象になる canvas の親要素。 */
  container: HTMLElement
  /** 読み込むVRMファイルのURL(通常 /models/avatar.vrm)。 */
  modelUrl: string
  /**
   * ループ再生するVRMAアニメーションのURL(任意)。読み込みに失敗した場合や
   * 未指定の場合は、従来のプロシージャル待機モーションにフォールバックする。
   * prefers-reduced-motion 時は読み込み自体を行わない。
   */
  animationUrl?: string
}

export interface VrmSceneHandle {
  /** ループ停止・イベント解除・GPUリソース破棄をまとめて行う。 */
  dispose: () => void
}

// 待機モーション・マウス追従のチューニング値。
// DESIGN.md §7「派手にしない」「上品に、少しだけ」に合わせ振幅は控えめにする。
const BREATH_PERIOD_SEC = 4.2
const BREATH_AMPLITUDE = 0.035 // rad, 胸の微小な前後回転(呼吸)
const HIPS_BOB_AMPLITUDE = 0.006 // m, 呼吸に合わせたごく僅かな上下
const SWAY_PERIOD_SEC = 6.5
const SWAY_AMPLITUDE = 0.02 // rad, 体幹のゆったりした横揺れ
const HEAD_POINTER_YAW = 0.12 // rad, マウスX追従による頭の最大ヨー角
const HEAD_POINTER_PITCH = 0.07 // rad, マウスY追従による頭の最大ピッチ角
const POINTER_SMOOTHING = 6 // 大きいほど素早く追従する減衰係数
const LOOK_AT_DISTANCE = 2.6 // m, 視線ターゲットのカメラからの距離
const LOOK_AT_RANGE_X = 0.55
const LOOK_AT_RANGE_Y = 0.35
const BLINK_DURATION_SEC = 0.16
const BLINK_MIN_INTERVAL_SEC = 2.5
const BLINK_MAX_INTERVAL_SEC = 6.5
const HEAD_TOP_MARGIN = 0.24 // m, 頭ボーンから頭頂+髪までの見込み高さ
const HIPS_BOTTOM_MARGIN = 0.05 // m, 腰ボーンの下に持たせる余白
const UPPER_ARM_DOWN = 1.15 // rad, Tポーズから腕を下ろす角度(≈66°)
const LOWER_ARM_BEND = 0.25 // rad, 肘のわずかな曲げ
const MAX_PIXEL_RATIO = 2
const MAX_DELTA_SEC = 0.1 // タブ非表示からの復帰時などに大きな delta で動きが飛ばないようにする

function randomBlinkInterval(): number {
  return BLINK_MIN_INTERVAL_SEC + Math.random() * (BLINK_MAX_INTERVAL_SEC - BLINK_MIN_INTERVAL_SEC)
}

export async function createVrmScene({
  canvas,
  container,
  modelUrl,
  animationUrl,
}: VrmSceneOptions): Promise<VrmSceneHandle> {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20)
  scene.add(camera)

  // ライティング: directional + ambient のシンプル構成(DESIGN.md §7)。
  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  const directional = new THREE.DirectionalLight(0xffffff, 0.9)
  directional.position.set(0.6, 1.6, 1.2)
  scene.add(directional)

  // モデル(.vrm)とアニメーション(.vrma)を同じローダーで読む。
  // それぞれ相手側の拡張を持たないだけなので、両プラグイン共存で問題ない。
  const loader = new GLTFLoader()
  loader.register((parser) => new VRMLoaderPlugin(parser))
  loader.register((parser) => new VRMAnimationLoaderPlugin(parser))

  // モデルが存在しない/壊れている場合はここで reject される。
  // 呼び出し側(VrmCanvas)が catch してフォールバック表示に切り替える。
  const gltf = await loader.loadAsync(modelUrl)
  const loadedVrm = gltf.userData.vrm as VRM | undefined
  if (!loadedVrm) {
    throw new Error("Loaded glTF does not contain VRM extension data")
  }
  // 明示的に非undefinedの型で束縛し直し、後続の入れ子関数(tick/dispose等)からも
  // 型ナローイングに頼らず `VRM` として参照できるようにする。
  const vrm: VRM = loadedVrm

  // パフォーマンス最適化。`removeUnnecessaryJoints` は `combineSkeletons` に
  // 統合され非推奨になったため、後継APIのみを使う。
  VRMUtils.removeUnnecessaryVertices(vrm.scene)
  VRMUtils.combineSkeletons(vrm.scene)
  VRMUtils.combineMorphs(vrm)
  VRMUtils.rotateVRM0(vrm) // VRM 0.0 モデルのみ180度回転(内部でバージョン判定)

  scene.add(vrm.scene)

  const expressionManager = vrm.expressionManager
  const headBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head)
  const chestBone =
    vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Chest) ??
    vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.UpperChest)
  const spineBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Spine)
  const hipsBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Hips)

  // VRMのレスト姿勢はTポーズなので、腕を下ろした自然な立ちポーズを一度だけ
  // 設定する(正規化ボーン空間: 左腕は+X向き、下ろすのはZ軸まわりの回転)。
  // 待機モーションは腕を触らないため、この姿勢はそのまま維持される。
  const leftUpperArm = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm)
  const rightUpperArm = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm)
  const leftLowerArm = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftLowerArm)
  const rightLowerArm = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightLowerArm)
  if (leftUpperArm) leftUpperArm.rotation.z = UPPER_ARM_DOWN
  if (rightUpperArm) rightUpperArm.rotation.z = -UPPER_ARM_DOWN
  if (leftLowerArm) leftLowerArm.rotation.z = LOWER_ARM_BEND
  if (rightLowerArm) rightLowerArm.rotation.z = -LOWER_ARM_BEND

  // 各ボーンのレスト姿勢を保持し、毎フレーム「レスト * オフセット」で
  // 姿勢を再構築する(差分の積み重ねによるドリフトを防ぐ)。
  const restQuats = new Map<THREE.Object3D, THREE.Quaternion>()
  for (const bone of [headBone, chestBone, spineBone, hipsBone]) {
    if (bone) restQuats.set(bone, bone.quaternion.clone())
  }
  const hipsRestY = hipsBone?.position.y ?? 0

  // カメラフレーミング: メッシュ全体のバウンディングボックスは頭上のリング・
  // 髪・スカートなどのアクセサリで実際の体格より大きくブレるため使わない。
  // ヒューマノイドの生ボーン(頭・腰)のワールド座標から「腰上〜頭上」の
  // バストアップを組み立てる。ボーンが取れない場合のみボックスに退避する。
  vrm.scene.updateMatrixWorld(true)
  const measureHead = vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Head)
  const measureHips = vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Hips)
  const fovHalfTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))

  let focusHeight: number
  let cameraDistance: number
  if (measureHead && measureHips) {
    const headY = measureHead.getWorldPosition(new THREE.Vector3()).y
    const hipsY = measureHips.getWorldPosition(new THREE.Vector3()).y
    const top = headY + HEAD_TOP_MARGIN // 頭ボーンより上の頭部メッシュ+髪の分
    const bottom = hipsY - HIPS_BOTTOM_MARGIN
    focusHeight = (top + bottom) / 2
    cameraDistance = Math.max((top - bottom) / (2 * fovHalfTan), 0.6)
  } else {
    const box = new THREE.Box3().setFromObject(vrm.scene)
    const size = box.getSize(new THREE.Vector3())
    focusHeight = box.min.y + size.y * 0.62
    cameraDistance = Math.max(size.y * 0.95, 0.8)
  }
  camera.position.set(0, focusHeight, cameraDistance)
  camera.lookAt(0, focusHeight, 0)

  // マウス追従用の視線ターゲット。カメラは静止しているため世界座標で配置してよい。
  const lookAtTarget = new THREE.Object3D()
  lookAtTarget.position.set(0, focusHeight, -LOOK_AT_DISTANCE)
  scene.add(lookAtTarget)
  if (vrm.lookAt) {
    vrm.lookAt.target = lookAtTarget
  }

  // 表情はニコニコ基調(VRMA再生中はアニメーション側の happy トラックが毎フレーム上書きする)。
  expressionManager?.setValue(VRMExpressionPresetName.Happy, 0.85)

  // VRMAアニメーション(あれば)をループ再生する。読み込みに失敗しても
  // モデル表示は継続し、従来のプロシージャル待機モーションに切り替える。
  // reduced-motion 時は静止1フレームのため読み込み自体を行わない。
  let mixer: THREE.AnimationMixer | undefined
  if (!reducedMotion && animationUrl) {
    try {
      const animGltf = await loader.loadAsync(animationUrl)
      const vrmAnimation = (animGltf.userData.vrmAnimations as VRMAnimation[] | undefined)?.[0]
      if (vrmAnimation) {
        const clip = createVRMAnimationClip(vrmAnimation, vrm)
        mixer = new THREE.AnimationMixer(vrm.scene)
        mixer.clipAction(clip).play() // AnimationAction のデフォルトは LoopRepeat = ループ再生
      }
    } catch (error) {
      console.info(
        "[vrm] アニメーションを読み込めなかったため、プロシージャル待機モーションで表示します。",
        error,
      )
    }
  }

  function applySize() {
    const width = container.clientWidth || 1
    const height = container.clientHeight || width
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  applySize()

  const resizeObserver = new ResizeObserver(() => {
    applySize()
    // ループ停止中(reduced-motion / 画面外)でも静止フレームが正しいサイズで
    // 保たれるよう、リサイズ時は一度だけ描画し直す。
    renderer.render(scene, camera)
  })
  resizeObserver.observe(container)

  let animationFrameId = 0
  let lastTime = performance.now()
  let elapsed = 0

  const pointer = { x: 0, y: 0 }
  const smoothedPointer = { x: 0, y: 0 }
  const tmpEuler = new THREE.Euler()
  const tmpQuat = new THREE.Quaternion()

  function handlePointerMove(event: PointerEvent) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1
  }

  let blinkPhase = 0 // 0 = 待機中、>0 = まばたき経過時間
  let blinkCooldown = randomBlinkInterval()

  // マウスへの視線・頭追従。VRMA再生中(composeOnAnimatedPose=true)は
  // ミキサーがこのフレームで決めた頭の姿勢に追従分を上乗せし、
  // プロシージャル時はレスト姿勢を基準に合成する。
  function updatePointerFollow(delta: number, composeOnAnimatedPose: boolean) {
    // ポインタの減衰追従(フレームレートに依存しない指数減衰)。
    const smoothing = 1 - Math.exp(-POINTER_SMOOTHING * delta)
    smoothedPointer.x += (pointer.x - smoothedPointer.x) * smoothing
    smoothedPointer.y += (pointer.y - smoothedPointer.y) * smoothing

    lookAtTarget.position.x = smoothedPointer.x * LOOK_AT_RANGE_X
    lookAtTarget.position.y = focusHeight - smoothedPointer.y * LOOK_AT_RANGE_Y

    if (headBone) {
      const yaw = smoothedPointer.x * HEAD_POINTER_YAW
      const pitch = -smoothedPointer.y * HEAD_POINTER_PITCH
      tmpEuler.set(pitch, yaw, 0)
      tmpQuat.setFromEuler(tmpEuler)
      if (composeOnAnimatedPose) {
        headBone.quaternion.multiply(tmpQuat)
      } else {
        headBone.quaternion.copy(restQuats.get(headBone)!).multiply(tmpQuat)
      }
    }
  }

  function updateIdleMotion(delta: number) {
    if (chestBone) {
      const rest = restQuats.get(chestBone)!
      const breath = Math.sin((elapsed / BREATH_PERIOD_SEC) * Math.PI * 2) * BREATH_AMPLITUDE
      tmpEuler.set(breath, 0, 0)
      chestBone.quaternion.copy(rest).multiply(tmpQuat.setFromEuler(tmpEuler))
    }

    if (spineBone) {
      const rest = restQuats.get(spineBone)!
      const swayX = Math.sin((elapsed / SWAY_PERIOD_SEC) * Math.PI * 2) * SWAY_AMPLITUDE
      const swayZ =
        Math.cos((elapsed / (SWAY_PERIOD_SEC * 1.3)) * Math.PI * 2) * SWAY_AMPLITUDE * 0.6
      tmpEuler.set(swayX * 0.4, swayZ * 0.5, swayZ)
      spineBone.quaternion.copy(rest).multiply(tmpQuat.setFromEuler(tmpEuler))
    }

    if (hipsBone) {
      hipsBone.position.y =
        hipsRestY + Math.sin((elapsed / BREATH_PERIOD_SEC) * Math.PI * 2) * HIPS_BOB_AMPLITUDE
    }

    updatePointerFollow(delta, false)

    if (expressionManager) {
      if (blinkPhase > 0) {
        blinkPhase += delta
        const t = blinkPhase / BLINK_DURATION_SEC
        if (t >= 1) {
          expressionManager.setValue(VRMExpressionPresetName.Blink, 0)
          blinkPhase = 0
          blinkCooldown = randomBlinkInterval()
        } else {
          expressionManager.setValue(VRMExpressionPresetName.Blink, Math.sin(Math.PI * t))
        }
      } else {
        blinkCooldown -= delta
        if (blinkCooldown <= 0) {
          blinkPhase = 1e-4
        }
      }
    }
  }

  function tick(now: number) {
    animationFrameId = requestAnimationFrame(tick)
    const delta = Math.min((now - lastTime) / 1000, MAX_DELTA_SEC)
    lastTime = now
    elapsed += delta

    if (mixer) {
      // VRMAが体・表情を駆動し、視線・頭のマウス追従だけ上乗せする
      mixer.update(delta)
      updatePointerFollow(delta, true)
    } else {
      updateIdleMotion(delta)
    }
    vrm.update(delta)
    renderer.render(scene, camera)
  }

  function startLoop() {
    // reduced-motion では静止ポーズ1フレームのみを保つ(DESIGN.md §7)。
    if (reducedMotion || animationFrameId !== 0) return
    lastTime = performance.now()
    animationFrameId = requestAnimationFrame(tick)
  }

  function stopLoop() {
    if (animationFrameId !== 0) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = 0
    }
  }

  // 画面外にスクロールされている間はループそのものを止める。
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      const isIntersecting = entries[0]?.isIntersecting ?? true
      if (isIntersecting) {
        startLoop()
      } else {
        stopLoop()
      }
    },
    { threshold: 0 },
  )
  intersectionObserver.observe(container)

  // 初期フレームを描画しておく(reduced-motion 時はこれが最終表示になる)。
  // vrm.update(0) で立ちポーズと表情(happy)を反映してから描画する。
  vrm.update(0)
  renderer.render(scene, camera)

  if (!reducedMotion) {
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    startLoop()
  }

  let disposed = false
  function dispose() {
    if (disposed) return
    disposed = true

    stopLoop()
    window.removeEventListener("pointermove", handlePointerMove)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()

    mixer?.stopAllAction()
    mixer?.uncacheRoot(vrm.scene)

    scene.remove(vrm.scene)
    VRMUtils.deepDispose(vrm.scene)
    renderer.dispose()
  }

  return { dispose }
}
