import NextLink from "next/link"
import MobileNav from "./MobileNav"

// ブログの BlogHeader と世界観を揃えたポートフォリオ用ヘッダー
// (sticky + backdrop-blur + 下辺ボーダー、DESIGN.md §4)。
const NAV_ITEMS = [
  { href: "#about", label: "About" },
  { href: "#products", label: "Products" },
  { href: "#skills", label: "Skills" },
  { href: "/", label: "Blog" },
]

export default function PortfolioHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 md:px-8">
        <NextLink
          href="#hero"
          className="font-display text-lg font-bold tracking-tight text-ink transition-opacity duration-200 hover:opacity-80"
        >
          Yuzu
        </NextLink>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NextLink
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
            >
              {item.label}
            </NextLink>
          ))}
        </nav>

        <MobileNav items={NAV_ITEMS} />
      </div>
    </header>
  )
}
