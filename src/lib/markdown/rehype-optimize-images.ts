// 本文の <img> を next/image と同じ srcset 付き出力に置き換える rehype プラグイン。
// Markdown は dangerouslySetInnerHTML で描画するため <Image> を使えず、
// getImageProps() で属性だけを生成して hast に書き込む。

import fs from 'node:fs'
import path from 'node:path'
import { imageSize } from 'image-size'
import { getImageProps } from 'next/image'
import { ARTICLE_IMAGE_SIZES } from '@/lib/image-sizes'

type HastNode = {
  type: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

const LAZY_PROPS = { loading: 'lazy', decoding: 'async' } as const

// EXIF の orientation 5〜8 は90度回転。ブラウザも最適化サーバー(sharp)も
// 回転後の向きで表示するので、縦横比は回転後の寸法で確保する
function isQuarterTurn(orientation: number | undefined): boolean {
  return orientation !== undefined && orientation >= 5 && orientation <= 8
}

function readDimensions(src: string): { width: number; height: number } | undefined {
  try {
    const buffer = fs.readFileSync(path.join(process.cwd(), 'public', decodeURI(src)))
    const { width, height, orientation } = imageSize(buffer)
    if (!width || !height) return undefined
    return isQuarterTurn(orientation) ? { width: height, height: width } : { width, height }
  } catch {
    return undefined
  }
}

function optimizeImage(node: HastNode) {
  const properties = (node.properties ??= {})
  const src = properties.src

  // 外部URLは最適化サーバーの許可ホスト外なので遅延読み込みだけにとどめる
  if (typeof src !== 'string' || !src.startsWith('/') || src.startsWith('//')) {
    Object.assign(properties, LAZY_PROPS)
    return
  }

  // 記事を追加するたびに画像の不備でビルドが落ちないよう、throw せず素の img に倒す
  const dimensions = readDimensions(src)
  if (!dimensions) {
    console.warn(`[rehype-optimize-images] 画像の寸法を取得できません: ${src}`)
    Object.assign(properties, LAZY_PROPS)
    return
  }

  const { props } = getImageProps({
    src,
    alt: typeof properties.alt === 'string' ? properties.alt : '',
    width: dimensions.width,
    height: dimensions.height,
    sizes: ARTICLE_IMAGE_SIZES,
    quality: 75,
  })

  Object.assign(properties, {
    src: props.src,
    srcSet: props.srcSet,
    sizes: props.sizes,
    width: props.width,
    height: props.height,
    loading: props.loading,
    decoding: props.decoding,
  })
}

function walk(node: HastNode) {
  if (node.type === 'element' && node.tagName === 'img') {
    optimizeImage(node)
    return
  }
  for (const child of node.children ?? []) {
    walk(child)
  }
}

export default function rehypeOptimizeImages() {
  return function transformer(tree: HastNode) {
    walk(tree)
  }
}
