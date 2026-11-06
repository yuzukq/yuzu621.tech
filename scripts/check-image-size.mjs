#!/usr/bin/env node
// public/images に 1MB を超えるファイルがあれば一覧を出して失敗する(CI 用)。
// 拡張子を問わず数える: GIF など optimize-images.mjs が扱わない形式も見逃さないため

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images')
const MAX_BYTES = 1024 * 1024

const entries = await fs.readdir(IMAGES_DIR, { withFileTypes: true, recursive: true })
const oversized = []
for (const entry of entries) {
  if (!entry.isFile()) continue
  const file = path.join(entry.parentPath, entry.name)
  const { size } = await fs.stat(file)
  if (size > MAX_BYTES) oversized.push({ file: path.relative(IMAGES_DIR, file), size })
}

if (oversized.length > 0) {
  console.error(`public/images に 1MB を超えるファイルが ${oversized.length} 件あります。`)
  for (const { file, size } of oversized) {
    console.error(`  ${(size / 1024 / 1024).toFixed(1)}MB  ${file}`)
  }
  console.error('npm run optimize:images を実行してから再度コミットしてください。')
  process.exit(1)
}

console.log('public/images: 1MB を超えるファイルはありません。')
