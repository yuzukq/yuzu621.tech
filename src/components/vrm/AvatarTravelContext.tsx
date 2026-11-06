"use client"

import { createContext, useContext, useRef, useState, type RefObject } from "react"
import dynamic from "next/dynamic"
import { useVrmShowcaseConditions } from "./useVrmShowcaseConditions"

const FloatingAvatar = dynamic(() => import("./FloatingAvatar"), { ssr: false })

interface AvatarTravelValue {
  showcase: boolean
  /** false のとき(データセーバー・低速回線)は Hero も 3D を読み込まない */
  allow3d: boolean
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

// Hero→Aboutをまたいでアバターが移動する演出は画面幅を問わず有効(モバイルも含む)。
// avatar.vrmが大きく、WebGLコンテキストも限られたリソースなため、showcase=false時に
// Hero/Aboutそれぞれが独立したVrmCanvasを持つ2枚目のcanvasを作らない設計にしている
// (共有アバター1枚のみ)。showcaseがfalseの間(reduced-motion/低速回線/no-JS/SSR)は
// Hero/About側がそれぞれ自前の静的なアバター/アイコンを描画する
export default function AvatarTravelProvider({ children }: AvatarTravelProviderProps) {
  const { motionOK, allow3d } = useVrmShowcaseConditions()
  const showcase = motionOK && allow3d
  const [avatarReady, setAvatarReady] = useState(false)
  const heroSlotRef = useRef<HTMLDivElement | null>(null)
  const aboutSlotRef = useRef<HTMLDivElement | null>(null)

  return (
    <AvatarTravelContext.Provider
      value={{ showcase, allow3d, heroSlotRef, aboutSlotRef, avatarReady }}
    >
      {children}
      {showcase && (
        <FloatingAvatar heroSlotRef={heroSlotRef} aboutSlotRef={aboutSlotRef} onReady={setAvatarReady} />
      )}
    </AvatarTravelContext.Provider>
  )
}
