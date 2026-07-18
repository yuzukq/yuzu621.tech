"use client"

// three 一式をプロフィールの初回ロードJSに含めないための dynamic(ssr: false) 境界。
// モデル読込失敗時のフォールバックは VrmCanvas 側で処理する。
import dynamic from "next/dynamic"
import VrmFallback from "./VrmFallback"

const VrmCanvas = dynamic(() => import("./VrmCanvas"), {
  ssr: false,
  loading: () => <VrmFallback />,
})

export default function VrmHeroSlot() {
  return <VrmCanvas />
}
