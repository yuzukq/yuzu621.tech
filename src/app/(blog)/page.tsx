import { getAllPostsMeta, type BlogCategory } from '@/lib/posts'
import CategoryTabs from '@/components/blog/CategoryTabs'
import BlogCard from '@/components/blog/BlogCard'
import WorldSync from '@/components/blog/WorldSync'

const VALID_CATEGORIES: BlogCategory[] = ['tech', 'daily']
function isValidCategory(value: string | null | undefined): value is BlogCategory {
  return value !== null && value !== undefined && VALID_CATEGORIES.includes(value as BlogCategory)
}

interface BlogIndexPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const params = await searchParams
  const category: BlogCategory = isValidCategory(params.category) ? params.category : 'tech'
  const posts = getAllPostsMeta(category)

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

        {posts.length === 0 ? (
          <p className="text-ink-muted">
            {category === 'tech' ? '技術記事' : '日常記事'}はまだありません。
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {posts.map((post, index) => (
              <BlogCard key={post.slug} post={post} index={index} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
