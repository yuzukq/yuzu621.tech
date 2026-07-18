// ```js:app.js のようなフェンス言語表記を、rehype-pretty-code の
// title メタ（ファイル名ヘッダ表示）に変換する remark プラグイン。
//
// 例: ```js:app.js  → lang: 'js', meta: 'title="app.js"'
//
// unist-util-visit 等の追加依存を避けるため、手書きの再帰走査で mdast を辿る。

type MdastNode = {
  type?: string
  lang?: string | null
  meta?: string | null
  children?: MdastNode[]
  [key: string]: unknown
}

// 言語部分は英数字・ハイフン・アンダースコア・プラスのみ許容（ts, js, c++ 等）
const FILENAME_LANG_RE = /^([A-Za-z0-9_+-]+):(.+)$/

function escapeDoubleQuotes(value: string): string {
  return value.replace(/"/g, '&quot;')
}

function visitCodeNodes(node: MdastNode) {
  if (node.type === 'code' && typeof node.lang === 'string') {
    const match = node.lang.match(FILENAME_LANG_RE)
    if (match) {
      const [, lang, filename] = match
      node.lang = lang
      const titleMeta = `title="${escapeDoubleQuotes(filename.trim())}"`
      node.meta = node.meta ? `${titleMeta} ${node.meta}` : titleMeta
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      visitCodeNodes(child)
    }
  }
}

export default function remarkCodeFilename() {
  return function transformer(tree: MdastNode) {
    visitCodeNodes(tree)
  }
}
