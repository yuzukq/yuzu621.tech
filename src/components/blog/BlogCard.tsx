"use client"

import NextImage from "next/image"
import NextLink from "next/link"
import type { PostMeta } from "@/lib/posts"
import { useInView } from "@/hooks/useInView"
import Tag from "./Tag"

interface BlogCardProps {
  post: PostMeta
  index: number
}

export default function BlogCard({ post, index }: BlogCardProps) {
  const { ref, isInView } = useInView({ threshold: 0.15 })

  return (
    <div
      ref={ref}
      className={isInView ? "animate-fade-in-up" : "opacity-0"}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <NextLink
        href={`/blog/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[transform,border-color,box-shadow] duration-[250ms] ease-out hover:-translate-y-0.5 hover:border-border-strong hover:shadow-glow"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-surface-hover">
          {post.thumbnail ? (
            <NextImage
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <NextImage
              src="/images/blog/placeholder.svg"
              alt=""
              fill
              className="object-cover"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center gap-2 font-mono text-xs text-ink-faint">
            <span className="uppercase tracking-wider">{post.category}</span>
            <span aria-hidden="true">/</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>

          <h2 className="line-clamp-2 font-body text-lg font-bold text-ink">
            {post.title}
          </h2>

          {post.description && (
            <p className="line-clamp-2 text-sm text-ink-muted">{post.description}</p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-2 pt-1">
              {post.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}
        </div>
      </NextLink>
    </div>
  )
}
