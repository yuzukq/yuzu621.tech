"use client"

import { useEffect, useRef, useState } from "react"

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  /**
   * true なら監視せず最初から表示状態にする。ファーストビューの要素を
   * ハイドレーションを待たずSSRの時点からCSSアニメーションで表示するため
   */
  initialInView?: boolean
}

/**
 * 要素がビューポートに入ったかを検知するカスタムフック
 * @param options - Intersection Observerのオプション
 * @returns ref - 監視対象の要素にアタッチするref, isInView - 要素がビューポートに入っているか
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
        const inView = entry.isIntersecting
        setIsInView(inView)

        // triggerOnceがtrueの場合、一度表示されたら監視を停止
        if (inView && triggerOnce) {
          observer.unobserve(element)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, initialInView])

  return { ref, isInView }
}
