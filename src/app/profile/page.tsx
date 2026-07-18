import type { Metadata } from "next"
import Footer from "@/components/layouts/Footer"
import WorldSync from "@/components/blog/WorldSync"
import ProfileHeader from "@/components/profile/ProfileHeader"
import Hero from "@/components/profile/Hero"
import About from "@/components/profile/About"
import Products from "@/components/profile/Products"
import TechStack from "@/components/profile/TechStack"
import {
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
  title: "Profile",
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/profile" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    title: `Profile | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    url: "/profile",
    images: [{ url: DEFAULT_OG_IMAGE_PATH }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Profile | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
}

// プロフィールは常に tech 世界(DESIGN.md §1)固定。ブログの WorldSync を
// 流用し、<html data-world> をこのページの世界観に明示的に同期させる。
export default function ProfilePage() {
  const personJsonLd = buildPersonJsonLd({ sameAs: SAME_AS })

  return (
    <div data-world="tech" className="flex min-h-dvh flex-col bg-bg">
      <WorldSync world="tech" />
      <script {...jsonLdScriptProps(personJsonLd)} />
      <ProfileHeader />
      <main className="flex-1">
        <Hero />
        <About />
        <Products />
        <TechStack />
      </main>
      <Footer />
    </div>
  )
}
