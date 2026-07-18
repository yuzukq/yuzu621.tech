// SEO関連の定数と構造化データ(JSON-LD)生成ヘルパーを集約するモジュール。
// 各ページの generateMetadata / metadata や JSON-LD 出力はここを参照する。

export const SITE_URL = 'https://yuzu621.tech'
export const SITE_NAME = 'yuzu621.tech'
// ルートレイアウトの絶対タイトル(トップ相当のページ = ブログ一覧(tech)・ポートフォリオ)。
// 現行の挙動を踏襲し、変更しない。
export const SITE_TITLE = 'Yuzu portfolio'
export const DEFAULT_DESCRIPTION =
  'Yuzu のポートフォリオサイト。制作物、技術ブログ、スキル・経歴を公開しています。'
export const AUTHOR_NAME = 'Yuzu'
// サイト共通のデフォルトOG画像 (src/app/opengraph-image.tsx が生成する)。
// Next.js のファイル規約による自動継承は、各ページが独自に openGraph オブジェクトを
// 定義すると segment 単位で丸ごと上書きされてしまうため、各ページの
// openGraph.images / twitter.images でこのパスを明示的にフォールバックとして指定する。
export const DEFAULT_OG_IMAGE_PATH = '/opengraph-image'

/**
 * サイトルート基準の絶対URLを組み立てる。
 * metadataBase が効かない文脈(JSON-LDのプレーンな文字列値等)向け。
 */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}

/**
 * 日付を ISO 8601 文字列に正規化する。
 * gray-matter は frontmatter の裸日付(例: `date: 2025-11-08`)を
 * 実行時に Date インスタンスとして返すため、string / Date どちらでも
 * 受け取れるようにしておく。
 */
function toIsoDate(date: string | Date): string {
  return new Date(date).toISOString()
}

/**
 * JSON-LD を <script type="application/ld+json"> として出力するための props。
 * 使い方: <script {...jsonLdScriptProps(data)} />
 */
export function jsonLdScriptProps(data: unknown) {
  return {
    type: 'application/ld+json' as const,
    // JSON-LD の中に閉じタグ文字列が入り HTML パーサを混乱させないよう軽くエスケープする。
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, '\\u003c'),
    },
  }
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
  }
}

export function buildPersonJsonLd(options: { sameAs: string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR_NAME,
    url: absoluteUrl('/portfolio'),
    sameAs: options.sameAs,
  }
}

export function buildBlogPostingJsonLd(post: {
  slug: string
  title: string
  description?: string
  date: string | Date
  image?: string
  tags?: string[]
}) {
  const url = absoluteUrl(`/blog/${post.slug}`)
  const publishedIso = toIsoDate(post.date)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: publishedIso,
    // frontmatter に更新日フィールドが無いため、公開日と同値にする。
    dateModified: publishedIso,
    image: post.image ? [absoluteUrl(post.image)] : undefined,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: absoluteUrl('/portfolio'),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: post.tags && post.tags.length > 0 ? post.tags.join(', ') : undefined,
  }
}
