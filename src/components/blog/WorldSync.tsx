"use client"

import { useEffect } from "react"
import type { BlogCategory } from "@/lib/posts"

// ページラッパーの data-world だけでは足りない: オーバースクロール背景と
// スクロールバー配色(color-scheme)は <html> 側のトークンを参照するため、
// <html data-world> もページのカテゴリに同期させる。
export default function WorldSync({ world }: { world: BlogCategory }) {
  useEffect(() => {
    document.documentElement.dataset.world = world
  }, [world])

  return null
}
