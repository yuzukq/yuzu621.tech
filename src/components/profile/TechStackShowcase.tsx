"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import type { SkillCategory } from "@/data/skills"
import VrmFallback from "@/components/vrm/VrmFallback"
import SectionHeading from "./SectionHeading"

// three一式をこのセクションが画面内に来るまで初回ロードJSに含めない
const VrmTechStackCanvas = dynamic(() => import("@/components/vrm/VrmTechStackCanvas"), {
  ssr: false,
  loading: () => <VrmFallback />,
})

// 1カテゴリあたりに割り当てるスクロール量。小さいほどテンポが速くなる
const VH_PER_CATEGORY = 50
const CARD_ENTER_OFFSET_PX = 28
// カテゴリ境界ちょうどで往復スクロールされた時にトリガーが連打されるのを防ぐ
// ヒステリシス(カテゴリ1つぶんを1とした比率)
const BOUNDARY_HYSTERESIS = 0.06
// カード切り替えとワンショットアニメーションは境界を跨いだ瞬間に同時開始する。
const CARD_EXIT_DURATION_MS = 350
const CARD_ENTER_DURATION_MS = 500
const CARD_ENTER_DELAY_MS = 0

interface TechStackShowcaseProps {
  categories: SkillCategory[]
}

export default function TechStackShowcase({ categories }: TechStackShowcaseProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const displayedIndexRef = useRef(0)
  // VrmTechStackCanvas はこのrefを毎フレーム読むだけなので、更新してもReactの
  // 再レンダーは発生しない(60fps更新をReact stateで行うと重くなるため)。値が
  // 変わるたびpresent-card.vrmaを頭から再生し直すトリガーカウンタとして使う
  const triggerTokenRef = useRef(0)

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
      const rawIndex = Math.min(Math.floor(categoryFloat), categories.length - 1)

      const prevDisplayed = displayedIndexRef.current
      let nextDisplayed = prevDisplayed
      if (rawIndex > prevDisplayed) {
        // 1つ先の境界をヒステリシスぶん越えるまでは確定させない。2つ以上先へ
        // 一気にスクロールされた場合はヒステリシスを待たず即座に追従する
        nextDisplayed =
          rawIndex - prevDisplayed > 1 || categoryFloat - rawIndex >= BOUNDARY_HYSTERESIS
            ? rawIndex
            : prevDisplayed
      } else if (rawIndex < prevDisplayed) {
        nextDisplayed =
          prevDisplayed - rawIndex > 1 || prevDisplayed - categoryFloat >= BOUNDARY_HYSTERESIS
            ? rawIndex
            : prevDisplayed
      }

      if (nextDisplayed === prevDisplayed) return
      displayedIndexRef.current = nextDisplayed
      triggerTokenRef.current += 1

      cardRefs.current.forEach((el, i) => {
        if (!el) return
        if (i === nextDisplayed) {
          el.style.transitionDelay = `${CARD_ENTER_DELAY_MS}ms`
          el.style.transitionDuration = `${CARD_ENTER_DURATION_MS}ms`
          el.style.opacity = "1"
          el.style.transform = "translateY(0px)"
          el.style.pointerEvents = "auto"
        } else {
          el.style.transitionDelay = "0ms"
          el.style.transitionDuration = `${CARD_EXIT_DURATION_MS}ms`
          el.style.opacity = "0"
          el.style.transform = `translateY(${CARD_ENTER_OFFSET_PX}px)`
          el.style.pointerEvents = "none"
        }
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
        </div>

        <div className="flex flex-1 items-center">
          {/* 親(TechStack.tsx)が既に max-w-6xl + px-4 md:px-8 を適用済みのため、
              ここでは幅制約を重ねない。列幅はHeroのアバター(max-w-sm=24rem)に揃えた */}
          <div className="grid w-full grid-cols-[24rem_minmax(0,1fr)] items-center gap-12">
            <div className="aspect-square w-full">
              <VrmTechStackCanvas triggerTokenRef={triggerTokenRef} />
            </div>

            <div className="relative h-80">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  ref={(el) => {
                    cardRefs.current[index] = el
                  }}
                  style={{ opacity: index === 0 ? 1 : 0 }}
                  className="absolute inset-0 flex flex-col rounded-2xl border border-border bg-surface p-6 transition-[opacity,transform] ease-out will-change-[opacity,transform]"
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
