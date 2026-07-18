"use client"

import { useEffect } from "react"
import type { BlogCategory } from "@/lib/posts"

/**
 * ページのカテゴリ(tech/daily)を <html data-world> に同期するだけの
 * 小さなクライアントコンポーネント。ページ最上位ラッパーの data-world は
 * SSRで即座に正しい値になるが、オーバースクロールの背景色やスクロールバーの
 * 配色(color-scheme)は <html> 側のトークンを見るため、こちらも合わせておく。
 */
export default function WorldSync({ world }: { world: BlogCategory }) {
  useEffect(() => {
    document.documentElement.dataset.world = world
  }, [world])

  return null
}
