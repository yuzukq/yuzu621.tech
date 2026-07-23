"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import type { SkillCategory } from "@/data/skills"
import VrmFallback from "@/components/vrm/VrmFallback"
import SectionHeading from "./SectionHeading"

// three一式をこのセクションが画面内に来るまで初回ロードJSに含めない
const VrmScrubCanvas = dynamic(() => import("@/components/vrm/VrmScrubCanvas"), {
  ssr: false,
  loading: () => <VrmFallback />,
})

// 1カテゴリあたりに割り当てるスクロール量。小さいほどテンポが速くなる
const VH_PER_CATEGORY = 70
// 各カテゴリ区間のうち、後半何割を「次のカードへの遷移(アバターの演技)」に使うか。
// 残りの前半は静止して読める時間になる
const TRANSITION_BAND = 0.35
const CARD_ENTER_OFFSET_PX = 28

interface TechStackShowcaseProps {
  categories: SkillCategory[]
}

export default function TechStackShowcase({ categories }: TechStackShowcaseProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const progressLabelRef = useRef<HTMLParagraphElement>(null)
  // VrmScrubCanvas はこのrefを毎フレーム読むだけなので、更新してもReactの
  // 再レンダーは発生しない(60fps更新をReact stateで行うと重くなるため)
  const progressRef = useRef(0)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    let frame = 0

    function update() {
      frame = 0
      if (!wrapper) return

      const rect = wrapper.getBoundingClientRect()
      const pinnedDistance = wrapper.offsetHeight - window.innerHeight
      const scrolledIntoPin = -rect.top
      const globalProgress =
        pinnedDistance > 0
          ? Math.min(Math.max(scrolledIntoPin / pinnedDistance, 0), 1)
          : 0

      const categoryFloat = globalProgress * categories.length
      const currentIndex = Math.min(Math.floor(categoryFloat), categories.length - 1)
      const localT = categoryFloat - currentIndex
      const isLast = currentIndex === categories.length - 1

      const transitionStart = 1 - TRANSITION_BAND
      const transitionT = isLast
        ? 0
        : Math.min(Math.max((localT - transitionStart) / TRANSITION_BAND, 0), 1)

      // present-card.vrma はt=0とt=durationがどちらも同じ「休め」姿勢になる
      // よう設計してある。カテゴリの境目でこの値が1→0に飛んでも、見た目は
      // 同じ姿勢同士の切り替えなのでスナップして見えない
      progressRef.current = transitionT

      if (progressLabelRef.current) {
        const total = String(categories.length).padStart(2, "0")
        progressLabelRef.current.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${total}`
      }

      cardRefs.current.forEach((el, i) => {
        if (!el) return
        let opacity = 0
        let translateY = CARD_ENTER_OFFSET_PX
        if (i === currentIndex) {
          opacity = 1 - transitionT
        } else if (i === currentIndex + 1) {
          opacity = transitionT
          translateY = (1 - transitionT) * CARD_ENTER_OFFSET_PX
        }
        el.style.opacity = String(opacity)
        el.style.transform = `translateY(${translateY}px)`
        el.style.pointerEvents = opacity > 0.5 ? "auto" : "none"
      })
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
  }, [categories.length])

  return (
    <div
      ref={wrapperRef}
      style={{ height: `calc(${categories.length * VH_PER_CATEGORY}vh + 100dvh)` }}
    >
      {/* pt-20は他セクションの見出しがsticky headerの下に着地する余白(scroll-mt-20)と
          揃えている: 見出しブロックはshrink-0で常時表示し、アバター/カード列だけが
          残りの高さ(flex-1)内で中央寄せされる */}
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden pt-20">
        <div className="shrink-0">
          <SectionHeading eyebrow="Tech Stack" title="技術スタック" />
          <p className="wrap-phrase mt-6 text-ink-muted">
            これまでに勉強したり開発で触れてきた技術スタック・ツールを、カテゴリ別にまとめています。
          </p>
          <p
            ref={progressLabelRef}
            className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-ink-faint"
          >
            {`01 / ${String(categories.length).padStart(2, "0")}`}
          </p>
        </div>

        <div className="flex flex-1 items-center">
          {/* 親(TechStack.tsx)が既に max-w-6xl + px-4 md:px-8 を適用済みのため、
              ここでは幅制約を重ねない */}
          <div className="grid w-full grid-cols-[20rem_minmax(0,1fr)] items-center gap-12">
            <div className="aspect-square w-full">
              <VrmScrubCanvas progressRef={progressRef} />
            </div>

            <div className="relative h-80">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  ref={(el) => {
                    cardRefs.current[index] = el
                  }}
                  style={{ opacity: index === 0 ? 1 : 0 }}
                  className="absolute inset-0 flex flex-col rounded-2xl border border-border bg-surface p-6 will-change-[opacity,transform]"
                >
                  <h3 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
                    <span aria-hidden="true">#</span> {category.label}
                  </h3>

                  <ul className="mt-5 flex flex-wrap gap-2">
                    {category.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-lg border border-border bg-surface-hover px-3 py-1.5 text-sm text-ink"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>

                  {category.note && (
                    <p className="wrap-phrase mt-5 border-t border-border pt-4 text-sm leading-relaxed text-ink-muted">
                      {category.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
