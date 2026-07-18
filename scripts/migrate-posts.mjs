#!/usr/bin/env node
// _posts/*.md を Qiita互換Markdownエンジン向けに機械的移行するスクリプト。
//
// 旧 remark-latex-breaks 記法（行末の `\` による強制改行）を廃止するため、
// フロントマター・コードフェンスの外側にある行末の `\`（1個以上の連続）を除去し、
// `\` のみの行は削除する。文章内容そのものは一切変更しない。
//
// 依存追加なしのプレーンNodeスクリプト。
//
// 使い方:
//   node scripts/migrate-posts.mjs         # 実行して _posts/*.md を書き換える
//   node scripts/migrate-posts.mjs --check # 書き換えず、変更が必要な行数だけ表示する（CI等向け）

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const POSTS_DIR = path.join(__dirname, '..', '_posts')

const FENCE_RE = /^(```|~~~)/
// 行末の「バックスラッシュの連続 + 空白」を1回以上繰り返すパターンをまとめて対象にする。
// 例: "text\\" だけでなく "text\\ \\"（空白区切りで複数回escapeが連続する行）も
// 末尾の連続分をすべて除去できるようにするため、単純な `\\+\s*$` ではなく繰り返しで捉える。
const TRAILING_BACKSLASH_RE = /(?:\\+\s*)+$/
const ONLY_BACKSLASH_RE = /^(?:\\+\s*)+$/

function migrateContent(content) {
  const hasTrailingNewline = content.endsWith('\n')
  const lines = content.split('\n')

  const output = []
  let removed = 0
  let modified = 0

  let inFrontmatter = false
  let inFence = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // フロントマター: 先頭行が `---` の場合、次の `---` までは対象外
    if (i === 0 && trimmed === '---') {
      inFrontmatter = true
      output.push(line)
      continue
    }
    if (inFrontmatter) {
      output.push(line)
      if (trimmed === '---') inFrontmatter = false
      continue
    }

    // コードフェンス: 開始/終了行自体は変更せず、内部もスキップ
    if (FENCE_RE.test(trimmed)) {
      inFence = !inFence
      output.push(line)
      continue
    }
    if (inFence) {
      output.push(line)
      continue
    }

    // `\` のみの行は削除
    if (ONLY_BACKSLASH_RE.test(line)) {
      removed++
      continue
    }

    // 行末の連続する `\` を除去
    if (TRAILING_BACKSLASH_RE.test(line)) {
      output.push(line.replace(TRAILING_BACKSLASH_RE, ''))
      modified++
      continue
    }

    output.push(line)
  }

  let result = output.join('\n')
  if (hasTrailingNewline && !result.endsWith('\n')) result += '\n'

  return { result, removed, modified }
}

function main() {
  const checkOnly = process.argv.includes('--check')

  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`_posts ディレクトリが見つかりません: ${POSTS_DIR}`)
    process.exit(1)
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
  let totalRemoved = 0
  let totalModified = 0
  let totalChangedFiles = 0

  for (const file of files) {
    const fullPath = path.join(POSTS_DIR, file)
    const original = fs.readFileSync(fullPath, 'utf8')
    const { result, removed, modified } = migrateContent(original)

    if (removed > 0 || modified > 0) {
      totalChangedFiles++
      totalRemoved += removed
      totalModified += modified
      console.log(`${file}: 削除${removed}行 / 除去${modified}行`)
      if (!checkOnly) {
        fs.writeFileSync(fullPath, result)
      }
    }
  }

  console.log('---')
  console.log(
    `${checkOnly ? '[check] ' : ''}対象ファイル${totalChangedFiles}件 / 削除${totalRemoved}行 / 除去${totalModified}行`,
  )
}

main()
