// 外部プラットフォームに書いた記事のうち、自動連携していないもの(Zenn・
// 会社Techブログなど)をここに手動で追加する。ブログ一覧(techタブ)に
// ローカル記事と日付順で混ざって表示される。
//
// ※ Qiita は自動取得(src/lib/external-articles.ts)なのでここに書かない。
// ※ thumbnail を省略すると記事URLのOGP画像を自動取得する。
// ※ サムネイルのホストを src/lib/external-image-hosts.ts に追加すると、
//   next/image で縮小・WebP化して配信される。追加しなくても原寸のまま表示はされる。
// ※ category を省略すると 'tech' 扱い。
import type { ExternalArticle } from '@/lib/external-articles'

export const manualExternalArticles: ExternalArticle[] = [
  // 例:
  // {
  //   title: 'Zennに書いた記事のタイトル',
  //   url: 'https://zenn.dev/yuzukq/articles/xxxxxxxxxxxx',
  //   date: '2026-08-01',
  //   source: 'Zenn',
  //   tags: ['Next.js'],
  // },
]
