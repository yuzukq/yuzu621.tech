"use client"

import { useEffect } from "react"
import { THEME_STORAGE_KEY, resolveWorld } from "@/lib/theme"

// プロフィールページはブログのようなカテゴリ既定を持たないため、明示保存が
// 無い場合はシステムのprefers-color-schemeに従う(ライトテーマ利用者向けの
// フォールバック)。SPA遷移(他ページからのLink遷移)ではlayout.tsxの
// 同期initスクリプトが再実行されないため、この副作用での適用が必要
export default function ThemeSync() {
  useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      // 無視: 保存設定が読めなければシステム設定にフォールバックする
    }
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches
    document.documentElement.dataset.world = resolveWorld(
      stored,
      (light) => (light ? "daily" : "tech"),
      prefersLight
    )
  }, [])

  return null
}
