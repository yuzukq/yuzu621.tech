"use client"

import { createContext, useContext, useEffect, useRef, useState, type RefObject } from "react"
import dynamic from "next/dynamic"

const FloatingAvatar = dynamic(() => import("./FloatingAvatar"), { ssr: false })

interface AvatarTravelValue {
  showcase: boolean
  heroSlotRef: RefObject<HTMLDivElement | null>
  aboutSlotRef: RefObject<HTMLDivElement | null>
}

const AvatarTravelContext = createContext<AvatarTravelValue | null>(null)

export function useAvatarTravel() {
  return useContext(AvatarTravelContext)
}

interface AvatarTravelProviderProps {
  children: React.ReactNode
}

// Hero→Aboutをまたいでアバターが移動する演出はlg以上・prefers-reduced-motionで
// ない場合のみ。TechStackBody.tsxと同じ理由(hydrationミスマッチ回避)でマウント後
// のmatchMedia判定・フォールバック初期値にしている。showcaseがfalseの間は
// Hero/About側がそれぞれ自前の静的なアバター/アイコンを描画する
export default function AvatarTravelProvider({ children }: AvatarTravelProviderProps) {
  const [showcase, setShowcase] = useState(false)
  const heroSlotRef = useRef<HTMLDivElement | null>(null)
  const aboutSlotRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const widthQuery = window.matchMedia("(min-width: 1024px)")
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const evaluate = () => setShowcase(widthQuery.matches && !motionQuery.matches)
    evaluate()
    widthQuery.addEventListener("change", evaluate)
    motionQuery.addEventListener("change", evaluate)
    return () => {
      widthQuery.removeEventListener("change", evaluate)
      motionQuery.removeEventListener("change", evaluate)
    }
  }, [])

  return (
    <AvatarTravelContext.Provider value={{ showcase, heroSlotRef, aboutSlotRef }}>
      {children}
      {showcase && <FloatingAvatar heroSlotRef={heroSlotRef} aboutSlotRef={aboutSlotRef} />}
    </AvatarTravelContext.Provider>
  )
}
