interface SectionHeadingProps {
  eyebrow: string
  title: string
}

export default function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <h2 className="leading-tight">
      <span className="block font-display text-xs font-medium uppercase tracking-[0.25em] text-accent">
        {eyebrow}
      </span>
      <span className="mt-3 block font-body text-3xl font-extrabold text-ink md:text-4xl">
        {title}
      </span>
    </h2>
  )
}
