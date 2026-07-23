"use client"

import { useEffect } from "react"

// WorldSync と異なりcleanupが必須: この属性はprofileページ専有のscroll-snap
// スコープに使うため、ブログへSPA遷移した後も残っていると
// scroll-snap-type がブログ側のhtmlに漏れてしまう
export default function ScrollSnapSync() {
  useEffect(() => {
    document.documentElement.dataset.scrollSnap = "profile"
    return () => {
      delete document.documentElement.dataset.scrollSnap
    }
  }, [])

  return null
}
