// ブログ記事本文ページ
import { getAllPostSlugs, getPostBySlug, getPostHtml } from '@/lib/posts'
import Image from 'next/image'
import Tag from '@/components/blog/Tag'
import WorldSync from '@/components/blog/WorldSync'
import ShareRow from './ShareRow'

export const dynamic = 'error' // SSG

export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Not found' }
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.thumbnail ? [{ url: post.thumbnail }] : undefined,
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

  return (
    <div data-world={world} className="flex-1 bg-bg">
      <WorldSync world={world} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight text-ink">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-sm text-ink-faint">
          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('ja-JP')}</time>
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
