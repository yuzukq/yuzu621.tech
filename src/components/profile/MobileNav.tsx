"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import NextLink from "next/link"
import { FiMenu, FiX } from "react-icons/fi"

interface NavItem {
  href: string
  label: string
}

export default function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)

  // Escapeで閉じる: 同じ並びのProductDetailOverlay.tsxと挙動を揃える
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <div className="ml-auto md:hidden">
      <button
        type="button"
        aria-label="メニューを開く"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors duration-200 hover:text-accent"
      >
        <FiMenu size={22} />
      </button>

      {open &&
        createPortal(
          // ヘッダーのbackdrop-blur-mdがposition:fixedの包含ブロックになってしまい
          // 画面全体を覆えなくなる(ヘッダーの高さに押し込められる)ため、
          // document.bodyへポータルで抜け出す。開く時だけアニメーションし、閉じる
          // のは即座にunmountする(このコンポーネント自体がopen=falseで早期returnする
          // ため、閉じるアニメーションは別途用意しない)
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Page index"
            className="fixed inset-0 z-50 md:hidden"
          >
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
                  aria-label="メニューを閉じる"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-200 hover:bg-surface-hover hover:text-accent"
                >
                  <FiX size={18} />
                </button>
              </div>

              <nav className="flex flex-1 flex-col overflow-y-auto py-2">
                {items.map((item, index) => (
                  <NextLink
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-3 border-l-2 border-transparent px-4 py-3 text-base text-ink-muted transition-colors duration-150 hover:border-accent hover:bg-surface-hover hover:text-ink active:bg-accent/10"
                  >
                    <span className="shrink-0 font-mono text-xs text-ink-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{item.label}</span>
                  </NextLink>
                ))}
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
