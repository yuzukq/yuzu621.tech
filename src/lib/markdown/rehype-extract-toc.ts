// 記事HTMLから目次(TOC)用の見出し一覧を抽出する rehype プラグイン。
//
// rehype-slug の後・rehype-autolink-headings の前に配置し、id が付与済みで
// まだ <a> に包まれていない h1〜h3 を対象にする。結果は options.onHeading
// コールバックで呼び出し元(renderMarkdown)に渡す。
// 他の自作プラグイン同様、unist-util-visit 等の追加依存は使わない。

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
    return // 見出しの内側にさらに見出しは無い
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
