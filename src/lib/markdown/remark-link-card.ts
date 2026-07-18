// 裸URLだけの段落をビルド時OGP取得でリンクカードHTMLに変換する。
// 取得失敗時はノードを変更しない(プレーンな外部リンクのまま)。

import { getOgp } from './ogp'

type MdastNode = {
  type: string
  url?: string
  value?: string
  children?: MdastNode[]
  [key: string]: unknown
}

const BARE_URL_RE = /^https?:\/\/\S+$/

function extractBareUrl(node: MdastNode): string | null {
  if (node.type !== 'paragraph') return null
  const children = node.children ?? []
  if (children.length !== 1) return null
  const child = children[0]

  // remark-gfm の autolink はURLを link ノード化するため、text だけ見ても検出できない
  if (child.type === 'link' && typeof child.url === 'string') {
    const linkChildren = child.children ?? []
    if (linkChildren.length !== 1) return null
    const linkChild = linkChildren[0]
    if (linkChild.type !== 'text' || typeof linkChild.value !== 'string') return null
    const url = child.url.trim()
    if (linkChild.value.trim() !== url) return null // カスタムテキスト付きリンクは対象外
    return BARE_URL_RE.test(url) ? url : null
  }

  if (child.type === 'text' && typeof child.value === 'string') {
    const trimmed = child.value.trim()
    return BARE_URL_RE.test(trimmed) ? trimmed : null
  }

  return null
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildFaviconUrl(host: string): string {
  return `https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(host)}`
}

function buildCardHtml(url: string, title: string, description: string | undefined, image: string | undefined, host: string): string {
  const descriptionHtml = description
    ? `<span class="link-card-description">${escapeHtml(description)}</span>`
    : ''
  const imageHtml = image
    ? `<span class="link-card-image"><img src="${escapeHtml(image)}" alt=""></span>`
    : ''

  return (
    `<a class="link-card" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">` +
    `<span class="link-card-text">` +
    `<span class="link-card-title">${escapeHtml(title)}</span>` +
    descriptionHtml +
    `<span class="link-card-meta"><img class="link-card-favicon" src="${escapeHtml(buildFaviconUrl(host))}" alt="">${escapeHtml(host)}</span>` +
    `</span>` +
    imageHtml +
    `</a>`
  )
}

type Target = { parent: MdastNode; index: number; url: string }

function collectTargets(node: MdastNode, targets: Target[]) {
  const children = node.children
  if (!Array.isArray(children)) return

  children.forEach((child, index) => {
    const url = extractBareUrl(child)
    if (url) {
      targets.push({ parent: node, index, url })
    } else {
      collectTargets(child, targets)
    }
  })
}

export default function remarkLinkCard() {
  return async function transformer(tree: MdastNode) {
    const targets: Target[] = []
    collectTargets(tree, targets)
    if (targets.length === 0) return

    await Promise.all(
      targets.map(async ({ parent, index, url }) => {
        let host: string
        try {
          host = new URL(url).host
        } catch {
          return
        }

        const ogp = await getOgp(url).catch(() => null)
        if (!ogp) return

        const children = parent.children
        if (!children) return
        children[index] = {
          type: 'html',
          value: buildCardHtml(url, ogp.title, ogp.description, ogp.image, host),
        }
      }),
    )
  }
}
