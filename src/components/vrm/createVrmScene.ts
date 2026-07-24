// 失敗時は reject する(ログは出さない)。フォールバック表示への切替判断は
// 呼び出し側が持つため、ログもそちらに委ねる。
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

export interface VrmCameraFraming {
  /** 頭ボーンより上の頭部メッシュ+髪ぶん(m) */
  headTopMargin?: number
  /** 腰ボーンより下に持たせる余白(m)。腕を下に伸ばす演技を含める場合は広げる */
  hipsBottomMargin?: number
}

export type VrmMotion =
  | { mode: "loop"; animationUrl: string }
  | {
      mode: "dock"
      /** 通常時にループ再生する演技(例: Heroのループアニメーション) */
      loopAnimationUrl: string
      /** ドック時にクロスフェードするワンショット演技。最終フレームで静止する */
      dockAnimationUrl: string
      /** 毎フレーム読み出す。trueに変わった瞬間dockAnimationUrl側へ、falseに
       * 戻った瞬間loopAnimationUrl側へcrossFadeToする */
      getDocked: () => boolean
    }
  | {
      mode: "pulse"
      /** 静止中にループ再生する待機モーション */
      idleAnimationUrl: string
      /** トリガーされるたびに最初から再生されるワンショット演技。終端で静止し、
       * 自動的にidleAnimationUrlへ戻る */
      pulseAnimationUrl: string
      /** 毎フレーム読み出す。値が変わるたびpulseAnimationUrlを頭から再生し直す。
       * 真偽値ではなくカウンタにしているのは、前の演技が終わる前に短時間で
       * 連続トリガーされても(カテゴリを素早くスクロールし切った場合など)、
       * 取りこぼさず都度頭から再生し直すため */
      getTriggerToken: () => number
    }

export interface VrmSceneOptions {
  canvas: HTMLCanvasElement
  /** サイズ計測と可視判定(IntersectionObserver)の対象になる canvas の親要素 */
  container: HTMLElement
  modelUrl: string
  /** 未指定・読込失敗時はプロシージャル待機モーションにフォールバックする */
  motion?: VrmMotion
  cameraFraming?: VrmCameraFraming
}

export interface VrmSceneHandle {
  dispose: () => void
}

const BREATH_PERIOD_SEC = 4.2
const BREATH_AMPLITUDE = 0.035 // rad
const HIPS_BOB_AMPLITUDE = 0.006 // m
const SWAY_PERIOD_SEC = 6.5
const SWAY_AMPLITUDE = 0.02 // rad
const HEAD_POINTER_YAW = 0.12 // rad
const HEAD_POINTER_PITCH = 0.07 // rad
const POINTER_SMOOTHING = 6
const LOOK_AT_DISTANCE = 2.6 // m
const LOOK_AT_RANGE_X = 0.55
const LOOK_AT_RANGE_Y = 0.35
const BLINK_DURATION_SEC = 0.16
const BLINK_MIN_INTERVAL_SEC = 2.5
const BLINK_MAX_INTERVAL_SEC = 6.5
const DEFAULT_HEAD_TOP_MARGIN = 0.24 // m, 頭ボーンより上の頭部メッシュ+髪ぶん
const DEFAULT_HIPS_BOTTOM_MARGIN = 0.05 // m
const UPPER_ARM_DOWN = 1.15 // rad
const LOWER_ARM_BEND = 0.25 // rad
const MAX_PIXEL_RATIO = 2
const MAX_DELTA_SEC = 0.1 // タブ非表示からの復帰時に delta が跳ねてモーションが飛ぶのを防ぐ
const DOCK_CROSSFADE_SEC = 0.6
const PULSE_CROSSFADE_SEC = 0.4

function randomBlinkInterval(): number {
  return BLINK_MIN_INTERVAL_SEC + Math.random() * (BLINK_MAX_INTERVAL_SEC - BLINK_MIN_INTERVAL_SEC)
}

export async function createVrmScene({
  canvas,
  container,
  modelUrl,
  motion,
  cameraFraming,
}: VrmSceneOptions): Promise<VrmSceneHandle> {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20)
  scene.add(camera)

  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  const directional = new THREE.DirectionalLight(0xffffff, 0.9)
  directional.position.set(0.6, 1.6, 1.2)
  scene.add(directional)

  // .vrm と .vrma で別ローダーを作らない: 互いに相手側のglTF拡張を持たないだけ
  // なので、両プラグインを共存させて問題ない
  const loader = new GLTFLoader()
  loader.register((parser) => new VRMLoaderPlugin(parser))
  loader.register((parser) => new VRMAnimationLoaderPlugin(parser))

  const gltf = await loader.loadAsync(modelUrl)
  const loadedVrm = gltf.userData.vrm as VRM | undefined
  if (!loadedVrm) {
    throw new Error("Loaded glTF does not contain VRM extension data")
  }
  // 入れ子関数(tick/dispose)からは型ナローイングが効かないため、非undefined型で束縛し直す
  const vrm: VRM = loadedVrm

  // removeUnnecessaryJoints は combineSkeletons に統合され非推奨のため使わない
  VRMUtils.removeUnnecessaryVertices(vrm.scene)
  VRMUtils.combineSkeletons(vrm.scene)
  VRMUtils.combineMorphs(vrm)
  VRMUtils.rotateVRM0(vrm) // VRM 0.0 のみ180度回転される(バージョン判定は内部で行われる)

  scene.add(vrm.scene)

  const expressionManager = vrm.expressionManager
  const headBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head)
  const chestBone =
    vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Chest) ??
    vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.UpperChest)
  const spineBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Spine)
  const hipsBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Hips)

  // レスト姿勢(Tポーズ)のままだと腕が真横に伸びるため、立ちポーズを一度だけ設定する
  const leftUpperArm = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm)
  const rightUpperArm = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm)
  const leftLowerArm = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftLowerArm)
  const rightLowerArm = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightLowerArm)
  if (leftUpperArm) leftUpperArm.rotation.z = UPPER_ARM_DOWN
  if (rightUpperArm) rightUpperArm.rotation.z = -UPPER_ARM_DOWN
  if (leftLowerArm) leftLowerArm.rotation.z = LOWER_ARM_BEND
  if (rightLowerArm) rightLowerArm.rotation.z = -LOWER_ARM_BEND

  // 毎フレームの姿勢は「レスト × オフセット」で組み立てる。差分を現在値へ
  // 積み上げる方式は誤差でドリフトするため採らない
  const restQuats = new Map<THREE.Object3D, THREE.Quaternion>()
  for (const bone of [headBone, chestBone, spineBone, hipsBone]) {
    if (bone) restQuats.set(bone, bone.quaternion.clone())
  }
  const hipsRestY = hipsBone?.position.y ?? 0

  // フレーミングにメッシュのバウンディングボックスを使わない: 頭上のリングや髪・
  // スカート等のアクセサリで実際の体格より大きくブレる(頭が画面下に沈む)。
  // 生ボーンの実座標からバストアップを組み、ボーンが無いモデルのみボックスに退避
  vrm.scene.updateMatrixWorld(true)
  const measureHead = vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Head)
  const measureHips = vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Hips)
  const fovHalfTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  const headTopMargin = cameraFraming?.headTopMargin ?? DEFAULT_HEAD_TOP_MARGIN
  const hipsBottomMargin = cameraFraming?.hipsBottomMargin ?? DEFAULT_HIPS_BOTTOM_MARGIN

  let focusHeight: number
  let cameraDistance: number
  if (measureHead && measureHips) {
    const headY = measureHead.getWorldPosition(new THREE.Vector3()).y
    const hipsY = measureHips.getWorldPosition(new THREE.Vector3()).y
    const top = headY + headTopMargin
    const bottom = hipsY - hipsBottomMargin
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

  const lookAtTarget = new THREE.Object3D()
  lookAtTarget.position.set(0, focusHeight, -LOOK_AT_DISTANCE)
  scene.add(lookAtTarget)
  if (vrm.lookAt) {
    vrm.lookAt.target = lookAtTarget
  }

  // pulse/dockモードのクリップ自体がexpressionsを持つため、この初期値はloop
  // モードとアニメーション無しのフォールバック時にのみ意味を持つ
  expressionManager?.setValue(VRMExpressionPresetName.Happy, 0.85)

  let mixer: THREE.AnimationMixer | undefined
  let dockLoopAction: THREE.AnimationAction | undefined
  let dockAction: THREE.AnimationAction | undefined
  let getDocked: (() => boolean) | undefined
  let isDocked = false
  let pulseIdleAction: THREE.AnimationAction | undefined
  let pulseAction: THREE.AnimationAction | undefined
  let getTriggerToken: (() => number) | undefined
  let lastTriggerToken: number | undefined

  async function loadClip(url: string): Promise<THREE.AnimationClip | undefined> {
    const animGltf = await loader.loadAsync(url)
    const vrmAnimation = (animGltf.userData.vrmAnimations as VRMAnimation[] | undefined)?.[0]
    return vrmAnimation ? createVRMAnimationClip(vrmAnimation, vrm) : undefined
  }

  if (!reducedMotion && motion) {
    try {
      if (motion.mode === "dock") {
        const [loopClip, dockClip] = await Promise.all([
          loadClip(motion.loopAnimationUrl),
          loadClip(motion.dockAnimationUrl),
        ])
        if (loopClip && dockClip) {
          mixer = new THREE.AnimationMixer(vrm.scene)
          dockLoopAction = mixer.clipAction(loopClip)
          dockLoopAction.play() // デフォルトが LoopRepeat のためループ指定は不要
          dockAction = mixer.clipAction(dockClip)
          dockAction.setLoop(THREE.LoopOnce, 1)
          dockAction.clampWhenFinished = true
          getDocked = motion.getDocked
        }
      } else if (motion.mode === "pulse") {
        const [idleClip, pulseClip] = await Promise.all([
          loadClip(motion.idleAnimationUrl),
          loadClip(motion.pulseAnimationUrl),
        ])
        if (idleClip && pulseClip) {
          mixer = new THREE.AnimationMixer(vrm.scene)
          pulseIdleAction = mixer.clipAction(idleClip)
          pulseIdleAction.play() // デフォルトが LoopRepeat のためループ指定は不要
          pulseAction = mixer.clipAction(pulseClip)
          pulseAction.setLoop(THREE.LoopOnce, 1)
          pulseAction.clampWhenFinished = true
          getTriggerToken = motion.getTriggerToken
          lastTriggerToken = motion.getTriggerToken()
          // ワンショットが最後まで再生し終えたら自動でidleへ戻す
          mixer.addEventListener("finished", (event) => {
            if (event.action !== pulseAction) return
            pulseIdleAction!.reset().play()
            pulseAction!.crossFadeTo(pulseIdleAction!, PULSE_CROSSFADE_SEC, false)
          })
        }
      } else {
        const clip = await loadClip(motion.animationUrl)
        if (clip) {
          mixer = new THREE.AnimationMixer(vrm.scene)
          const action = mixer.clipAction(clip)
          action.play() // デフォルトが LoopRepeat のためループ指定は不要
        }
      }
    } catch (error) {
      // アニメーション欠落はモデル表示を止める理由にならないため、throwしない
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
    // ループ停止中(reduced-motion / 画面外)はリサイズしても再描画されないため、ここで1回描く
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

  let blinkPhase = 0 // 0 = 待機中、>0 = まばたき経過秒
  let blinkCooldown = randomBlinkInterval()

  // blinkはどのモードでも独立して動く(体のポーズをクリップに委ねるモードでも
  // 表情モーフはミキサーのバインディング対象外なので競合しない)
  function updateBlink(delta: number) {
    if (!expressionManager) return
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

  // composeOnAnimatedPose: VRMA再生中はミキサーが決めた頭の姿勢に乗算合成する。
  // レスト基準で上書きするとVRMA側の頭の動きが消えるため
  function updatePointerFollow(delta: number, composeOnAnimatedPose: boolean) {
    // 線形lerpだとフレームレートで追従速度が変わるため、指数減衰にする
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
    updateBlink(delta)
  }

  function tick(now: number) {
    animationFrameId = requestAnimationFrame(tick)
    const delta = Math.min((now - lastTime) / 1000, MAX_DELTA_SEC)
    lastTime = now
    elapsed += delta

    if (pulseIdleAction && pulseAction && getTriggerToken) {
      const token = getTriggerToken()
      if (token !== lastTriggerToken) {
        lastTriggerToken = token
        // 前の演技が終わっていなくても打ち切って頭から再生し直す。3秒の演技を
        // 待たずカテゴリを連続で送られても都度反応できるようにするため
        pulseAction.reset().play()
        pulseIdleAction.crossFadeTo(pulseAction, PULSE_CROSSFADE_SEC, false)
      }
      mixer!.update(delta)
      // composeOnAnimatedPose=false(レスト基準)にする: dockモードと同じ理由
      // (pulseAnimationUrl側にheadのトラックが無い場合の頭部回転暴走対策)
      updatePointerFollow(delta, false)
      updateBlink(delta)
    } else if (dockLoopAction && dockAction && getDocked) {
      const wantDocked = getDocked()
      if (wantDocked !== isDocked) {
        isDocked = wantDocked
        // crossFadeToは呼び出し元(フェードアウト側)のactionに対して呼ぶ。
        // フェードイン側は事前にreset().play()して有効化しておく必要がある
        // (three-vrm-animationのTechStack実装と異なりここはスクロール同期不要な
        // 離散的な状態遷移なので、壁時計時間ベースのcrossFadeToで問題ない)
        if (isDocked) {
          dockAction.reset().play()
          dockLoopAction.crossFadeTo(dockAction, DOCK_CROSSFADE_SEC, false)
        } else {
          dockLoopAction.reset().play()
          dockAction.crossFadeTo(dockLoopAction, DOCK_CROSSFADE_SEC, false)
        }
      }
      mixer!.update(delta)
      // composeOnAnimatedPose=false(レスト基準)にする: dockAction(v-sign)側に
      // headのトラックが無い場合、mixer.update()はheadBoneに触れないため、
      // trueのまま毎フレームmultiplyすると前フレームの結果に乗算が積み重なり
      // 頭が際限なく回転し続けるバグになる。レスト基準で上書きすればクリップ側の
      // 頭の動きは犠牲になるが、この方が安全
      updatePointerFollow(delta, false)
      updateBlink(delta)
    } else if (mixer) {
      mixer.update(delta)
      updatePointerFollow(delta, true)
      updateBlink(delta)
    } else {
      updateIdleMotion(delta)
    }
    vrm.update(delta)
    renderer.render(scene, camera)
  }

  function startLoop() {
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

  // reduced-motion ではループを回さないため、この1フレームが最終表示になる。
  // vrm.update(0) を挟まないと立ちポーズ・表情が反映されない
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
