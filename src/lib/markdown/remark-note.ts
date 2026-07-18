// Qiita 互換の note ブロック記法。
//
//   :::note info
//   補足テキスト
//   :::
//
// `info`(省略時デフォルト) / `warn` / `alert` に対応し、
// `<div class="note note-info">...</div>` 等へ変換する。
//
// 実装は2段構成:
//   1. ensureNoteBlankLines: unified に渡す前の生 Markdown 前処理。
//      コードフェンス外の `:::note...` / `:::` 行の前後に空行を保証し、
//      remark-parse がそれらを独立した段落として解釈できるようにする。
//   2. remarkNote: mdast トランスフォーマー。トップレベルの子ノードを走査し、
//      `:::note` 段落 〜 `:::` 段落までを 1 つの div ノードにまとめる。
//      内部のノードはそのまま子として保持されるため、Markdown として通常どおり解釈される。
//
// unist-util-visit 等の追加依存は使わず、素の配列走査で完結させている。

type MdastNode = {
  type: string
  children?: MdastNode[]
  data?: Record<string, unknown>
  value?: string
  [key: string]: unknown
}

type NoteType = 'info' | 'warn' | 'alert'

const OPEN_RE = /^:::note(?:\s+(info|warn|alert))?\s*$/
const CLOSE_RE = /^:::\s*$/
const FENCE_RE = /^(```|~~~)/

// --- 1. 生Markdown前処理 -----------------------------------------------

function isMarkerLine(trimmed: string): boolean {
  return OPEN_RE.test(trimmed) || CLOSE_RE.test(trimmed)
}

export function ensureNoteBlankLines(markdown: string): string {
  const lines = markdown.split('\n')
  const output: string[] = []
  let inFence = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (FENCE_RE.test(trimmed)) {
      inFence = !inFence
      output.push(line)
      continue
    }

    // インデントが深い（4スペース以上）行はコードブロック相当なのでマーカー扱いしない
    const indent = line.length - line.trimStart().length
    if (!inFence && indent < 4 && isMarkerLine(trimmed)) {
      if (output.length > 0 && output[output.length - 1].trim() !== '') {
        output.push('')
      }
      output.push(line)
      const next = lines[i + 1]
      if (next !== undefined && next.trim() !== '') {
        output.push('')
      }
      continue
    }

    output.push(line)
  }

  return output.join('\n')
}

// --- 2. mdast トランスフォーマー ----------------------------------------

function getTopLevelMarkerText(node: MdastNode): string | null {
  if (node.type !== 'paragraph') return null
  const children = node.children ?? []
  if (children.length !== 1) return null
  const child = children[0]
  if (child.type !== 'text' || typeof child.value !== 'string') return null
  return child.value.trim()
}

function buildNoteNode(noteType: NoteType, children: MdastNode[]): MdastNode {
  return {
    type: 'note',
    children,
    data: {
      hName: 'div',
      hProperties: { className: ['note', `note-${noteType}`] },
    },
  }
}

function transformTopLevel(nodes: MdastNode[]): MdastNode[] {
  const result: MdastNode[] = []
  let i = 0

  while (i < nodes.length) {
    const node = nodes[i]
    const text = getTopLevelMarkerText(node)
    const openMatch = text !== null ? text.match(OPEN_RE) : null

    if (openMatch) {
      const noteType = (openMatch[1] as NoteType | undefined) ?? 'info'

      // 対応する閉じ `:::` を探す（ネストはサポートしない）
      let closeIndex = -1
      for (let j = i + 1; j < nodes.length; j++) {
        const innerText = getTopLevelMarkerText(nodes[j])
        if (innerText !== null && CLOSE_RE.test(innerText)) {
          closeIndex = j
          break
        }
      }

      if (closeIndex === -1) {
        // 閉じタグが見つからない場合は変換せずそのまま出力（ビルドを壊さない）
        result.push(node)
        i++
        continue
      }

      const inner = nodes.slice(i + 1, closeIndex)
      result.push(buildNoteNode(noteType, inner))
      i = closeIndex + 1
      continue
    }

    result.push(node)
    i++
  }

  return result
}

export default function remarkNote() {
  return function transformer(tree: MdastNode) {
    if (Array.isArray(tree.children)) {
      tree.children = transformTopLevel(tree.children)
    }
  }
}
