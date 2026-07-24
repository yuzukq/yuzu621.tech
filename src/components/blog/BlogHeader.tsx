import NextLink from "next/link"
import type { TocItem } from "@/lib/markdown"
import MobileToc from "./MobileToc"

interface BlogHeaderProps {
  /** list: 一覧ページ(Profileリンクのみ)。article: 記事ページ(ナビリンク無し、モバイル目次トリガーのみ) */
  variant?: "list" | "article"
  toc?: TocItem[]
}

export default function BlogHeader({ variant = "list", toc }: BlogHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 md:px-8">
        <NextLink
          href="/"
          className="font-display text-lg font-bold tracking-tight text-ink transition-opacity duration-200 hover:opacity-80"
        >
          Yuzuのブログ
        </NextLink>

        {variant === "list" && (
          <nav className="ml-auto flex items-center gap-1">
            <NextLink
              href="/profile"
              className="rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
            >
              Profile
            </NextLink>
          </nav>
        )}

        {variant === "article" && toc && (
          <div className="ml-auto">
            <MobileToc items={toc} />
          </div>
        )}
      </div>
    </header>
  )
}
