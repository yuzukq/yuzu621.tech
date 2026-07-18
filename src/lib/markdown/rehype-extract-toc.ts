// 目次用の見出し(id/text/depth)を抽出する rehype プラグイン。
// 配置は rehype-slug の後(id が必要)・rehype-autolink-headings の前
// (wrap後は見出し直下が <a> になりテキスト抽出が変わる)に固定。

export interface TocItem {
  /** rehype-slug が付与した見出しの id (アンカー先) */
  id: string
  /** 見出しのプレーンテキスト */
  text: string
  /** 見出しレベル (1〜3) */
  depth: number
}

type HastNode = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

const HEADING_DEPTH: Record<string, number> = { h1: 1, h2: 2, h3: 3 }

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? ""
  return (node.children ?? []).map(textOf).join("")
}

function walk(node: HastNode, onHeading: (item: TocItem) => void) {
  const depth = node.tagName ? HEADING_DEPTH[node.tagName] : undefined
  if (depth !== undefined) {
    const id = node.properties?.id
    if (typeof id === "string" && id) {
      const text = textOf(node).trim()
      if (text) onHeading({ id, text, depth })
    }
    return
  }
  for (const child of node.children ?? []) {
    walk(child, onHeading)
  }
}

export default function rehypeExtractToc(options: { onHeading: (item: TocItem) => void }) {
  return function transformer(tree: HastNode) {
    walk(tree, options.onHeading)
  }
}
