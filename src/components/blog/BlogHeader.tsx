import NextLink from "next/link"

export default function BlogHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 md:px-8">
        <NextLink
          href="/"
          className="font-display text-lg font-bold tracking-tight text-ink transition-opacity duration-200 hover:opacity-80"
        >
          Yuzuのブログ
        </NextLink>

        <nav className="ml-auto flex items-center gap-1">
          <NextLink
            href="/"
            className="rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
          >
            Blog
          </NextLink>
          <NextLink
            href="/profile"
            className="rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
          >
            Profile
          </NextLink>
        </nav>
      </div>
    </header>
  )
}
