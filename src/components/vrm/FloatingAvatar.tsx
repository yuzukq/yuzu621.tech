"use client"

import { useEffect, useRef, type RefObject } from "react"
import { createVrmScene, type VrmSceneHandle } from "./createVrmScene"
import { computeTravelProgress, nextDockedState } from "./avatarTravel"

const MODEL_URL = "/models/avatar.vrm"
const LOOP_ANIMATION_URL = "/models/loop_verse.vrma"
const DOCK_ANIMATION_URL = "/models/v-sign.vrma"

interface FloatingAvatarProps {
  heroSlotRef: RefObject<HTMLDivElement | null>
  aboutSlotRef: RefObject<HTMLDivElement | null>
  /** setState由来の安定した関数を渡す(effectの依存配列を汚さないため) */
  onReady: (ready: boolean) => void
}

// Hero・About共通の1体のアバターをposition:fixedで重ね、Hero側スロットの矩形を
// 基準位置にしてAbout側スロットの矩形までtransform: translate + scaleだけで
// 追従させる(FLIP的な手法)。canvas自体の実サイズ(clientWidth/Height)は変えない:
// createVrmSceneのResizeObserverがそこでカメラを再計算するため、動かすたびに
// カメラが暴れてしまう
export default function FloatingAvatar({ heroSlotRef, aboutSlotRef, onReady }: FloatingAvatarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dockedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    let cancelled = false
    let handle: VrmSceneHandle | undefined

    createVrmScene({
      canvas,
      container: wrapper,
      modelUrl: MODEL_URL,
      motion: {
        mode: "dock",
        loopAnimationUrl: LOOP_ANIMATION_URL,
        dockAnimationUrl: DOCK_ANIMATION_URL,
        getDocked: () => dockedRef.current,
      },
    })
      .then((sceneHandle) => {
        if (cancelled) {
          sceneHandle.dispose()
          return
        }
        handle = sceneHandle
        onReady(true)
      })
      .catch((error: unknown) => {
        // モデル未配置は正常系のため error にしない(他のVRMキャンバスと同じ方針)
        console.info("[vrm] Hero/About間のアバターを読み込めませんでした。", error)
      })

    return () => {
      cancelled = true
      handle?.dispose()
    }
  }, [onReady])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    let frame = 0

    function update() {
      frame = 0
      const heroEl = heroSlotRef.current
      const aboutEl = aboutSlotRef.current
      const aboutSection = document.getElementById("about")
      if (!wrapper || !heroEl || !aboutEl || !aboutSection) return

      const heroRect = heroEl.getBoundingClientRect()
      const aboutRect = aboutEl.getBoundingClientRect()
      // 進捗はaboutスロット(見出し分オフセットされていて0に到達しない)ではなく
      // セクション自身の絶対位置から計算する(avatarTravel.tsのコメント参照)
      const aboutSectionDocTop = aboutSection.getBoundingClientRect().top + window.scrollY
      const progress = computeTravelProgress(window.scrollY, aboutSectionDocTop)
      dockedRef.current = nextDockedState(progress, dockedRef.current)

      // 基準位置は常にHeroスロット。transformはそこからAboutスロットへの差分を
      // progressぶんだけ適用する(progress=0でHeroに一致、1でAboutに一致)
      wrapper.style.left = `${heroRect.left}px`
      wrapper.style.top = `${heroRect.top}px`
      wrapper.style.width = `${heroRect.width}px`
      wrapper.style.height = `${heroRect.height}px`

      const dx = (aboutRect.left - heroRect.left) * progress
      const dy = (aboutRect.top - heroRect.top) * progress
      const scale = heroRect.width > 0 ? 1 + (aboutRect.width / heroRect.width - 1) * progress : 1
      wrapper.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`
    }

    function onScrollOrResize() {
      if (frame === 0) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScrollOrResize, { passive: true })
    window.addEventListener("resize", onScrollOrResize)
    return () => {
      window.removeEventListener("scroll", onScrollOrResize)
      window.removeEventListener("resize", onScrollOrResize)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [heroSlotRef, aboutSlotRef])

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pointer-events-none fixed z-10 origin-top-left"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
