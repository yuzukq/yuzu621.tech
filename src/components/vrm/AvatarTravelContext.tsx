"use client"

import { createContext, useContext, useEffect, useRef, useState, type RefObject } from "react"
import dynamic from "next/dynamic"

const FloatingAvatar = dynamic(() => import("./FloatingAvatar"), { ssr: false })

interface AvatarTravelValue {
  showcase: boolean
  heroSlotRef: RefObject<HTMLDivElement | null>
  aboutSlotRef: RefObject<HTMLDivElement | null>
  /** createVrmScene() が解決するとtrue。失敗時はfalseのまま(HeroAvatarDockが
   * フォールバック表示を出し続ける判定に使う) */
  avatarReady: boolean
}

const AvatarTravelContext = createContext<AvatarTravelValue | null>(null)

export function useAvatarTravel() {
  return useContext(AvatarTravelContext)
}

interface AvatarTravelProviderProps {
  children: React.ReactNode
}

// Hero→Aboutをまたいでアバターが移動する演出はprefers-reduced-motionでない場合は
// 画面幅を問わず有効(モバイルも含む)。avatar.vrmが23MBあり、WebGLコンテキストも
// 限られたリソースなため、showcase=false時にHero/Aboutそれぞれが独立した
// VrmCanvasを持つ2枚目のcanvasを作らない設計にしている(共有アバター1枚のみ)。
// TechStackBody.tsxと同じ理由(hydrationミスマッチ回避)でマウント後のmatchMedia
// 判定・フォールバック初期値にしている。showcaseがfalseの間(reduced-motion/
// no-JS/SSR)はHero/About側がそれぞれ自前の静的なアバター/アイコンを描画する
export default function AvatarTravelProvider({ children }: AvatarTravelProviderProps) {
  const [showcase, setShowcase] = useState(false)
  const [avatarReady, setAvatarReady] = useState(false)
  const heroSlotRef = useRef<HTMLDivElement | null>(null)
  const aboutSlotRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const evaluate = () => setShowcase(!motionQuery.matches)
    evaluate()
    motionQuery.addEventListener("change", evaluate)
    return () => {
      motionQuery.removeEventListener("change", evaluate)
    }
  }, [])

  return (
    <AvatarTravelContext.Provider value={{ showcase, heroSlotRef, aboutSlotRef, avatarReady }}>
      {children}
      {showcase && (
        <FloatingAvatar heroSlotRef={heroSlotRef} aboutSlotRef={aboutSlotRef} onReady={setAvatarReady} />
      )}
    </AvatarTravelContext.Provider>
  )
}
