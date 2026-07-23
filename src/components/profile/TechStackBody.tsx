"use client"

import { useEffect, useState } from "react"
import type { SkillCategory } from "@/data/skills"
import FadeIn from "./FadeIn"
import SectionHeading from "./SectionHeading"
import TechStackShowcase from "./TechStackShowcase"

interface TechStackBodyProps {
  categories: SkillCategory[]
}

// スクロール連動のアバター演出はlg以上・prefers-reduced-motionでない場合のみ使う。
// 判定はマウント後(useEffect)に行い、SSR/初回CSRは常にフォールバックの静的グリッドを
// 描画する: これによりhydrationミスマッチを避けつつ、no-js環境やクローラーにも
// 全カテゴリの内容がそのまま届く
export default function TechStackBody({ categories }: TechStackBodyProps) {
  const [showcase, setShowcase] = useState(false)

  useEffect(() => {
    const widthQuery = window.matchMedia("(min-width: 1024px)")
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const evaluate = () => setShowcase(widthQuery.matches && !motionQuery.matches)
    evaluate()
    widthQuery.addEventListener("change", evaluate)
    motionQuery.addEventListener("change", evaluate)
    return () => {
      widthQuery.removeEventListener("change", evaluate)
      motionQuery.removeEventListener("change", evaluate)
    }
  }, [])

  if (showcase) {
    return (
      <div className="mt-12">
        <TechStackShowcase categories={categories} />
      </div>
    )
  }

  return (
    <>
      <SectionHeading eyebrow="Tech Stack" title="技術スタック" />
      <p className="wrap-phrase mt-6 text-ink-muted">
        これまでに勉強したり開発で触れてきた技術スタック・ツールを、カテゴリ別にまとめています。
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {categories.map((category, index) => (
          <FadeIn key={category.id} delay={index * 100} className="h-full">
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
    </>
  )
}
