// VRMヒーローのフォールバック(DESIGN.md §7)。
//
// three.js本体やモデルの読み込みが不要な、CSSのみの柚子イエローの
// グラデーション球。以下のケースでこれが表示される:
//   - VrmCanvas の遅延チャンク自体がまだ読み込み中(next/dynamic の loading)
//   - モデル(public/models/avatar.vrm)の読み込み中
//   - モデルが未配置、または読み込みに失敗したとき(静かにフォールバック)
//
// 元は VrmHeroSlot.tsx にインラインで実装されていたものをそのまま切り出している。
export default function VrmFallback() {
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
