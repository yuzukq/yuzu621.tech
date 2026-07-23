"use client"

import { useEffect, useRef } from "react"
import NextLink from "next/link"
import AboutAvatarDock from "@/components/vrm/AboutAvatarDock"
import { useAvatarTravel } from "@/components/vrm/AvatarTravelContext"
import { computeTextOpacity, computeTravelProgress } from "@/components/vrm/avatarTravel"
import FadeIn from "./FadeIn"
import SectionHeading from "./SectionHeading"
import SpeechBubble from "./SpeechBubble"

interface AboutIntroProps {
  description: string
}

const BLOG_LINK_CLASS =
  "mt-8 inline-block rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-ink transition-colors duration-200 hover:border-border-strong hover:text-accent"

export default function AboutIntro({ description }: AboutIntroProps) {
  const travel = useAvatarTravel()
  const showcase = travel?.showcase ?? false
  const headingRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  // 見出し・吹き出しの2Dテキストは、アバターがHeroからAboutへ移動しきる直前に
  // フェードインする(FadeInのIntersectionObserverではなく、FloatingAvatarと
  // 同じ移動進捗を使う)。逆方向(About→Hero)にスクロールした場合も同じ式で
  // 自然にフェードアウトする
  useEffect(() => {
    if (!showcase || !travel) return
    const heading = headingRef.current
    const text = textRef.current
    if (!heading || !text) return

    let frame = 0

    function update() {
      frame = 0
      // 進捗はaboutスロット(見出し分オフセットされていて0に到達しない)ではなく
      // セクション自身の絶対位置から計算する(avatarTravel.tsのコメント参照)
      const aboutSection = document.getElementById("about")
      if (!aboutSection || !heading || !text) return
      const aboutSectionDocTop = aboutSection.getBoundingClientRect().top + window.scrollY
      const progress = computeTravelProgress(window.scrollY, aboutSectionDocTop)
      const opacity = String(computeTextOpacity(progress))
      heading.style.opacity = opacity
      text.style.opacity = opacity
    }

    function onScrollOrResize() {
      if (frame === 0) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScrollOrResize, { passive: true })
    window.addEventListener("resize", onScrollOrResize)
    return () => {
      window.removeEventListener("scroll", onScrollOrResize)
      window.removeEventListener("resize", onScrollOrResize)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [showcase, travel])

  if (!showcase) {
    return (
      <>
        <SectionHeading eyebrow="About" title="自己紹介" />
        <FadeIn className="mt-12 flex flex-col items-center gap-10 md:flex-row md:items-start">
          <AboutAvatarDock />
          <div className="flex-1">
            <p className="wrap-phrase whitespace-pre-line text-lg leading-loose text-ink-muted">
              {description}
            </p>
            <NextLink href="/" role="button" className={BLOG_LINK_CLASS}>
              ブログを読む
            </NextLink>
          </div>
        </FadeIn>
      </>
    )
  }

  return (
    <>
      <div ref={headingRef} style={{ opacity: 0 }}>
        <SectionHeading eyebrow="About" title="自己紹介" />
      </div>

      <div className="mt-12 flex flex-col items-center gap-10 md:flex-row md:items-start">
        <AboutAvatarDock />
        <div ref={textRef} className="flex-1" style={{ opacity: 0 }}>
          <SpeechBubble>{description}</SpeechBubble>
          <NextLink href="/" role="button" className={BLOG_LINK_CLASS}>
            ブログを読む
          </NextLink>
        </div>
      </div>
    </>
  )
}
