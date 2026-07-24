"use client"

// 記事目次。クリックにJSスクロールを実装しない: 素のアンカー遷移に
// html { scroll-behavior: smooth } が効くため。
import { useEffect, useMemo, useRef, useState } from "react"
import type { TocItem } from "@/lib/markdown"

// 記事は h1 始まりにも h2 始まりにもなるため、絶対深度ではなく
// 最浅レベル基準の相対2階層に正規化する
export function normalizeToc(items: TocItem[]): Array<TocItem & { isSub: boolean }> {
  if (items.length === 0) return []
  const minDepth = Math.min(...items.map((i) => i.depth))
  return items
    .filter((i) => i.depth <= minDepth + 1)
    .map((i) => ({ ...i, isSub: i.depth !== minDepth }))
}

// sticky ヘッダーの高さぶん下げないと、ヘッダー裏の見出しが「現在」扱いにならない
const SPY_OFFSET_PX = 96

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const entries = useMemo(() => normalizeToc(items), [items])
  const [activeIndex, setActiveIndex] = useState(-1)
  const activeIndexRef = useRef(-1)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (entries.length === 0) return

    const headings = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null)

    let frame = 0
    const spy = () => {
      frame = 0
      let current = -1
      for (let i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top <= SPY_OFFSET_PX) {
          current = i
        } else {
          break
        }
      }
      if (current !== activeIndexRef.current) {
        activeIndexRef.current = current
        setActiveIndex(current)
        // 目次自体が overflow スクロールするため、アクティブ項目を可視範囲に保つ
        navRef.current
          ?.querySelector(`[data-toc-index="${current}"]`)
          ?.scrollIntoView({ block: "nearest" })
      }
    }
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(spy)
    }
    spy()
    window.addEventListener("scroll", onScroll, { passive: true })

    const jumpTo = (index: number) => {
      const el = headings[index]
      if (!el) return
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" })
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return

      if (e.key === "k") {
        jumpTo(Math.min(activeIndexRef.current + 1, headings.length - 1))
        e.preventDefault()
      } else if (e.key === "j") {
        if (activeIndexRef.current <= 0) {
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
          window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
        } else {
          jumpTo(activeIndexRef.current - 1)
        }
        e.preventDefault()
      }
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("keydown", onKeyDown)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [entries])

  if (entries.length === 0) return null

  let sectionNumber = 0

  return (
    <nav
      aria-label="目次"
      className="rounded-2xl border border-border bg-surface"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3 font-mono text-xs text-ink-muted">
        <span>
          <span className="text-accent">$</span> index
        </span>
        <span className="text-ink-faint">{entries.length} sections</span>
      </div>

      <div ref={navRef} className="max-h-[60vh] overflow-y-auto py-2">
        {entries.map((entry, index) => {
          const isActive = index === activeIndex
          if (!entry.isSub) sectionNumber++
          return (
            <a
              key={`${entry.id}-${index}`}
              href={`#${entry.id}`}
              data-toc-index={index}
              aria-current={isActive ? "true" : undefined}
              className={`flex items-baseline gap-2 border-l-2 py-1.5 pr-4 text-sm leading-snug transition-colors duration-150 ${
                entry.isSub ? "pl-9" : "pl-4"
              } ${
                isActive
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-transparent text-ink-muted hover:bg-surface-hover hover:text-ink"
              }`}
            >
              {!entry.isSub && (
                <span
                  className={`shrink-0 font-mono text-xs ${isActive ? "text-accent" : "text-ink-faint"}`}
                >
                  {String(sectionNumber).padStart(2, "0")}
                </span>
              )}
              <span className="min-w-0 truncate">{entry.text}</span>
            </a>
          )
        })}
      </div>

      <div className="flex items-center gap-2 border-t border-border px-4 py-2.5 font-mono text-[11px] text-ink-faint">
        <kbd className="rounded border border-border bg-surface-hover px-1.5 py-0.5 text-ink-muted">j</kbd>
        <kbd className="rounded border border-border bg-surface-hover px-1.5 py-0.5 text-ink-muted">k</kbd>
        <span>↕ navigation</span>
      </div>
    </nav>
  )
}
