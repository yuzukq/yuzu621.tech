"use client"

import type { ReactNode } from "react"
import { useInView } from "@/hooks/useInView"

// 入場アニメーション(DESIGN.md §6)のラッパー。BlogCard と同じ
// fade-in-up + stagger のパターンをプロフィール側でも使い回す。
// セクション自体はRSCのまま、アニメーションが要る部分だけをこれで包む。
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
      className={`${isInView ? "animate-fade-in-up" : "opacity-0"}${className ? ` ${className}` : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
