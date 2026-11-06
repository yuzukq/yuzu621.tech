"use client"

import type { ReactNode } from "react"
import { useInView } from "@/hooks/useInView"

// セクション全体をクライアント化せず、入場アニメーションが要る部分だけを包むためのラッパー
interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
  /** ファーストビュー内の要素に付ける。JSを待たずSSRの時点からフェードインする */
  eager?: boolean
}

export default function FadeIn({ children, delay = 0, className, eager = false }: FadeInProps) {
  const { ref, isInView } = useInView({ threshold: 0.15, initialInView: eager })

  return (
    <div
      ref={ref}
      data-fade
      className={`${isInView ? "animate-fade-in" : "opacity-0"}${className ? ` ${className}` : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
