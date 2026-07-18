// VRMヒーロースロット(DESIGN.md §7)。
//
// P5で実装予定: `three` + `@pixiv/three-vrm` を `next/dynamic`(ssr: false)で
// 読み込み、`public/models/avatar.vrm` を表示するCSRアイランドに差し替える。
// モデル未配置時は静かにこのプレースホルダへフォールバックする想定のため、
// 差し替えが一箇所で完結するようこのコンポーネント単体を境界にしている。
//
// 現時点ではcanvasを使わず、CSSのみの柚子イエローのグラデーション球を表示する。
export default function VrmHeroSlot() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center md:mx-0 md:ml-auto"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent via-accent-hover to-accent-2 opacity-25 blur-3xl" />
      <div className="relative h-2/3 w-2/3 animate-vrm-float rounded-full bg-gradient-to-br from-accent via-accent-hover to-accent-2 shadow-glow" />
    </div>
  )
}
