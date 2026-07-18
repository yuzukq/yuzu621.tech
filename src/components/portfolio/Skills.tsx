import { certifications, skillCategories, skillLevels } from "@/data/skills"
import SectionHeading from "./SectionHeading"
import SkillsCharts from "./SkillsCharts"

export default function Skills() {
  return (
    <section id="skills" className="scroll-mt-20 border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <SectionHeading eyebrow="Skills" title="スキル" />
        <p className="mt-6 max-w-2xl text-ink-muted">
          これまでに習得したスキルや技術スタックを可視化しています。
        </p>

        <SkillsCharts categories={skillCategories} />

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

        <div className="mt-16">
          <h3 className="mb-4 text-center font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
            チャートの見方
          </h3>
          <div className="mx-auto flex max-w-xl flex-col gap-2">
            {skillLevels.map((item) => (
              <div key={item.level} className="flex items-center gap-3">
                <span className="min-w-[5.5rem] font-mono text-sm font-bold text-ink">
                  レベル{item.level}
                </span>
                <span className="text-sm text-ink-muted">{item.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
