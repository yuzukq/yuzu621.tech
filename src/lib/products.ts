import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { renderMarkdown } from "@/lib/markdown"

export interface ProductMeta {
  id: string
  title: string
  thumbnail: string
  techStack: string[]
  description: string
  screenshots: string[]
  urls: {
    demo?: string
    github?: string
    website?: string
  }
}

export type Product = ProductMeta & {
  /** 本文(旧: description本文・features・challenges)をレンダリングしたHTML */
  html: string
}

const PRODUCTS_DIR = path.join(process.cwd(), "_products")

function isProductFile(file: string) {
  return file.endsWith(".md")
}

// id/thumbnail欠落は実行時までビルドが検出できない(id欠落→Reactのkeyがundefined、
// thumbnail欠落→next/imageが実行時エラー)ため、ビルド時にthrowして書き手に知らせる
const REQUIRED_FIELDS = ["id", "title", "thumbnail", "description"] as const

function assertRequiredFields(file: string, data: Record<string, unknown>): void {
  const missing = REQUIRED_FIELDS.filter((field) => !data[field])
  if (missing.length > 0) {
    throw new Error(`_products/${file}: 必須フィールドが不足しています(${missing.join(", ")})`)
  }
}

// ファイル名の数値プレフィックス(01-, 02-...)でカード表示順を制御する
export async function getAllProducts(): Promise<Product[]> {
  if (!fs.existsSync(PRODUCTS_DIR)) return []

  const files = fs.readdirSync(PRODUCTS_DIR).filter(isProductFile).sort()

  return Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(PRODUCTS_DIR, file)
      const fileContents = fs.readFileSync(fullPath, "utf8")
      const { data, content } = matter(fileContents)
      assertRequiredFields(file, data)
      const { html } = await renderMarkdown(content)

      const meta: ProductMeta = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        techStack: Array.isArray(data.techStack) ? data.techStack : [],
        description: data.description,
        screenshots: Array.isArray(data.screenshots) ? data.screenshots : [],
        urls: data.urls ?? {},
      }

      return { ...meta, html }
    }),
  )
}
