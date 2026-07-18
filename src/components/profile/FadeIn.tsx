"use client"

import type { ReactNode } from "react"
import { useInView } from "@/hooks/useInView"

// セクション全体をクライアント化せず、入場アニメーションが要る部分だけを包むためのラッパー
interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export default function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const { ref, isInView } = useInView({ threshold: 0.15 })

  return (
    <div
      ref={ref}
      className={`${isInView ? "animate-fade-in" : "opacity-0"}${className ? ` ${className}` : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
