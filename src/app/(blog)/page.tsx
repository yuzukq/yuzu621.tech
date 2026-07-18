import type { Metadata } from 'next'
import { getAllPostsMeta, type BlogCategory } from '@/lib/posts'
import { getExternalArticles } from '@/lib/external-articles'
import CategoryTabs from '@/components/blog/CategoryTabs'
import BlogCard, { type BlogCardData } from '@/components/blog/BlogCard'
import WorldSync from '@/components/blog/WorldSync'
import { SITE_TITLE, SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE_PATH } from '@/lib/seo'

const VALID_CATEGORIES: BlogCategory[] = ['tech', 'daily']
function isValidCategory(value: string | null | undefined): value is BlogCategory {
  return value !== null && value !== undefined && VALID_CATEGORIES.includes(value as BlogCategory)
}

const DAILY_TITLE = '日常のこと'
const DAILY_DESCRIPTION = 'Yuzu の日常のちょっとした出来事や気づきを綴ったブログ記事の一覧です。'

interface BlogIndexPageProps {
  searchParams: Promise<{ category?: string }>
}

// カテゴリはクエリパラメータ(`?category=`)による同一URL上のフィルタで、
// 検索エンジンには重複コンテンツと見なされうるため、canonical は常に
// クエリなしの `/` を指す(日常・技術どちらの表示でも同じ)。
export async function generateMetadata({ searchParams }: BlogIndexPageProps): Promise<Metadata> {
  const params = await searchParams
  const category: BlogCategory = isValidCategory(params.category) ? params.category : 'tech'
  const isDaily = category === 'daily'

  const title = isDaily ? DAILY_TITLE : { absolute: SITE_TITLE }
  const description = isDaily ? DAILY_DESCRIPTION : DEFAULT_DESCRIPTION
  const ogTitle = isDaily ? `${DAILY_TITLE} | ${SITE_NAME}` : SITE_TITLE

  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'ja_JP',
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      url: '/',
      images: [{ url: DEFAULT_OG_IMAGE_PATH }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [DEFAULT_OG_IMAGE_PATH],
    },
  }
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const params = await searchParams
  const category: BlogCategory = isValidCategory(params.category) ? params.category : 'tech'

  // ローカル記事 + 外部記事(Qiita自動取得・手動データ)を日付順で1つの一覧に混ぜる
  const [posts, externalArticles] = await Promise.all([
    Promise.resolve(getAllPostsMeta(category)),
    getExternalArticles(category),
  ])
  const items: BlogCardData[] = [
    ...posts.map((post) => ({
      href: `/blog/${post.slug}`,
      title: post.title,
      date: post.date,
      description: post.description,
      tags: post.tags,
      thumbnail: post.thumbnail,
      category: post.category,
    })),
    ...externalArticles.map((article) => ({
      href: article.url,
      externalSource: article.source,
      title: article.title,
      date: article.date,
      tags: article.tags,
      thumbnail: article.thumbnail,
      category: article.category ?? ('tech' as const),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div data-world={category} className="flex-1 bg-bg">
      <WorldSync world={category} />
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <h1 className="leading-tight">
            <span className="block font-display text-xs font-medium uppercase tracking-[0.25em] text-accent">
              Blog
            </span>
            <span className="mt-3 block font-body text-3xl font-extrabold text-ink md:text-4xl">
              {category === 'daily' ? '日常のこと' : '技術記事'}
            </span>
          </h1>
          <CategoryTabs currentCategory={category} />
        </div>

        {items.length === 0 ? (
          <p className="text-ink-muted">
            {category === 'tech' ? '技術記事' : '日常記事'}はまだありません。
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {items.map((item, index) => (
              <BlogCard key={item.href} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
