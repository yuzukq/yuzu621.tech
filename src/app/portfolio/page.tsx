import type { Metadata } from "next"
import Footer from "@/components/layouts/Footer"
import WorldSync from "@/components/blog/WorldSync"
import PortfolioHeader from "@/components/portfolio/PortfolioHeader"
import Hero from "@/components/portfolio/Hero"
import About from "@/components/portfolio/About"
import Products from "@/components/portfolio/Products"
import Skills from "@/components/portfolio/Skills"
import {
  SITE_TITLE,
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE_PATH,
  buildPersonJsonLd,
  jsonLdScriptProps,
} from "@/lib/seo"

// GitHub / Discord は Hero.tsx・Footer.tsx で実際に使われている連絡先URLをそのまま転用する
// (架空のURLを sameAs に追加しない)。mailto はプロフィールURLではないため sameAs には含めない。
const SAME_AS = ["https://github.com/yuzukq", "https://discord.gg/8HPdqbZF"]

export const metadata: Metadata = {
  // トップ相当のページなので絶対タイトルを明示する(ルートlayoutのtemplateを適用しない)。
  title: { absolute: SITE_TITLE },
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/portfolio" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/portfolio",
    images: [{ url: DEFAULT_OG_IMAGE_PATH }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
}

// ポートフォリオは常に tech 世界(DESIGN.md §1)固定。ブログの WorldSync を
// 流用し、<html data-world> をこのページの世界観に明示的に同期させる。
export default function PortfolioPage() {
  const personJsonLd = buildPersonJsonLd({ sameAs: SAME_AS })

  return (
    <div data-world="tech" className="flex min-h-dvh flex-col bg-bg">
      <WorldSync world="tech" />
      <script {...jsonLdScriptProps(personJsonLd)} />
      <PortfolioHeader />
      <main className="flex-1">
        <Hero />
        <About />
        <Products />
        <Skills />
      </main>
      <Footer />
    </div>
  )
}
