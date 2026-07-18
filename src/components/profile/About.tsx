import Image from "next/image"
import NextLink from "next/link"
import { aboutMe } from "@/data/aboutme"
import FadeIn from "./FadeIn"
import SectionHeading from "./SectionHeading"

export default function About() {
  return (
    <section id="about" className="scroll-mt-20 border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <SectionHeading eyebrow="About" title="自己紹介" />

        <FadeIn className="mt-12 flex flex-col items-center gap-10 md:flex-row md:items-start">
          <div className="relative h-[220px] w-[220px] flex-shrink-0 overflow-hidden rounded-full border-4 border-border md:h-[260px] md:w-[260px]">
            <Image
              src={aboutMe.icon}
              alt="Profile Icon"
              fill
              className="object-cover"
              sizes="260px"
            />
          </div>

          <div className="flex-1">
            <p className="wrap-phrase whitespace-pre-line text-lg leading-loose text-ink-muted">
              {aboutMe.description}
            </p>

            <NextLink
              href="/"
              role="button"
              className="mt-8 inline-block rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-ink transition-colors duration-200 hover:border-border-strong hover:text-accent"
            >
              ブログを読む
            </NextLink>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
