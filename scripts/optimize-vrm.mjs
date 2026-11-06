#!/usr/bin/env node
// VRM(GLB)に埋め込まれた PNG テクスチャを縮小・再圧縮し、同一画像の重複を除いて書き出す。
//
// 使い方:
//   npm run optimize:vrm -- <input.vrm> <output.vrm>            # PNG はロスレスで再エンコード
//   npm run optimize:vrm -- <input.vrm> <output.vrm> --palette  # PNG をパレット量子化する
//
// gltf-transform などの汎用ツールを使わないのは、VRM 0.0 の extensions.VRM を保持できない、
// あるいは書き出し時にインデックスが振り直されてしまうため。glTF の JSON 構造には触れず、
// 画像の bufferView のバイト列と、各 bufferView の byteOffset / byteLength だけを書き換える。

import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import sharp from 'sharp'

const GLB_MAGIC = 0x46546c67 // 'glTF'
const CHUNK_JSON = 0x4e4f534a // 'JSON'
const CHUNK_BIN = 0x004e4942 // 'BIN\0'
const MAX_TEXTURE_PX = 1024
// 参照されなくなった bufferView を消さずに残す大きさ。消すと後続のインデックスがずれる
const DUMMY_BYTES = 4

const positional = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))
const palette = process.argv.includes('--palette')
const [inputPath, outputPath] = positional
if (!inputPath || !outputPath) {
  console.error('usage: node scripts/optimize-vrm.mjs <input.vrm> <output.vrm> [--palette]')
  process.exit(1)
}
if (inputPath === outputPath) {
  console.error('入力ファイルを上書きしないよう、出力先には別のパスを指定してください。')
  process.exit(1)
}

function parseGlb(buf) {
  if (buf.readUInt32LE(0) !== GLB_MAGIC || buf.readUInt32LE(4) !== 2) {
    throw new Error('GLB(glTF 2.0 バイナリ)ではありません')
  }
  let offset = 12
  let json
  let bin
  while (offset < buf.length) {
    const length = buf.readUInt32LE(offset)
    const type = buf.readUInt32LE(offset + 4)
    const data = buf.subarray(offset + 8, offset + 8 + length)
    if (type === CHUNK_JSON) json = JSON.parse(data.toString('utf8'))
    else if (type === CHUNK_BIN) bin = data
    offset += 8 + length
  }
  if (!json || !bin) throw new Error('JSON チャンクまたは BIN チャンクがありません')
  return { json, bin }
}

function align4(n) {
  return (n + 3) & ~3
}

function chunk(type, data, padByte) {
  const padded = Buffer.alloc(align4(data.length), padByte)
  data.copy(padded)
  const header = Buffer.alloc(8)
  header.writeUInt32LE(padded.length, 0)
  header.writeUInt32LE(type, 4)
  return Buffer.concat([header, padded])
}

function formatKB(bytes) {
  return `${(bytes / 1024).toFixed(0)}KB`
}

async function encodeTexture(data) {
  const output = await sharp(data)
    .resize({ width: MAX_TEXTURE_PX, height: MAX_TEXTURE_PX, fit: 'inside', withoutEnlargement: true })
    .png(palette ? { compressionLevel: 9, palette: true, quality: 90 } : { compressionLevel: 9 })
    .toBuffer()
  return output.length < data.length ? output : data
}

const input = await fs.readFile(inputPath)
const { json, bin } = parseGlb(input)
if (json.buffers?.length !== 1) throw new Error('buffers が1つの GLB だけに対応しています')

const viewData = json.bufferViews.map((view) =>
  bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength),
)

const firstViewByHash = new Map()
const rows = []
for (const [index, image] of json.images.entries()) {
  if (image.bufferView === undefined) continue
  const original = viewData[image.bufferView]
  const hash = crypto.createHash('sha256').update(original).digest('hex')
  const label = `images[${index}] ${image.name ?? ''}`

  const firstView = firstViewByHash.get(hash)
  if (firstView !== undefined) {
    viewData[image.bufferView] = Buffer.alloc(DUMMY_BYTES)
    image.bufferView = firstView
    rows.push({ label, before: original.length, after: 0, note: `duplicate of bufferView ${firstView}` })
    continue
  }
  firstViewByHash.set(hash, image.bufferView)

  const encoded = await encodeTexture(original)
  const meta = await sharp(original).metadata()
  const encodedMeta = encoded === original ? meta : await sharp(encoded).metadata()
  viewData[image.bufferView] = encoded
  rows.push({
    label,
    before: original.length,
    after: encoded.length,
    note: `${meta.width}x${meta.height} -> ${encodedMeta.width}x${encodedMeta.height}`,
  })
}

let binLength = 0
for (const [index, view] of json.bufferViews.entries()) {
  // accessor の要素は最大 4 byte なので、bufferView の先頭を 4 byte 境界にそろえれば足りる
  binLength = align4(binLength)
  view.byteOffset = binLength
  view.byteLength = viewData[index].length
  binLength += view.byteLength
}
const newBin = Buffer.alloc(binLength)
for (const [index, view] of json.bufferViews.entries()) {
  viewData[index].copy(newBin, view.byteOffset)
}
json.buffers[0].byteLength = binLength

const body = Buffer.concat([
  chunk(CHUNK_JSON, Buffer.from(JSON.stringify(json), 'utf8'), 0x20),
  chunk(CHUNK_BIN, newBin, 0x00),
])
const header = Buffer.alloc(12)
header.writeUInt32LE(GLB_MAGIC, 0)
header.writeUInt32LE(2, 4)
header.writeUInt32LE(12 + body.length, 8)
const output = Buffer.concat([header, body])
await fs.writeFile(outputPath, output)

for (const row of rows) {
  console.log(`${formatKB(row.before).padStart(8)} -> ${formatKB(row.after).padStart(8)}  ${row.label}  (${row.note})`)
}
const texturesBefore = rows.reduce((sum, row) => sum + row.before, 0)
const texturesAfter = rows.reduce((sum, row) => sum + row.after, 0)
console.log(`\ntextures: ${formatKB(texturesBefore)} -> ${formatKB(texturesAfter)}${palette ? ' (palette)' : ''}`)
console.log(`file:     ${formatKB(input.length)} -> ${formatKB(output.length)}  ${outputPath}`)
