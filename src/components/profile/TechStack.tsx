import { certifications, skillCategories } from "@/data/skills"
import SectionHeading from "./SectionHeading"
import FadeIn from "./FadeIn"

export default function TechStack() {
  return (
    <section id="tech-stack" className="scroll-mt-20 border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <SectionHeading eyebrow="Tech Stack" title="技術スタック" />
        <p className="wrap-phrase mt-6 max-w-2xl text-ink-muted">
          これまでに勉強したり開発で触れてきた技術スタック・ツールを、カテゴリ別にまとめています。
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {skillCategories.map((category, index) => (
            <FadeIn key={category.id} delay={index * 60} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6">
                <h3 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
                  <span aria-hidden="true">#</span> {category.label}
                </h3>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {category.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-border bg-surface-hover px-3 py-1.5 text-sm text-ink"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                {category.note && (
                  <p className="wrap-phrase mt-5 border-t border-border pt-4 text-sm leading-relaxed text-ink-muted">
                    {category.note}
                  </p>
                )}
              </div>
            </FadeIn>
          ))}
        </div>

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
