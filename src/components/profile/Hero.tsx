import { FaDiscord, FaGithub } from "react-icons/fa"
import VrmHeroSlot from "@/components/vrm/VrmHeroSlot"
import FadeIn from "./FadeIn"

// Footer.tsx と同じ実在の連絡先URLを使う(プロフィールのリンク切れ防止のため勝手に増やさない)
const SOCIAL_LINKS = [
  { href: "https://github.com/yuzukq", label: "GitHub", Icon: FaGithub },
  { href: "https://discord.gg/8HPdqbZF", label: "Discord", Icon: FaDiscord },
]

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[85dvh] scroll-mt-20 items-center overflow-hidden"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 px-4 py-16 md:grid-cols-2 md:px-8">
        <FadeIn>
          <span className="block font-display text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Profile
          </span>
          <h1 className="mt-4 text-balance font-display text-[clamp(2.75rem,7vw,5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
            Yuzu
          </h1>
          <p className="mt-5 text-lg text-ink-muted">
            Computer Science Student / VR Enthusiast
          </p>

          <div className="mt-8 flex items-center gap-4">
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink-muted transition-colors duration-200 hover:border-border-strong hover:text-accent"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <VrmHeroSlot />
        </FadeIn>
      </div>
    </section>
  )
}
