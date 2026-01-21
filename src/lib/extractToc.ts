export type TocItem = {
  id: string
  text: string
  level: number
}

/**
 * Markdownコンテンツから見出しを抽出してTocItem配列を生成
 * h1, h2, h3, h4 を対象とする
 * コードブロック内の見出しは除外する
 */
export function extractTocFromMarkdown(markdown: string): TocItem[] {
  // コードブロックの除去（```で囲まれた部分）
  const contentWithoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, '')
  
  const headingRegex = /^(#{1,4})\s+(.+)$/gm
  const items: TocItem[] = []
  const idCountMap = new Map<string, number>() // 重複ID対策用カウンター
  
  let match
  while ((match = headingRegex.exec(contentWithoutCodeBlocks)) !== null) {
    const level = match[1].length
    const text = match[2]
      // インラインコードを除去
      .replace(/`[^`]+`/g, (code) => code.slice(1, -1))
      // リンクのテキスト部分のみ抽出
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // 太字・イタリックを除去
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      // その他のMarkdown記法を除去
      .replace(/[#*_~`]/g, '')
      .trim()
    
    if (!text) continue
    
    // rehype-slugと同じロジックでIDを生成
    const baseId = generateSlug(text)
    
    // 重複IDの場合はサフィックスを追加（rehype-slugと同じ挙動）
    const count = idCountMap.get(baseId) || 0
    const id = count === 0 ? baseId : `${baseId}-${count}`
    idCountMap.set(baseId, count + 1)
    
    items.push({ id, text, level })
  }
  
  return items
}

/**
 * rehype-slugと互換性のあるスラグ生成
 * 日本語対応、特殊文字の処理
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    // スペースをハイフンに
    .replace(/\s+/g, '-')
    // 特殊文字を除去（日本語は維持）
    .replace(/[^\p{L}\p{N}\-]/gu, '')
    // 連続するハイフンを1つに
    .replace(/-+/g, '-')
    // 先頭・末尾のハイフンを除去
    .replace(/^-|-$/g, '')
}
