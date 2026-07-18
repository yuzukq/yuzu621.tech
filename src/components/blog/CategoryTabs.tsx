"use client"

import NextLink from "next/link"
import type { BlogCategory } from "@/lib/posts"

interface CategoryTabsProps {
  currentCategory: BlogCategory
}

const TABS: { value: BlogCategory; label: string }[] = [
  { value: "tech", label: "技術関連" },
  { value: "daily", label: "日常" },
]

export default function CategoryTabs({ currentCategory }: CategoryTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
      {TABS.map((tab) => {
        const active = tab.value === currentCategory
        return (
          <NextLink
            key={tab.value}
            href={`/?category=${tab.value}`}
            scroll={false}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
              active ? "bg-accent text-bg" : "text-ink-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </NextLink>
        )
      })}
    </div>
  )
}
