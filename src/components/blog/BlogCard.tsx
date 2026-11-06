"use client"

import NextImage from "next/image"
import NextLink from "next/link"
import type { BlogCategory } from "@/lib/posts"
import { formatDateJa } from "@/lib/format-date"
import { isOptimizableExternalImage } from "@/lib/external-image-hosts"
import { SITE_NAME } from "@/lib/seo"
import { useInView } from "@/hooks/useInView"
import Tag from "./Tag"

/** externalSource があれば外部記事: 新規タブで開き、カテゴリの代わりに出典バッジを出す */
export type BlogCardData = {
  href: string
  externalSource?: string
  title: string
  date: string
  description?: string
  tags?: string[]
  thumbnail?: string
  category: BlogCategory
}

// 未知の出典は accent-2 に落ちる(ブランドトークンは globals.css の :root)
const BRAND_DOT_COLOR: Record<string, string> = {
  qiita: "var(--brand-qiita)",
  zenn: "var(--brand-zenn)",
}

interface BlogCardProps {
  item: BlogCardData
  index: number
  /** ファーストビュー内のカードに付ける。JSを待たずSSRの時点からフェードインする */
  eager?: boolean
}

export default function BlogCard({ item, index, eager = false }: BlogCardProps) {
  const { ref, isInView } = useInView({ threshold: 0.15, initialInView: eager })
  const external = item.externalSource
  // 一覧の LCP 要素になる先頭だけ優先する。全カードに付けると帯域を奪い合って逆効果になる
  const isPriority = index === 0

  const cardClassName =
    "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[transform,border-color,box-shadow] duration-[250ms] ease-out hover:-translate-y-0.5 hover:border-border-strong hover:shadow-glow"

  const inner = (
    <>
      <div className="relative aspect-video w-full overflow-hidden bg-surface-hover">
        {item.thumbnail ? (
          external && !isOptimizableExternalImage(item.thumbnail) ? (
            // eslint-disable-next-line @next/next/no-img-element -- remotePatterns に無いホストは next/image が表示を拒否するため
            <img
              src={item.thumbnail}
              alt=""
              loading={isPriority ? "eager" : "lazy"}
              fetchPriority={isPriority ? "high" : undefined}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <NextImage
              src={item.thumbnail}
              alt={external ? "" : item.title}
              fill
              priority={isPriority}
              fetchPriority={isPriority ? "high" : undefined}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center font-mono text-sm uppercase tracking-wider text-ink-faint"
          >
            {external ?? SITE_NAME}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 font-mono text-xs text-ink-faint">
          {external ? (
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: BRAND_DOT_COLOR[external.toLowerCase()] ?? "var(--accent-2)",
                }}
              />
              <span className="uppercase tracking-wider">{external}</span>
            </span>
          ) : (
            <span className="uppercase tracking-wider">{item.category}</span>
          )}
          <span aria-hidden="true">/</span>
          <time dateTime={item.date}>{formatDateJa(item.date)}</time>
        </div>

        <h2 className="line-clamp-2 font-body text-lg font-bold text-ink">
          {item.title}
          {external && (
            <span aria-hidden="true" className="ml-1.5 font-mono text-sm text-ink-faint">
              ↗
            </span>
          )}
        </h2>

        {item.description && (
          <p className="line-clamp-2 text-sm text-ink-muted">{item.description}</p>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            {item.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}
      </div>
    </>
  )

  return (
    <div
      ref={ref}
      data-fade
      className={isInView ? "animate-fade-in" : "opacity-0"}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {external ? (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className={cardClassName}>
          {inner}
        </a>
      ) : (
        <NextLink href={item.href} className={cardClassName}>
          {inner}
        </NextLink>
      )}
    </div>
  )
}
