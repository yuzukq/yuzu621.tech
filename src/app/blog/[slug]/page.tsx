import type { Metadata } from 'next'
import { getAllPostSlugs, getPostBySlug, renderPost } from '@/lib/posts'
import TableOfContents from '@/components/blog/TableOfContents'
import BlogHeader from '@/components/blog/BlogHeader'
import { formatDateJa } from '@/lib/format-date'
import Image from 'next/image'
import Tag from '@/components/blog/Tag'
import WorldSync from '@/components/blog/WorldSync'
import { buildWorldPrePaintScript } from '@/lib/theme'
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
      <div className="flex flex-1 flex-col bg-bg">
        <BlogHeader variant="list" />
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
          <h1 className="text-2xl font-bold text-ink">Not Found</h1>
        </div>
      </div>
    )
  }

  const rendered = await renderPost(slug)
  if (!rendered) {
    return (
      <div className="flex flex-1 flex-col bg-bg">
        <BlogHeader variant="list" />
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
    <div className="flex flex-1 flex-col bg-bg">
      {/* 保存済みテーマが無い読者へ、記事カテゴリ既定の世界をペイント前に適用する
          (ルート直下のinitスクリプトはスラッグからカテゴリを判別できないため) */}
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: buildWorldPrePaintScript(world) }}
      />
      <WorldSync world={world} />
      <BlogHeader variant="article" toc={rendered.toc} />
      <script {...jsonLdScriptProps(postJsonLd)} />
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-24 xl:grid xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-10">
        <article className="mx-auto w-full max-w-3xl xl:mx-0">
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

          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: rendered.html }} />

          <ShareRow title={post.title} />
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <TableOfContents items={rendered.toc} />
          </div>
        </aside>
      </div>
    </div>
  )
}
