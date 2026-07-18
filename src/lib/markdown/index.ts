// Qiita 互換 Markdown パイプライン(unified)。
// 自作プラグインでは unist-util-visit を使わない: node_modules には存在するが
// package.json 未宣言の phantom dependency になるため、手書きの再帰走査で辿る。

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

// 自作プラグインは軽量な独自mdast型で書いており unified の Node 型と構造一致
// しないため、use() に渡す箇所でのみキャストする
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
