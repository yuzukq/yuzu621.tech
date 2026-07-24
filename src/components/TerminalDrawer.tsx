"use client"

import { useEffect, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { FiMenu, FiX } from "react-icons/fi"
import ThemeToggle from "@/components/ThemeToggle"

interface TerminalDrawerProps {
  openLabel: string
  closeLabel: string
  dialogLabel: string
  breakpointClass: "md:hidden" | "xl:hidden"
  triggerContainerClassName?: string
  children: (close: () => void) => ReactNode
}

// MobileNav(profile)とMobileToc(blog)が共有するドロワーシャーシ。
// リスト部(children)だけが呼び出し元ごとに異なる
export default function TerminalDrawer({
  openLabel,
  closeLabel,
  dialogLabel,
  breakpointClass,
  triggerContainerClassName,
  children,
}: TerminalDrawerProps) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

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
    <div className={triggerContainerClassName ?? breakpointClass}>
      <button
        type="button"
        aria-label={openLabel}
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
            aria-label={dialogLabel}
            className={`fixed inset-0 z-50 ${breakpointClass}`}
          >
            <div
              aria-hidden="true"
              onClick={close}
              className="animate-backdrop-in absolute inset-0 bg-black/70"
            />

            <div className="animate-drawer-in absolute inset-y-0 right-0 flex w-[85%] max-w-xs flex-col border-l border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-3 font-mono text-xs text-ink-muted">
                <span>
                  <span className="text-accent">$</span> index
                </span>
                <button
                  type="button"
                  aria-label={closeLabel}
                  onClick={close}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-200 hover:bg-surface-hover hover:text-accent"
                >
                  <FiX size={18} />
                </button>
              </div>

              {children(close)}

              <div className="flex items-center justify-between border-t border-border px-4 py-2 font-mono text-[11px] text-ink-faint">
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-border bg-surface-hover px-1.5 py-0.5 text-ink-muted">
                    esc
                  </kbd>
                  <span>close</span>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
