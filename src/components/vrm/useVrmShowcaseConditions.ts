"use client"

import { useEffect, useState } from "react"

// Network Information API は Chromium にしか無く、TypeScript の DOM 型にも含まれない
interface NetworkInformationLike {
  saveData?: boolean
  effectiveType?: string
}

const SLOW_EFFECTIVE_TYPES = ["slow-2g", "2g", "3g"]

function canAfford3d(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection
  // API が無いブラウザ(Safari / Firefox)では通信状況が分からないので、通常どおり読み込む
  if (!connection) return true
  return !connection.saveData && !SLOW_EFFECTIVE_TYPES.includes(connection.effectiveType ?? "")
}

export interface VrmShowcaseConditions {
  /** prefers-reduced-motion: reduce でない */
  motionOK: boolean
  /** データセーバーが無効で、回線が 3g より速い(判定できない場合も true) */
  allow3d: boolean
  /** 画面幅が 1024px 以上 */
  isWide: boolean
}

// SSR/初回 CSR は全項目 false にする: hydration ミスマッチを避けつつ、判定前に 3D の
// 読み込みを始めないため。allow3d は通信状況が変わっても追従しない(読み込み済みの
// シーンを破棄しても、ダウンロード済みの通信量は戻らないため)
export function useVrmShowcaseConditions(): VrmShowcaseConditions {
  const [conditions, setConditions] = useState<VrmShowcaseConditions>({
    motionOK: false,
    allow3d: false,
    isWide: false,
  })

  useEffect(() => {
    const allow3d = canAfford3d()
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const widthQuery = window.matchMedia("(min-width: 1024px)")
    const evaluate = () =>
      setConditions({ motionOK: !motionQuery.matches, allow3d, isWide: widthQuery.matches })
    evaluate()
    motionQuery.addEventListener("change", evaluate)
    widthQuery.addEventListener("change", evaluate)
    return () => {
      motionQuery.removeEventListener("change", evaluate)
      widthQuery.removeEventListener("change", evaluate)
    }
  }, [])

  return conditions
}
