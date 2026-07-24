"use client"

import VrmFallback from "./VrmFallback"
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
    >
      {/* avatarReady になるまで(失敗時は永続)VrmCanvasと同じ700ms opacity遷移で
          フォールバックを重ねる。FloatingAvatarのcanvasはalpha:trueで透明なため
          読込中はこちらが透けて見える */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          travel.avatarReady ? "opacity-0" : "opacity-100"
        }`}
      >
        <VrmFallback />
      </div>
    </div>
  )
}
