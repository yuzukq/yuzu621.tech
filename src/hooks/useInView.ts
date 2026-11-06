"use client"

import { useEffect, useRef, useState } from "react"

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  /**
   * true の間は監視せず表示状態にする。ファーストビューの要素を
   * ハイドレーションを待たずSSRの時点からCSSアニメーションで表示するため
   */
  initialInView?: boolean
}

/**
 * 要素がビューポートに入ったかを検知するカスタムフック
 * @param options - Intersection Observerのオプション
 * @returns ref - 監視対象の要素にアタッチするref, isInView - 要素がビューポートに入ったか(initialInView の間は常に true)
 */
export function useInView(options: UseInViewOptions = {}) {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true, initialInView = false } = options
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(initialInView)

  useEffect(() => {
    if (initialInView) return
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (triggerOnce) observer.unobserve(element)
        } else if (!triggerOnce) {
          // triggerOnce では false に戻さない: initialInView が true→false に変わって
          // 監視を始めた直後の「画面外」通知で、表示済みの要素が消えてしまうため
          setIsInView(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, initialInView])

  // state だけに頼らない: マウント後に initialInView が true に変わると、監視は止まるのに
  // state は false のまま残り、要素が見えなくなるため
  return { ref, isInView: initialInView || isInView }
}
