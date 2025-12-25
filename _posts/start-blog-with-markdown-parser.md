---
slug: start-blog-with-markdown-parser
title: マークダウンパーサーを使ったブログの運用
date: 2025-10-27
description: Next.js と Chakra UI で Markdown ベースのブログ機能を実装しました．仕組みと設計のこだわりを紹介します．
tags:
  - Next.js
  - マークダウンパーサー
  - テスト投稿
thumbnail: /images/blog/20251027/hello_icatch.png
category: tech
---

この記事は，Markdown ファイルを Git で管理し，Vercel のビルドで自動公開されるブログ機能の第一弾です．

## QiitaやZennを使わないの？ なぜ Git ベース？ 
- 技術領域以外の話も扱いたかった
- せっかく独自ドメインを取得したのでコンテンツを生やしたくなったため
- htmlを書かずにmdで気軽に管理したかった
- 差分レビュー,管理がしやすい
- 依存が少ない（BaaSや外部 CMS 不要）
![管理画面](/images/blog/20251027/prev_edit.png)

## 実装のポイント

1. Markdown は `gray-matter` で Front Matter を解析
2. 本文は `react-markdown` + `remark-gfm` + `rehype-raw` でレンダリング
3. 画像は `public/images/blog` 配下に配置して最適化

### 使用ツール（Markdown/レンダリング）

- gray-matter: Front Matter（YAML）解析
- react-markdown: Markdown を React 要素へ変換
- rehype-slug: 見出し要素に id を自動付与
- rehype-autolink-headings: 見出しにアンカーリンクを自動付与
- Next.js Image: Markdown の画像を Next/Image にマッピングして最適化
- Chakra UI v3: 読みやすいタイポグラフィとレイアウトに適用

```ts
// 例: 投稿のメタデータ型
export type PostMeta = {
  slug: string
  title: string
  date: string
  description?: string
  tags?: string[]
  thumbnail?: string
}
```

今後はタグ絞り込みや関連投稿など，少しずつ拡張していきます．