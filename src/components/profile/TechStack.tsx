import { certifications, skillCategories } from "@/data/skills"
import SectionHeading from "./SectionHeading"
import TechStackBody from "./TechStackBody"

export default function TechStack() {
  return (
    <section id="tech-stack" className="scroll-mt-20 border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <SectionHeading eyebrow="Tech Stack" title="技術スタック" />
        <p className="wrap-phrase mt-6 text-ink-muted">
          これまでに勉強したり開発で触れてきた技術スタック・ツールを、カテゴリ別にまとめています。
        </p>

        <TechStackBody categories={skillCategories} />

        <div className="mt-16">
          <h3 className="mb-4 text-center font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
            保有資格
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {certifications.map((cert) => (
              <span
                key={cert.name}
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink"
              >
                {cert.name} ({cert.year})
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
