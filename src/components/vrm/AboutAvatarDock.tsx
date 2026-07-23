"use client"

import Image from "next/image"
import { aboutMe } from "@/data/aboutme"
import { useAvatarTravel } from "./AvatarTravelContext"

// showcase時はFloatingAvatarが実体を描画するため、ここは位置測定用の空スロットに
// なる。フォールバック時は従来通りの丸型プロフィール写真を描画する
export default function AboutAvatarDock() {
  const travel = useAvatarTravel()

  if (!travel?.showcase) {
    return (
      <div className="relative h-[220px] w-[220px] flex-shrink-0 overflow-hidden rounded-full border-4 border-border md:h-[260px] md:w-[260px]">
        <Image src={aboutMe.icon} alt="Profile Icon" fill className="object-cover" sizes="260px" />
      </div>
    )
  }

  return (
    <div
      ref={travel.aboutSlotRef}
      aria-hidden="true"
      className="relative mx-auto aspect-square w-full max-w-sm flex-shrink-0 md:mx-0 md:mr-auto"
    />
  )
}
