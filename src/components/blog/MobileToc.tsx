"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { FiMenu, FiX } from "react-icons/fi"
import type { TocItem } from "@/lib/markdown"
import { normalizeToc } from "./TableOfContents"

// デスクトップ側の目次(TableOfContents.tsx)は xl 以上で常時表示のサイドバーの
// ため、このトリガーは xl 未満だけに出す。プロフィールページの
// MobileNav.tsx と同じポータル+開閉モーダルの意匠を踏襲(header の
// backdrop-blur-md が position:fixed の包含ブロックになる問題も同様)
export default function MobileToc({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false)
  const entries = normalizeToc(items)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  if (entries.length === 0) return null

  let sectionNumber = 0

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label="目次を開く"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors duration-200 hover:text-accent"
      >
        <FiMenu size={22} />
      </button>

      {open &&
        createPortal(
          <div role="dialog" aria-modal="true" aria-label="目次" className="fixed inset-0 z-50 xl:hidden">
            <div
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className="animate-backdrop-in absolute inset-0 bg-black/70"
            />

            <div className="animate-drawer-in absolute inset-y-0 right-0 flex w-[85%] max-w-xs flex-col border-l border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-3 font-mono text-xs text-ink-muted">
                <span>
                  <span className="text-accent">$</span> index
                </span>
                <button
                  type="button"
                  aria-label="目次を閉じる"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-200 hover:bg-surface-hover hover:text-accent"
                >
                  <FiX size={18} />
                </button>
              </div>

              <nav aria-label="目次" className="flex flex-1 flex-col overflow-y-auto py-2">
                {entries.map((entry, index) => {
                  if (!entry.isSub) sectionNumber++
                  return (
                    <a
                      key={`${entry.id}-${index}`}
                      href={`#${entry.id}`}
                      onClick={() => setOpen(false)}
                      className={`flex items-baseline gap-3 border-l-2 border-transparent py-3 text-base text-ink-muted transition-colors duration-150 hover:border-accent hover:bg-surface-hover hover:text-ink active:bg-accent/10 ${
                        entry.isSub ? "pl-9 pr-4" : "px-4"
                      }`}
                    >
                      {!entry.isSub && (
                        <span className="shrink-0 font-mono text-xs text-ink-faint">
                          {String(sectionNumber).padStart(2, "0")}
                        </span>
                      )}
                      <span className="min-w-0 truncate">{entry.text}</span>
                    </a>
                  )
                })}
              </nav>

              <div className="flex items-center gap-2 border-t border-border px-4 py-2.5 font-mono text-[11px] text-ink-faint">
                <kbd className="rounded border border-border bg-surface-hover px-1.5 py-0.5 text-ink-muted">
                  esc
                </kbd>
                <span>close</span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
