import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Not Found",
}

// 見出し文言は Next.js 標準404と同一に保つ(notfound.spec.ts がこの
// アクセシブルネームで検証しているため、変える場合はテストも更新する)。
export default function NotFound() {
  return (
    <div
      data-world="tech"
      className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 text-center"
    >
      <h1 className="font-display text-7xl font-bold text-accent md:text-8xl">404</h1>
      <h2 className="mt-4 text-lg font-bold text-ink md:text-xl">
        This page could not be found.
      </h2>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm text-ink-muted transition-colors duration-200 hover:border-border-strong hover:text-accent"
      >
        トップへ戻る
      </Link>
    </div>
  )
}
