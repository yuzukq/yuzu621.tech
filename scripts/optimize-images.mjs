#!/usr/bin/env node
// public/images 配下の JPEG / PNG を、配信に十分なサイズへ縮小・再圧縮して上書きする。
//
// 使い方:
//   npm run optimize:images                # 実行して上書きする
//   npm run optimize:images -- --dry-run   # 書き換えず、処理前後のサイズ表だけを出す
//   npm run optimize:images -- --lossless  # PNG をパレット量子化しない

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images')

const MAX_EDGE_PX = 2560
// 2560px で収まらないときに順に試す長辺。記事本文の表示幅は DPR2 でも 1920px に届かない
const FALLBACK_EDGES_PX = [1920, 1280]
// scripts/check-image-size.mjs の上限と揃える
const MAX_BYTES = 1024 * 1024
const MIN_BYTES = 300 * 1024
const TARGET_EXT_RE = /\.(png|jpe?g)$/i

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const lossless = args.has('--lossless')

async function listImages(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true, recursive: true })
  return entries
    .filter((entry) => entry.isFile() && TARGET_EXT_RE.test(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort()
}

function formatKB(bytes) {
  return `${(bytes / 1024).toFixed(0)}KB`
}

function encode(input, file, maxEdge) {
  // rotate() はメタデータを落とす前に EXIF の向きを画素へ反映させるため、最初に呼ぶ
  const pipeline = sharp(input)
    .rotate()
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })

  return /\.png$/i.test(file)
    ? pipeline.png({ compressionLevel: 9, palette: !lossless, quality: 85 }).toBuffer()
    : pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
}

async function optimize(file) {
  const input = await fs.readFile(file)
  const meta = await sharp(input).metadata()
  const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0)
  if (input.length < MIN_BYTES && longEdge <= MAX_EDGE_PX) return null

  let output
  for (const edge of [MAX_EDGE_PX, ...FALLBACK_EDGES_PX]) {
    output = await encode(input, file, edge)
    if (output.length <= MAX_BYTES) break
  }

  // 縮小せずに再圧縮だけした場合は、元のほうが小さいことがある
  const written = output.length < input.length
  if (written && !dryRun) await fs.writeFile(file, output)
  return { before: input.length, after: written ? output.length : input.length, written }
}

const files = await listImages(IMAGES_DIR)
const rows = []
for (const file of files) {
  const result = await optimize(file)
  if (result) rows.push({ file: path.relative(IMAGES_DIR, file), ...result })
}

let totalBefore = 0
let totalAfter = 0
for (const row of rows) {
  totalBefore += row.before
  totalAfter += row.after
  const status = row.written ? '' : ' (skip: not smaller)'
  console.log(`${formatKB(row.before).padStart(8)} -> ${formatKB(row.after).padStart(8)}  ${row.file}${status}`)
}
console.log(
  `\n${rows.length} files: ${formatKB(totalBefore)} -> ${formatKB(totalAfter)}${dryRun ? ' (dry-run)' : ''}`,
)
