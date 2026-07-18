// 外部プラットフォームの記事をブログ一覧へ混ぜる。取得失敗時は必ず空配列/
// undefined へフォールバックし、外部要因で一覧を壊さない。
// fetch は Next.js の Data Cache(revalidate)に載せる: `/` が動的レンダリング
// のため、素の fetch だとリクエスト毎に外部APIを叩いてしまう。

import type { BlogCategory } from '@/lib/posts'
import { manualExternalArticles } from '@/data/external-articles'
import { extractMetaContent, resolveUrl } from '@/lib/markdown/ogp'

export interface ExternalArticle {
  title: string
  /** 記事の外部URL(一覧カードはここへ新規タブで遷移する) */
  url: string
  /** ISO文字列 or YYYY-MM-DD */
  date: string
  /** 出典名。バッジ表示に使う (例: 'Qiita', 'Zenn', 'Company Tech Blog') */
  source: string
  tags?: string[]
  /** 未指定ならOGP画像を自動取得 */
  thumbnail?: string
  /** 省略時 'tech' */
  category?: BlogCategory
}

const QIITA_USER = 'yuzukq'
const QIITA_API = `https://qiita.com/api/v2/users/${QIITA_USER}/items?per_page=100`
const LIST_REVALIDATE_SEC = 60 * 60 // Qiita記事一覧: 1時間
const OGP_REVALIDATE_SEC = 60 * 60 * 24 // OGPサムネイル: 24時間

interface QiitaItem {
  title: string
  url: string
  created_at: string
  tags: Array<{ name: string }>
}

async function fetchQiitaArticles(): Promise<ExternalArticle[]> {
  try {
    const res = await fetch(QIITA_API, {
      next: { revalidate: LIST_REVALIDATE_SEC },
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return []

    const items = (await res.json()) as QiitaItem[]
    if (!Array.isArray(items)) return []

    return items.map((item) => ({
      title: item.title,
      url: item.url,
      date: item.created_at,
      source: 'Qiita',
      tags: item.tags?.map((t) => t.name),
      category: 'tech' as const,
    }))
  } catch {
    return []
  }
}

async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, {
      next: { revalidate: OGP_REVALIDATE_SEC },
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; yuzu621tech-bot/1.0; +https://yuzu621.tech)',
        accept: 'text/html,application/xhtml+xml',
      },
    })
    if (!res.ok) return undefined
    const html = await res.text()
    const rawImage = extractMetaContent(html, 'og:image')
    return rawImage ? resolveUrl(res.url || url, rawImage) : undefined
  } catch {
    return undefined
  }
}

function toIsoDate(date: string): string {
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString()
}

export async function getExternalArticles(category: BlogCategory): Promise<ExternalArticle[]> {
  const qiita = await fetchQiitaArticles()
  const all = [...qiita, ...manualExternalArticles]
  const filtered = all.filter((a) => (a.category ?? 'tech') === category)

  return Promise.all(
    filtered.map(async (article) => ({
      ...article,
      date: toIsoDate(article.date),
      thumbnail: article.thumbnail ?? (await fetchOgImage(article.url)),
    })),
  )
}
