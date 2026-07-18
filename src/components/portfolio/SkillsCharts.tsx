"use client"

import dynamic from "next/dynamic"
import type { SkillCategory } from "@/data/skills"
import FadeIn from "./FadeIn"

// recharts はそこそこ重いため、スキルセクション(スクロール下部)専用に
// 遅延ロードする。ssr:false でクライアントバンドルを個別チャンクへ分離し、
// /portfolio の First Load JS から外す。
const SkillRadarChartCard = dynamic(() => import("./SkillRadarChartCard"), {
  ssr: false,
  loading: () => (
    <div className="aspect-square w-full max-w-xs animate-pulse rounded-2xl bg-surface-hover" />
  ),
})

export default function SkillsCharts({ categories }: { categories: SkillCategory[] }) {
  return (
    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, index) => (
        <FadeIn key={category.id} delay={index * 60}>
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="mb-4 text-center font-display text-lg font-bold text-ink">
              {category.title}
            </h3>
            <SkillRadarChartCard category={category} />
          </div>
        </FadeIn>
      ))}
    </div>
  )
}
