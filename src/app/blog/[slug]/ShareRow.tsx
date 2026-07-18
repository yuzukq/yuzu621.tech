"use client"

import { useEffect, useRef, useState } from "react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { FaTwitter, FaLink } from "react-icons/fa"

interface ShareRowProps {
  title: string
}

export default function ShareRow({ title }: ShareRowProps) {
  const pathname = usePathname()
  const [message, setMessage] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const getShareUrl = () => {
    if (typeof window === "undefined") return pathname || "/"
    return `${window.location.origin}${pathname || "/"}`
  }

  const showMessage = (text: string) => {
    setMessage(text)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setMessage(null), 2500)
  }

  const handleShareTwitter = () => {
    const url = getShareUrl()
    const intent = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    window.open(intent, "_blank", "noopener,noreferrer")
  }

  const handleCopyLink = async () => {
    const text = getShareUrl()
    try {
      if (!navigator?.clipboard?.writeText) throw new Error("Clipboard API unsupported")
      await navigator.clipboard.writeText(text)
      showMessage("リンクをコピーしました")
    } catch {
      showMessage("コピーに失敗しました。お手数ですが手動でコピーしてください")
    }
  }

  return (
    <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
      <NextLink
        href="/"
        role="button"
        className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors duration-200 hover:border-border-strong hover:text-accent"
      >
        一覧に戻る
      </NextLink>

      <div className="flex items-center gap-3">
        {message && (
          <span role="status" className="text-xs text-ink-muted">
            {message}
          </span>
        )}
        <button
          type="button"
          aria-label="Share on Twitter"
          onClick={handleShareTwitter}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-ink-muted transition-colors duration-200 hover:border-border-strong hover:text-accent"
        >
          <FaTwitter />
        </button>
        <button
          type="button"
          aria-label="Copy link"
          onClick={handleCopyLink}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-ink-muted transition-colors duration-200 hover:border-border-strong hover:text-accent"
        >
          <FaLink />
        </button>
      </div>
    </div>
  )
}
