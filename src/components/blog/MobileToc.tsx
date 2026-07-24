"use client"

import TerminalDrawer from "@/components/TerminalDrawer"
import type { TocItem } from "@/lib/markdown"
import { normalizeToc } from "./TableOfContents"

// デスクトップ側の目次(TableOfContents.tsx)は xl 以上で常時表示のサイドバーの
// ため、このトリガーは xl 未満だけに出す
export default function MobileToc({ items }: { items: TocItem[] }) {
  const entries = normalizeToc(items)

  if (entries.length === 0) return null

  return (
    <TerminalDrawer
      openLabel="目次を開く"
      closeLabel="目次を閉じる"
      dialogLabel="目次"
      breakpointClass="xl:hidden"
    >
      {(close) => {
        // TerminalDrawerがopen状態を保持するため、開くたびにこのrender propが
        // 再実行される。sectionNumberをここで宣言することで再オープン時に
        // 番号がリセットされる(MobileToc自体はopen中も再レンダリングされない)
        let sectionNumber = 0
        return (
          <nav aria-label="目次" className="flex flex-1 flex-col overflow-y-auto py-2">
            {entries.map((entry, index) => {
              if (!entry.isSub) sectionNumber++
              return (
                <a
                  key={`${entry.id}-${index}`}
                  href={`#${entry.id}`}
                  onClick={close}
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
        )
      }}
    </TerminalDrawer>
  )
}
