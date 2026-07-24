import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { renderMarkdown, type RenderedMarkdown } from '@/lib/markdown'

export type BlogCategory = 'tech' | 'daily'

export type PostMeta = {
  slug: string
  title: string
  date: string
  description?: string
  tags?: string[]
  thumbnail?: string
  category: BlogCategory
}

export type Post = PostMeta & {
  content: string
}

const POSTS_DIR = path.join(process.cwd(), '_posts')

function isPostFile(file: string) {
  return file.endsWith('.md') || file.endsWith('.mdx')
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs.readdirSync(POSTS_DIR)
    .filter(isPostFile)
    .map((file) => file.replace(/\.(md|mdx)$/i, ''))
}

export function getPostBySlug(slug: string): Post | null {
  const fullPathMd = path.join(POSTS_DIR, `${slug}.md`)
  const fullPathMdx = path.join(POSTS_DIR, `${slug}.mdx`)
  const fullPath = fs.existsSync(fullPathMd) ? fullPathMd : fullPathMdx
  if (!fullPath || !fs.existsSync(fullPath)) return null

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  // 日付を Date オブジェクトのまま持ち回らない: gray-matter は Date で返すが、
  // クライアントコンポーネントに渡すと SSR とhydrationでシリアライズ結果が食い違う
  const rawDate = data.date
  const date =
    rawDate instanceof Date
      ? rawDate.toISOString()
      : rawDate
        ? new Date(rawDate).toISOString()
        : new Date().toISOString()

  const meta: PostMeta = {
    slug,
    title: data.title || slug,
    date,
    description: data.description || getExcerpt(content),
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    thumbnail: data.thumbnail || extractFirstImageSrc(content),
    category: data.category === 'daily' ? 'daily' : 'tech', // デフォルトはtech
  }

  return { ...meta, content }
}

export function getAllPostsMeta(filterCategory?: BlogCategory): PostMeta[] {
  const slugs = getAllPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((p): p is Post => Boolean(p))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      description: p.description,
      tags: p.tags,
      thumbnail: p.thumbnail,
      category: p.category,
    }))
    .filter((p) => !filterCategory || p.category === filterCategory)

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function getExcerpt(markdown: string, maxLen = 140): string {
  const noMd = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[#>*_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return noMd.length > maxLen ? `${noMd.slice(0, maxLen)}…` : noMd
}

function extractFirstImageSrc(markdown: string): string | undefined {
  const m = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/)
  return m?.[1]
}

export async function renderPost(slug: string): Promise<RenderedMarkdown | null> {
  const post = getPostBySlug(slug)
  if (!post) return null

  return renderMarkdown(post.content)
}
