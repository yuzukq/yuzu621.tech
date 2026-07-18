"use client"

// VRMヒーロースロット(DESIGN.md §7)。
//
// three + @pixiv/three-vrm 一式(VrmCanvas)は next/dynamic(ssr: false)で
// 遅延読み込みし、ポートフォリオページの初回ロードJSに含めない。
// ページ自体(Hero.tsx / portfolio/page.tsx)はサーバーコンポーネントのままで、
// このコンポーネントだけがクライアント境界になる。
//
// チャンクの読み込み中は VrmFallback(柚子イエローのグラデーション球)を表示する。
// モデル未配置・読み込み失敗時のフォールバックは VrmCanvas 内部で処理する
// (差し替えが一箇所で完結するよう、境界はこのファイル単体に閉じている)。
import dynamic from "next/dynamic"
import VrmFallback from "./VrmFallback"

const VrmCanvas = dynamic(() => import("./VrmCanvas"), {
  ssr: false,
  loading: () => <VrmFallback />,
})

export default function VrmHeroSlot() {
  return <VrmCanvas />
}
