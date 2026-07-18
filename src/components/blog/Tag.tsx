// タグチップ(DESIGN.md §5)。BlogCard・記事ページで共通利用する。
export default function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-xs text-ink-muted transition-colors duration-200 hover:text-accent">
      #{children}
    </span>
  )
}
