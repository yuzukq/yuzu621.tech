// Qiita 互換の note ブロック(:::note info|warn|alert 〜 :::)。
//
// mdast だけでは処理できない: remark-parse は ::: を専用ブロックとして解釈せず、
// 空行がないと前後のテキストと同じ段落に混ざるため、パース前に生 Markdown へ
// 空行を挿入して(ensureNoteBlankLines)マーカーを独立段落に固定してから畳む。

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

    // 4スペース以上のインデントはコードブロック相当のため、マーカーとして扱わない
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

      // 最も近い閉じ ::: を採用する(ネストは非対応)
      let closeIndex = -1
      for (let j = i + 1; j < nodes.length; j++) {
        const innerText = getTopLevelMarkerText(nodes[j])
        if (innerText !== null && CLOSE_RE.test(innerText)) {
          closeIndex = j
          break
        }
      }

      if (closeIndex === -1) {
        // 閉じ忘れは変換せず原文のまま出す(記事のtypoでビルドを落とさない)
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
