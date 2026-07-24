"use client"

import NextLink from "next/link"
import TerminalDrawer from "@/components/TerminalDrawer"

interface NavItem {
  href: string
  label: string
}

export default function MobileNav({ items }: { items: NavItem[] }) {
  return (
    <TerminalDrawer
      openLabel="メニューを開く"
      closeLabel="メニューを閉じる"
      dialogLabel="Page index"
      breakpointClass="md:hidden"
      triggerContainerClassName="ml-auto md:hidden"
    >
      {(close) => (
        <nav className="flex flex-1 flex-col overflow-y-auto py-2">
          {items.map((item, index) => (
            <NextLink
              key={item.href}
              href={item.href}
              onClick={close}
              className="flex items-baseline gap-3 border-l-2 border-transparent px-4 py-3 text-base text-ink-muted transition-colors duration-150 hover:border-accent hover:bg-surface-hover hover:text-ink active:bg-accent/10"
            >
              <span className="shrink-0 font-mono text-xs text-ink-faint">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item.label}</span>
            </NextLink>
          ))}
        </nav>
      )}
    </TerminalDrawer>
  )
}
