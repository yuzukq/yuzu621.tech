"use client"

import { useEffect, useState } from "react"
import { FiMoon, FiSun } from "react-icons/fi"
import { THEME_STORAGE_KEY, type World } from "@/lib/theme"

interface ThemeToggleProps {
  className?: string
}

// 初回レンダー(SSR)ではdocument.documentElementのdata-worldを読めないため、
// マウント後にuseEffectで確定させる(next-themesのuseTheme()と同じ二段階方式)。
// 確定するまではdaily/tech両対応のニュートラルな見た目にはせず、tech(ダーク)
// 前提のSunアイコンを暫定表示する(サイト全体のデフォルトがtechのため違和感が少ない)
export default function ThemeToggle({ className }: ThemeToggleProps) {
  const [world, setWorld] = useState<World | null>(null)

  useEffect(() => {
    setWorld((document.documentElement.dataset.world as World | undefined) ?? "tech")
  }, [])

  const toggle = () => {
    const next: World = world === "daily" ? "tech" : "daily"
    document.documentElement.dataset.world = next
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // プライベートブラウジング等でlocalStorageが使えなくても表示切替自体は続行する
    }
    setWorld(next)
  }

  const isDaily = world === "daily"

  return (
    <button
      type="button"
      aria-label={isDaily ? "ダークテーマに切り替え" : "ライトテーマに切り替え"}
      onClick={toggle}
      className={`flex h-10 w-10 items-center justify-center rounded-lg text-ink-muted transition-colors duration-200 hover:bg-surface-hover hover:text-ink ${className ?? ""}`}
    >
      {isDaily ? <FiMoon size={18} /> : <FiSun size={18} />}
    </button>
  )
}
