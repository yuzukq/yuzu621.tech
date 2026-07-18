"use client"

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
} from "recharts"
import type { SkillCategory } from "@/data/skills"
import { useInView } from "@/hooks/useInView"

interface SkillRadarChartCardProps {
  category: SkillCategory
}

// recharts を直接使用し、色は必ずCSS変数トークン(--accent 等)経由で
// 指定する(生HEX禁止、DESIGN.md §8)。カードの枠・見出しは呼び出し元
// (SkillsCharts.tsx)が担い、ここはチャート本体のみを描画する。
export default function SkillRadarChartCard({ category }: SkillRadarChartCardProps) {
  const { ref, isInView } = useInView({ threshold: 0.2 })
  const data = Object.entries(category.data).map(([skill, level]) => ({ skill, level }))

  return (
    <div ref={ref} className="mx-auto aspect-square w-full max-w-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="var(--border-strong)" />
          <PolarAngleAxis
            dataKey="skill"
            tickLine={false}
            tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fill: "var(--ink-faint)", fontSize: 10 }}
          />
          {isInView && (
            <Radar
              name={category.title}
              dataKey="level"
              stroke="var(--accent)"
              fill="var(--accent)"
              fillOpacity={0.3}
              isAnimationActive
              dot={{ fillOpacity: 1 }}
            />
          )}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}
