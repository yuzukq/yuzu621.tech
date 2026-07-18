// three を読み込まずに表示できる CSS のみのプレースホルダ
// (チャンク/モデルの読込中と読込失敗時に使う)。
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
