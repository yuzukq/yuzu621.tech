// Qiita 互換 Markdown パイプライン組立（unified）。
//
// 順序:
//   remarkParse → remarkGfm → remarkBreaks → remarkCodeFilename → remarkNote
//   → remarkLinkCard → remarkRehype(allowDangerousHtml) → rehypeSlug
//   → rehypeAutolinkHeadings(behavior: 'wrap') → rehypePrettyCode → rehypeStringify(allowDangerousHtml)
//
// remarkLinkCard は OGP取得のため非同期。unified/trough は Promise を返す
// transformer をサポートしているため、そのまま use() できる。

import { unified, type Plugin } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'

import remarkCodeFilenamePlugin from './remark-code-filename'
import remarkNotePlugin, { ensureNoteBlankLines } from './remark-note'
import remarkLinkCardPlugin from './remark-link-card'
import rehypeExtractToc, { type TocItem } from './rehype-extract-toc'

export type { TocItem }

// 自作プラグインは軽量な独自mdast型で実装しているため、unifiedの厳密な
// Node型とは構造的に一致しない。既存の remark-latex-breaks と同様、
// use() に渡す際にのみ Plugin 型へキャストする。
const remarkCodeFilename = remarkCodeFilenamePlugin as unknown as Plugin
const remarkNote = remarkNotePlugin as unknown as Plugin
const remarkLinkCard = remarkLinkCardPlugin as unknown as Plugin

export interface RenderedMarkdown {
  html: string
  /** 目次用の見出し一覧 (h1〜h3、出現順) */
  toc: TocItem[]
}

export async function renderMarkdown(markdown: string): Promise<RenderedMarkdown> {
  const preprocessed = ensureNoteBlankLines(markdown)

  // 目次はパイプライン実行中に rehype-extract-toc がこの配列へ収集する。
  const toc: TocItem[] = []

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkCodeFilename)
    .use(remarkNote)
    .use(remarkLinkCard)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeExtractToc as unknown as Plugin<[{ onHeading: (item: TocItem) => void }]>, {
      onHeading: (item: TocItem) => {
        toc.push(item)
      },
    })
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypePrettyCode, {
      theme: { dark: 'github-dark-default', light: 'github-light' },
      keepBackground: false,
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(preprocessed)

  return { html: String(file), toc }
}
