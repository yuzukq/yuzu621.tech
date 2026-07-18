# 再設計計画 (2026-07)

就活用ポートフォリオに後付けでブログを足した経緯で生じた歪みを解消し、
SEO・Markdown体験・デザインを全面刷新する。設計: Fable / 実装: Sonnet 5 サブエージェント。

## 決定事項

| 項目 | 決定 |
|---|---|
| スタイリング | Chakra UI v3 + Emotion を**全廃**し Tailwind v4 + CSS変数トークンへ移行 |
| テーマ | tech(ダーク)/daily(ライト)の世界観は維持。`data-world` 属性 + セマンティックトークンで実装 |
| Markdown | Qiita互換仕様へ刷新。`\\` 改行(remark-latex-breaks)は廃止し既存記事を一括移行 |
| 数式 | 対応しない |
| VRM | ポートフォリオのヒーローのみ。CSR分離(`next/dynamic` ssr:false)、ページはSSG維持 |
| VRMモデル | ユーザーが後日 `public/models/avatar.vrm` を配置。無い間はフォールバック表示 |
| Story | セクション・タイムライン・`stories.ts` を撤廃 |
| ルーティング | 現状維持: `/` ブログ一覧、`/blog/[slug]` 記事、`/portfolio` ポートフォリオ |

## 目標アーキテクチャ

```
src/
  app/
    layout.tsx              # next/font + メタデータ基盤(Chakra Provider撤廃)
    sitemap.ts  robots.ts
    (blog)/page.tsx         # 一覧(tech/daily切替)
    blog/[slug]/page.tsx    # 記事(SSG, JSON-LD)
    portfolio/page.tsx      # RSC化(クライアントは島に限定)
  components/
    ui/        # 汎用(Tag, SectionHeading, Card系)
    blog/      # BlogCard, CategoryTabs, BlogHeader, ShareRow
    portfolio/ # Hero, About, Products, Skills, Header, Footer
    vrm/       # VrmHero(CSR island)
  lib/
    markdown/
      index.ts              # unifiedパイプライン組立
      remark-code-filename.ts  # ```js:app.js → title付与
      remark-note.ts           # :::note info|warn|alert
      remark-link-card.ts      # 裸URL段落 → リンクカード
      ogp.ts                   # ビルド時OGP取得 + .cache/ogp.json
    posts.ts   seo.ts
  data/        # aboutme, products, skills (stories.ts削除)
  styles/globals.css        # @theme + 世界トークン + .markdown-body
```

## Markdown仕様 (Qiita互換)

1. **改行**: 単一改行 = `<br>` (`remark-breaks`)。既存の `\\` 記法は移行スクリプトで除去。
2. **GFM**: テーブル・打消し・タスクリスト・自動リンク (`remark-gfm`、継続)。
3. **コードブロック**: ` ```js:app.js ` でファイル名ヘッダ表示。ハイライトは rehype-pretty-code + shiki、
   `github-dark-default` / `github-light` のデュアルテーマをCSS変数で世界に追従。
4. **noteブロック**:
   ```
   :::note info
   補足テキスト
   :::
   ```
   `info`(省略時デフォルト) / `warn` / `alert` → `<div class="note note-info">` 等。内部はMarkdown解釈。
5. **リンクカード**: 段落が裸URL1つだけの場合、ビルド時にOGP(title/description/og:image/favicon)を取得し
   カードHTMLに変換。取得結果は `.cache/ogp.json`(gitignore)にキャッシュ。失敗時はプレーンな外部リンクに
   フォールバックしビルドは落とさない。タイムアウト5s。
6. **生HTML**: `<details>` 等は引き続き許可(自分だけが書くサイトのため)。
7. 見出しslug + アンカーリンク(rehype-slug / autolink)は継続。

### 記事移行スクリプト (`scripts/migrate-posts.ts`)
- コードフェンス外のみ対象: 行末の `\\`(1個以上の連続バックスラッシュ)を除去、`\\` のみの行を削除。
- 実行後に全記事をパースし、警告ゼロを確認してからコミット。

## SEO仕様

- `metadataBase: new URL('https://yuzu621.tech')`、全ページ canonical。
- `app/sitemap.ts`: `/`, `/portfolio`, 全記事(`lastModified` = frontmatter date)。
- `app/robots.ts`: 全許可 + sitemap URL。
- 記事: `generateMetadata`(既存拡張) + `BlogPosting` JSON-LD(headline, datePublished, image, author)。
- ポートフォリオ: `Person` JSON-LD。ルート: `WebSite` JSON-LD。
- OGP: 記事はthumbnail、無ければサイト共通OG画像。Twitter card対応。

## フェーズ分割(実装順)

各フェーズ終了時に `npm run lint && npm run typecheck && npm run build` が通ること。
UIを触るフェーズは対応する Playwright E2E も更新して通すこと。

- **P1 Markdownエンジン刷新**: lib/markdown 新設、プラグイン実装、remark-latex-breaks削除、
  記事移行スクリプト作成・実行。表示は現行ページのまま(スタイルは最低限)。
- **P2 デザイン基盤 + ブログUI再構築**: Tailwind v4トークン(DESIGN.md §2-4)、next/font、
  ブログ一覧・記事・ヘッダー・フッターをTailwindで再実装(ブログ系からChakra全排除)。
- **P3 ポートフォリオ再構築 + Chakra全廃**: セクション群をDESIGN.mdに従い再実装、Story撤廃、
  RSC化(クライアント島最小化)、Chakra/Emotion/next-themes/@chakra-ui/charts をpackage.jsonから削除。
- **P4 SEO**: sitemap/robots/メタデータ/JSON-LD/OG。
- **P5 VRMヒーロー**: three + @pixiv/three-vrm、フォールバック付きCSR island。
- **P6 QA仕上げ**: E2E全体整合、README刷新、依存整理・デッドコード掃除。

## 実装エージェントへの共通ルール

- `DESIGN.md` と本ファイルを最初に読むこと。トークン外の色・サイズを発明しない。
- 依存追加は各フェーズ指示に列挙されたものだけ。
- コミットはフェーズ単位でレビュー担当(Fable)が行う。エージェントはコミットしない。
- 既存の `src/data/*.ts` の**内容**(文言)は変更しない(構造変更が必要な場合は型のみ)。
- 記事(`_posts/`)の文章内容を変えない。移行スクリプトによる機械的変換のみ可。
