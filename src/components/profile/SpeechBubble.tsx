interface SpeechBubbleProps {
  children: React.ReactNode
}

// アバターが話しているような吹き出し。左側面の三角がアバター(左)を指す構図の
// ため、md未満(アバターが上・テキストが下に積む構図)では非表示にする
export default function SpeechBubble({ children }: SpeechBubbleProps) {
  return (
    <div className="relative rounded-2xl border border-border bg-surface p-6 md:p-7">
      <div
        aria-hidden="true"
        className="absolute -left-[9px] top-8 hidden h-4 w-4 rotate-45 border-b border-l border-border bg-surface md:block"
      />
      <p className="wrap-phrase whitespace-pre-line text-lg leading-loose text-ink-muted">
        {children}
      </p>
    </div>
  )
}
