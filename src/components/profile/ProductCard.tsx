import Image from "next/image"
import type { Product } from "@/lib/products"

interface ProductCardProps {
  product: Product
  onSelect: () => void
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface text-left transition-[transform,border-color,box-shadow] duration-[250ms] ease-out hover:-translate-y-0.5 hover:border-border-strong hover:shadow-glow"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-hover">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-body text-lg font-bold text-ink">{product.title}</h3>

        {product.description && (
          <p className="line-clamp-2 text-sm text-ink-muted">{product.description}</p>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {product.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-border bg-surface-hover px-2.5 py-1 font-mono text-xs text-ink-muted"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}
