import type { Metadata } from "next"
import Footer from "@/components/layouts/Footer"
import WorldSync from "@/components/blog/WorldSync"
import ScrollSnapSync from "@/components/profile/ScrollSnapSync"
import ProfileHeader from "@/components/profile/ProfileHeader"
import Hero from "@/components/profile/Hero"
import About from "@/components/profile/About"
import Products from "@/components/profile/Products"
import TechStack from "@/components/profile/TechStack"
import AvatarTravelProvider from "@/components/vrm/AvatarTravelContext"
import {
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE_PATH,
  buildPersonJsonLd,
  jsonLdScriptProps,
} from "@/lib/seo"

// sameAs は実在の連絡先(Hero/Footerと同一URL)のみ。mailto はプロフィールURLではないため含めない
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

export default function ProfilePage() {
  const personJsonLd = buildPersonJsonLd({ sameAs: SAME_AS })

  return (
    <div data-world="tech" className="flex min-h-dvh flex-col bg-bg">
      <WorldSync world="tech" />
      <ScrollSnapSync />
      <script {...jsonLdScriptProps(personJsonLd)} />
      <ProfileHeader />
      <main className="flex-1">
        <AvatarTravelProvider>
          <Hero />
          <About />
        </AvatarTravelProvider>
        <Products />
        <TechStack />
      </main>
      <Footer />
    </div>
  )
}
