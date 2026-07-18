// OGP 取得(組み込み fetch + 正規表現)。HTMLパーサー依存を増やすほどの
// 精度は不要のため導入しない。結果は .cache/ogp.json に永続化する。

import fs from 'node:fs'
import path from 'node:path'

export type OgpData = {
  title: string
  description?: string
  image?: string
}

type CacheEntry = {
  fetchedAt: number
  ok: boolean
  data?: OgpData
}

type Cache = Record<string, CacheEntry>

const CACHE_DIR = path.join(process.cwd(), '.cache')
const CACHE_FILE = path.join(CACHE_DIR, 'ogp.json')
const SUCCESS_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 成功: 30日
const FAILURE_TTL_MS = 1000 * 60 * 60 * 6 // 失敗: 6時間（再取得を試みる）
const FETCH_TIMEOUT_MS = 5000

let cache: Cache | null = null

function loadCache(): Cache {
  if (cache) return cache
  try {
    const raw = fs.readFileSync(CACHE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    cache = parsed && typeof parsed === 'object' ? (parsed as Cache) : {}
  } catch {
    cache = {}
  }
  return cache
}

function saveCache() {
  if (!cache) return
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
  } catch {
    // 書込不可な環境(Vercelランタイム等)があるため、失敗してもビルドは続行する
  }
}

function decodeEntities(input: string): string {
  return input
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

export function extractMetaContent(html: string, prop: string): string | undefined {
  const escaped = prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${escaped}["'][^>]*>`, 'i'),
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m) return decodeEntities(m[1])
  }
  return undefined
}

function extractTitleTag(html: string): string | undefined {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return m ? decodeEntities(m[1]) : undefined
}

export function resolveUrl(base: string, maybeRelative: string): string {
  try {
    return new URL(maybeRelative, base).toString()
  } catch {
    return maybeRelative
  }
}

async function fetchOgp(url: string): Promise<OgpData | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; yuzu621tech-bot/1.0; +https://yuzu621.tech)',
        accept: 'text/html,application/xhtml+xml',
      },
    })
    if (!res.ok) return null

    const contentType = res.headers.get('content-type') ?? ''
    if (contentType && !/html/i.test(contentType)) return null

    const html = await res.text()
    const title = extractMetaContent(html, 'og:title') ?? extractTitleTag(html)
    if (!title) return null

    const description = extractMetaContent(html, 'og:description') ?? extractMetaContent(html, 'description')
    const rawImage = extractMetaContent(html, 'og:image')
    const image = rawImage ? resolveUrl(res.url || url, rawImage) : undefined

    return { title, description, image }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// 失敗時は throw せず null(呼び出し側がプレーンリンクへフォールバックする前提)
export async function getOgp(url: string): Promise<OgpData | null> {
  const store = loadCache()
  const cached = store[url]
  const now = Date.now()

  if (cached) {
    const ttl = cached.ok ? SUCCESS_TTL_MS : FAILURE_TTL_MS
    if (now - cached.fetchedAt < ttl) {
      return cached.ok ? (cached.data ?? null) : null
    }
  }

  const data = await fetchOgp(url)
  store[url] = { fetchedAt: now, ok: Boolean(data), data: data ?? undefined }
  saveCache()
  return data
}
