export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface px-8 py-8 text-center">
      <p className="mb-3 font-mono text-xs text-ink-faint">© 2025 Yuzu</p>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <a
          href="mailto:c1.101@gmail.com"
          className="text-ink-muted transition-colors duration-200 hover:text-accent"
        >
          Contact
        </a>
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
