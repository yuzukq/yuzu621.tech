"use client"

import { useScrollTheme } from "@/context/ScrollThemeContext"

/**
 * アンカーナビゲーションのための共通ロジックを提供するカスタムフック
 * - スムーズスクロール機能
 * - 現在のセクションのアクティブ状態判定
 */
export function useAnchorNavigation() {
  const { currentSection } = useScrollTheme()

  /**
   * アンカーリンクのクリックハンドラー
   * 内部リンク（#で始まる）の場合はスムーズスクロール
   * 外部リンク（/で始まる）の場合は通常のナビゲーション
   */
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // 外部リンク（ページ遷移）は通常のナビゲーションを使用
    if (!href.startsWith("#")) {
      return
    }

    e.preventDefault()
    const targetId = href.replace("#", "")
    const targetElement = document.getElementById(targetId)
    
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start"
      })
    }
  }

  
  // 指定されたhrefが現在アクティブなセクションかどうかを判定
  
  const isActive = (href: string): boolean => {
    // 外部リンク（ページ遷移）はアクティブ判定しない
    if (!href.startsWith("#")) {
      return false
    }
    const sectionId = href.replace("#", "")
    return currentSection === sectionId
  }

  return {
    currentSection,
    handleClick,
    isActive
  }
}
