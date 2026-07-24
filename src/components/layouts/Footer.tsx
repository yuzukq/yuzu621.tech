const SITE_LAUNCH_YEAR = 2025

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const yearLabel =
    currentYear > SITE_LAUNCH_YEAR ? `${SITE_LAUNCH_YEAR}–${currentYear}` : `${SITE_LAUNCH_YEAR}`

  return (
    <footer className="w-full border-t border-border bg-surface px-8 py-8 text-center">
      <p className="mb-3 font-mono text-xs text-ink-faint">© {yearLabel} Yuzu. All rights reserved.</p>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <a
          href="https://github.com/yuzukq"
          className="text-ink-muted transition-colors duration-200 hover:text-accent"
        >
          GitHub
        </a>
        <a
          href="https://discord.gg/8HPdqbZF"
          className="text-ink-muted transition-colors duration-200 hover:text-accent"
        >
          Discord
        </a>
      </div>
    </footer>
  )
}
