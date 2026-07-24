"use client"

import { useEffect } from "react"
import Image from "next/image"
import { FaDesktop, FaExternalLinkAlt, FaGithub, FaTimes } from "react-icons/fa"
import type { Product } from "@/lib/products"

interface ProductDetailOverlayProps {
  product: Product
  onClose: () => void
}

export default function ProductDetailOverlay({ product, onClose }: ProductDetailOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 className="font-display text-2xl font-bold text-ink">{product.title}</h3>
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClose}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors duration-200 hover:bg-surface-hover hover:text-ink"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* スクリーンショット */}
          <div className="flex-1">
            <h4 className="mb-3 text-lg font-semibold text-ink">スクリーンショット</h4>
            <div className="flex flex-col gap-4">
              {product.screenshots.map((screenshot, index) => (
                <div
                  key={screenshot}
                  className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-hover"
                >
                  <Image
                    src={screenshot}
                    alt={`${product.title} スクリーンショット ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 詳細 */}
          <div className="flex-1">
            <div className="flex flex-col gap-6">
              <div className="markdown-body" dangerouslySetInnerHTML={{ __html: product.html }} />

              <hr className="border-border" />

              <div>
                <h4 className="mb-2 text-lg font-semibold text-ink">技術スタック</h4>
                <div className="flex flex-wrap gap-2">
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

              <hr className="border-border" />

              <div>
                <h4 className="mb-2 text-lg font-semibold text-ink">リンク</h4>
                <div className="flex flex-wrap gap-3">
                  {product.urls.demo && (
                    <a
                      href={product.urls.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-ink-muted transition-colors duration-200 hover:border-border-strong hover:text-accent"
                    >
                      <FaDesktop /> デモ
                    </a>
                  )}
                  {product.urls.github && (
                    <a
                      href={product.urls.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-ink-muted transition-colors duration-200 hover:border-border-strong hover:text-accent"
                    >
                      <FaGithub /> GitHub
                    </a>
                  )}
                  {product.urls.website && (
                    <a
                      href={product.urls.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-ink-muted transition-colors duration-200 hover:border-border-strong hover:text-accent"
                    >
                      <FaExternalLinkAlt /> Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
