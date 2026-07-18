// ブログ記事本文ページ
import type { Metadata } from 'next'
import { getAllPostSlugs, getPostBySlug, getPostHtml } from '@/lib/posts'
import { formatDateJa } from '@/lib/format-date'
import Image from 'next/image'
import Tag from '@/components/blog/Tag'
import WorldSync from '@/components/blog/WorldSync'
import ShareRow from './ShareRow'
import {
  SITE_NAME,
  DEFAULT_OG_IMAGE_PATH,
  buildBlogPostingJsonLd,
  jsonLdScriptProps,
} from '@/lib/seo'

export const dynamic = 'error' // SSG

export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Not found' }

  const url = `/blog/${slug}`
  const publishedTime = new Date(post.date).toISOString()

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      locale: 'ja_JP',
      siteName: SITE_NAME,
      title: post.title,
      description: post.description,
      url,
      publishedTime,
      tags: post.tags,
      // thumbnail があればそれを、無ければサイト共通のデフォルトOG画像を使う。
      images: [{ url: post.thumbnail ?? DEFAULT_OG_IMAGE_PATH }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.thumbnail ?? DEFAULT_OG_IMAGE_PATH],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) {
    return (
      <div data-world="tech" className="flex-1 bg-bg">
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
          <h1 className="text-2xl font-bold text-ink">Not Found</h1>
        </div>
      </div>
    )
  }

  // マークダウンを事前にHTMLに変換
  const contentHtml = await getPostHtml(slug)
  if (!contentHtml) {
    return (
      <div data-world="tech" className="flex-1 bg-bg">
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
          <h1 className="text-2xl font-bold text-ink">Content Error</h1>
        </div>
      </div>
    )
  }

  const world = post.category
  const postJsonLd = buildBlogPostingJsonLd({
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    image: post.thumbnail,
    tags: post.tags,
  })

  return (
    <div data-world={world} className="flex-1 bg-bg">
      <WorldSync world={world} />
      <script {...jsonLdScriptProps(postJsonLd)} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight text-ink">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-sm text-ink-faint">
          <time dateTime={post.date}>{formatDateJa(post.date)}</time>
          {post.tags?.map((tag) => <Tag key={tag}>{tag}</Tag>)}
        </div>

        {post.thumbnail && (
          <div className="relative mt-8 h-[220px] w-full overflow-hidden rounded-2xl md:h-[360px]">
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}

        <hr className="my-10 border-border" />

        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: contentHtml }} />

        {/* 一覧へ戻る + 共有ボタン行 */}
        <ShareRow title={post.title} />
      </div>
    </div>
  )
}
