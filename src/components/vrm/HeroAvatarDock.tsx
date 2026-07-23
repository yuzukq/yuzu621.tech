"use client"

import VrmHeroSlot from "./VrmHeroSlot"
import { useAvatarTravel } from "./AvatarTravelContext"

// showcase時はFloatingAvatarが実体を描画するため、ここは位置測定用の空スロットに
// なる(サイズ・余白はVrmCanvasの見た目と揃える)。フォールバック時は従来通り
// Hero自前のVRMアバターを描画する
export default function HeroAvatarDock() {
  const travel = useAvatarTravel()

  if (!travel?.showcase) {
    return <VrmHeroSlot />
  }

  return (
    <div
      ref={travel.heroSlotRef}
      aria-hidden="true"
      className="relative mx-auto aspect-square w-full max-w-sm md:mx-0 md:ml-auto"
    />
  )
}
