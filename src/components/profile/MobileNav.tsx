"use client"

import { useState } from "react"
import NextLink from "next/link"
import { FiMenu, FiX } from "react-icons/fi"

interface NavItem {
  href: string
  label: string
}

export default function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)

  if (!open) {
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
      </div>
    )
  }

  return (
    <div className="ml-auto md:hidden">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Page index"
        className="fixed inset-0 z-50 flex flex-col bg-bg/95 backdrop-blur-md"
      >
        <div className="flex justify-end px-4 py-4">
          <button
            type="button"
            aria-label="メニューを閉じる"
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors duration-200 hover:text-accent"
          >
            <FiX size={22} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col items-center justify-center gap-8">
          {items.map((item) => (
            <NextLink
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-display text-2xl font-medium text-ink transition-colors duration-200 hover:text-accent"
            >
              {item.label}
            </NextLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
