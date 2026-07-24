"use client"

import { useEffect } from "react"
import type { BlogCategory } from "@/lib/posts"
import { THEME_STORAGE_KEY, isWorld } from "@/lib/theme"

// ページラッパーの data-world だけでは足りない: オーバースクロール背景と
// スクロールバー配色(color-scheme)は <html> 側のトークンを参照するため、
// <html data-world> もページのカテゴリに同期させる。
//
// ただしThemeToggleで明示的にテーマを選択済みの場合は、その選択を
// カテゴリ由来のworldで上書きしない(記事間を遷移するたびにユーザーの
// 選択が消えてしまうため)
export default function WorldSync({ world }: { world: BlogCategory }) {
  useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      // 無視: 保存設定が読めなければカテゴリ既定にフォールバックする
    }
    document.documentElement.dataset.world = isWorld(stored) ? stored : world
  }, [world])

  return null
}
