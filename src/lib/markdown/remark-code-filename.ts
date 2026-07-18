// ```js:app.js の `:ファイル名` を rehype-pretty-code の title メタに変換する
// (lang: 'js', meta: 'title="app.js"')。

type MdastNode = {
  type?: string
  lang?: string | null
  meta?: string | null
  children?: MdastNode[]
  [key: string]: unknown
}

// 言語部分を限定しないと、URLを含む行など「:」入りの通常メタを誤変換する
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
