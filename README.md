# yuzu621.tech - Portfolio & Blog

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![unified](https://img.shields.io/badge/unified-Qiita_compatible_Markdown-8B5CF6?style=for-the-badge&logo=markdown)](https://unifiedjs.com/)
[![three.js](https://img.shields.io/badge/three.js%20%2B%20VRM-VRM_Hero-000000?style=for-the-badge&logo=three.js)](https://github.com/pixiv/three-vrm)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?style=for-the-badge&logo=playwright)](https://playwright.dev/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions)](https://github.com/features/actions)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

Next.js App Router を採用した、プロフィール兼ブログサイトです。
[https://yuzu621.tech](https://yuzu621.tech)

2026年に大規模なリアーキテクチャを実施し、Chakra UI/Emotion を全廃して Tailwind v4 +
CSS変数トークンベースのデザインシステムへ移行、Markdown エンジンを Qiita 互換仕様へ刷新、
SEO(sitemap/robots/JSON-LD/OGP)を整備、プロフィールページに VRM ヒーローを追加しました。
設計の詳細な経緯は [`docs/rearchitecture.md`](./docs/rearchitecture.md)、デザイン規範は
[`DESIGN.md`](./DESIGN.md) を参照してください。

## スタック

| 分類 | 技術 |
|---|---|
| フレームワーク | Next.js 15 (App Router) / React 19 / TypeScript |
| スタイリング | Tailwind CSS v4(`@theme inline`) + CSS変数トークン(`data-world` 属性で tech/daily 世界を切替) |
| Markdown | [unified](https://unifiedjs.com/) パイプライン(独自 remark/rehype プラグインで Qiita 互換記法を実装) |
| フォント | `next/font/google`(Space Grotesk / Zen Maru Gothic / JetBrains Mono、全てセルフホスト) |
| 3D | three.js + [@pixiv/three-vrm](https://github.com/pixiv/three-vrm) + three-vrm-animation(プロフィールのVRMヒーロー) |
| データ管理 | Markdown(`_posts/` 記事 / `_products/` 制作物)+ `src/data/*.ts` によるデータドリブン設計 |
| テスト | Playwright(E2E) |
| CI/CD | GitHub Actions(Lint / Typecheck / Build / npm audit / E2E) + Vercel(自動デプロイ) |

Chakra UI・Emotion・next-themes は P3 で全面撤去済みで、依存には含まれません。

## プロジェクト構造

```
yuzu621.tech/
├── _posts/                        # Qiita互換Markdownのブログ記事(1ファイル1記事)
├── _products/                     # 制作物Markdown(1ファイル1プロダクト、ファイル名の数値プレフィックスが表示順)
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # ルートレイアウト(next/font, WebSite JSON-LD)
│   │   ├── globals.css            # Tailwind v4 @theme + tech/daily トークン + .markdown-body
│   │   ├── sitemap.ts             # 動的サイトマップ(全記事URLを含む)
│   │   ├── robots.ts
│   │   ├── not-found.tsx          # 404ページ
│   │   ├── opengraph-image.tsx    # サイト共通OG画像(next/ogによる生成)
│   │   ├── (blog)/
│   │   │   ├── layout.tsx         # ブログ用レイアウト(Header/Footer)
│   │   │   ├── page.tsx           # ブログ一覧 "/" (tech。ISR)
│   │   │   └── daily/page.tsx     # 日常の一覧(公開URLは "/?category=daily"。rewrite先、ISR)
│   │   ├── blog/
│   │   │   ├── layout.tsx         # 記事ページ用レイアウト
│   │   │   └── [slug]/
│   │   │       ├── page.tsx       # 記事本文(SSG, canonical + BlogPosting JSON-LD)
│   │   │       └── ShareRow.tsx   # 一覧に戻る / Twitter共有 / リンクコピー
│   │   └── profile/
│   │       └── page.tsx           # プロフィール "/profile" (Person JSON-LD)
│   ├── components/
│   │   ├── blog/                  # BlogIndex(一覧本体), BlogCard, BlogHeader(list/articleバリアント), CategoryTabs, Tag, TableOfContents(j/k操作), MobileToc, WorldSync
│   │   ├── profile/                # Hero, About, Products(Grid/Card/Overlay), TechStack(Body/Showcase), Header, MobileNav, FadeIn 等
│   │   ├── layouts/                # Footer
│   │   ├── vrm/                    # createVrmScene(three.js本体), VrmCanvas, VrmFallback, VrmHeroSlot(CSR分離), VrmTechStackCanvas, Hero↔Aboutアバター移動(AvatarTravelContext/FloatingAvatar/HeroAvatarDock/AboutAvatarDock), 読み込み制御(vrmAssets/fetchVrmAsset/runWhenIdleAfterLoad/useVrmShowcaseConditions)
│   │   ├── ThemeToggle.tsx         # tech/dailyテーマの手動切替ボタン(localStorageに保存)
│   │   └── ThemeSync.tsx           # プロフィールページのテーマ初期化・SPA遷移時の同期
│   ├── data/                      # aboutme.ts / skills.ts / external-articles.ts(データドリブン、文言はここを編集。制作物データは`_products/`へ移行済み)
│   ├── hooks/                     # useInView.ts(IntersectionObserverによる入場アニメーション用フック)
│   └── lib/
│       ├── markdown/
│       │   ├── index.ts               # unifiedパイプライン組み立て
│       │   ├── remark-code-filename.ts   # ```js:app.js → ファイル名ヘッダ
│       │   ├── remark-note.ts            # :::note info|warn|alert
│       │   ├── remark-link-card.ts       # 裸URL段落 → リンクカード
│       │   ├── rehype-extract-toc.ts     # 見出しからTOC(目次)データを抽出
│       │   └── ogp.ts                     # ビルド時OGP取得 + .cache/ogp.json
│       ├── posts.ts               # _posts 読み込み・フロントマター解析(gray-matter)
│       ├── products.ts            # _products 読み込み・Markdown本文のHTML化(gray-matter)
│       ├── theme.ts               # テーマ定数(tech/daily) + pre-paint初期化スクリプト生成
│       ├── external-articles.ts   # Qiita API取得 + OGPサムネイル
│       ├── external-image-hosts.ts # next/imageで最適化する外部サムネイルのホスト(next.config.tsと共有)
│       ├── format-date.ts         # 日付表示用フォーマッタ
│       └── seo.ts                 # SITE_URL 等の定数 + JSON-LDビルダー
├── public/
│   ├── models/                    # avatar.vrm を置く場所(README同梱、未配置ならフォールバック表示)
│   ├── images/                    # ブログ・プロダクト画像
│   └── mov/
├── scripts/
│   ├── optimize-images.mjs        # public/images の縮小・再圧縮(画像追加時に実行)
│   ├── check-image-size.mjs       # public/images の 1MB 超ファイル検出(CI)
│   ├── optimize-vrm.mjs           # VRM のテクスチャ縮小・重複排除(avatar.vrm の配置前に実行)
│   └── migrate-posts.mjs          # 旧remark-latex-breaks記法の一括移行に使った歴史的スクリプト(通常運用では実行不要)
├── tests/
│   └── e2e/                       # Playwright E2E
│       ├── home.spec.ts           # プロフィールの主要セクション表示
│       ├── blog.spec.ts           # ブログ一覧・記事詳細・カテゴリ切替・世界観(data-world)
│       ├── seo.spec.ts            # sitemap.xml / robots.txt / canonical / BlogPosting JSON-LD
│       ├── performance.spec.ts    # パフォーマンス改善(#37〜#40)の回帰チェック(構造のみ)
│       ├── navigation.spec.ts     # ヘッダー・アンカーリンク・モバイルドロワー
│       ├── product.spec.ts        # プロダクト詳細オーバーレイ
│       ├── vrm-loading.spec.ts    # VRM の遅延読み込み・データセーバー時の抑制
│       └── notfound.spec.ts       # 404ページ
├── docs/                          # 設計・計画ドキュメント(歴史的経緯を含めそのまま保存)
├── DESIGN.md                      # デザインシステム(カラートークン・タイポ・コンポーネント様式)
├── lighthouserc.json              # Lighthouse CI の計測対象と目安値(すべて warn)
└── .github/workflows/
    ├── ci.yml                     # CI(Lint / Typecheck / 画像サイズ / Build / npm audit / E2E)
    └── lighthouse.yml             # PR時のLighthouse計測(参考値、失敗扱いにしない)
```

## ルーティング

- `/` — ブログ一覧(`?category=tech|daily` でtech/daily世界を切替、デフォルトtech)
  - `/` と `/daily` の2ページを静的生成(ISR、1時間ごとに再生成)し、`/?category=daily` は `next.config.ts` の rewrite で `/daily` を返す。`?category=tech`・不正な値・指定なしは rewrite されず tech の一覧になる
  - `searchParams` を読むと動的レンダリングに戻るため、一覧ページでは読まない
  - `/daily` に直接アクセスしても表示できるが、canonical は `/` なので重複URLにはならない
- `/blog/[slug]` — 記事本文(SSG)
- `/profile` — プロフィール(既定はシステムの`prefers-color-scheme`。`localStorage`の明示保存があれば優先)
- `/blog`, `/portfolio` — 旧URL。それぞれ `/`, `/profile` へ301リダイレクト(`next.config.ts`)

## ブログ記事の書き方(Qiita互換Markdown)

`_posts/` に Markdown ファイルを1つ追加するだけで記事が公開されます。

```markdown
---
title: "記事タイトル"
date: "2026-01-01"
description: "記事の説明(省略時は本文から自動生成)"
tags: ["Next.js", "React"]
thumbnail: "/images/blog/xxxx/thumb.png"  # 省略時は本文中の最初の画像を自動採用
category: "tech"  # "tech" | "daily"。省略時は "tech"
---

ここから本文...
```

画像は `public/images/blog/<日付>/` に置き、**追加したら `npm run optimize:images` を実行してからコミットしてください**。長辺 2560px への縮小と再圧縮をファイル名を変えずに上書きで行います(`-- --dry-run` で書き換えずにサイズだけ確認、PNG を減色したくない場合は `-- --lossless`)。CI(`new-article` ブランチ含む)の `npm run check:images` は、`public/images` に 1MB を超えるファイルがあると失敗します。

記法は [Qiita](https://help.qiita.com/ja/articles/qiita-markdown/) 互換を意識しています。

- **改行**: 単一の改行がそのまま `<br>` になります(`remark-breaks`)。段落を分けたいときは空行を挟んでください。
- **GFM**: テーブル・取り消し線・タスクリスト・自動リンクに対応(`remark-gfm`)。
- **コードブロック**: ` ```js:app.js ` のように言語の後ろに `:ファイル名` を書くと、コードブロック上部にファイル名がヘッダ表示されます。シンタックスハイライトは shiki(`github-dark-default` / `github-light` のデュアルテーマ、tech/dailyに追従)。
- **noteブロック**: 補足・警告・注意を目立たせる装飾ブロックです。
  ```
  :::note info
  補足テキストです。内部もMarkdownとして解釈されます。
  :::
  ```
  `info`(省略時のデフォルト)/ `warn` / `alert` の3種類。
- **リンクカード**: 1行がURLだけの段落(裸URL)は、ビルド時にOGP(title/description/og:image/favicon)を取得してリンクカードに変換されます。取得に失敗した場合は通常の外部リンクにフォールバックし、ビルドは失敗しません(タイムアウト5秒、`.cache/ogp.json` に結果をキャッシュ)。
- **見出し**: 自動でスラグとアンカーリンクが付与されます。
- **画像**: `![alt](/images/blog/...)` のローカル画像は、ビルド時に寸法を読み取り、next/image と同じ最適化配信(srcset・WebP・遅延読み込み)に変換されます。最適化済み画像は31日間キャッシュされるため、**画像を差し替えるときはファイル名を変えてください**(同じ名前のままだと古い画像が表示され続けます)。
- **生HTML**: `<details>` 等の直書きも可能です。
- **数式には対応していません。**

## 目次とヘッダー

記事ページ(`/blog/[slug]`)はxl以上の画面で右サイドにvimライクな目次(TableOfContents)を表示します。
`k`/`j`キーで次/前の見出しへジャンプでき(先頭で`j`を押すとページトップへ)、スクロールに連動して
現在位置がハイライトされます。xl未満では目次はハンバーガーから開くモーダル(MobileToc)に切り替わり、
タップで該当見出しへ移動して閉じます。プロフィールページ(`/profile`)のモバイル(md未満)には同様の
構成のナビゲーションドロワー(MobileNav)があります。ヘッダーはページごとに構成が異なります
(ブログ一覧=タイトル+Profileリンク、記事=タイトルのみ、プロフィール=フルナビ)。詳細は
[`DESIGN.md`](./DESIGN.md) §5 を参照してください。

## VRMヒーロー

`public/models/avatar.vrm` にVRMモデルを配置すると、プロフィール(`/profile`)のヒーローセクションに
表示されます。ファイルが無い場合や読み込みに失敗した場合は、ミクティールのグラデーション球
(プレースホルダ)が静かに表示され、エラーにはなりません。詳細は `public/models/README.md` を参照してください。

three.js + `@pixiv/three-vrm` 一式は `next/dynamic`(`ssr: false`)でCSR分離されており、
ページ自体(`/profile`)はSSGのままです。`public/models/loop_verse.vrma` のVRMAアニメーションを
ループ再生し、マウス追従の視線制御を上乗せしています。VRMAが読めない場合はプロシージャル待機モーションに
フォールバックし、`prefers-reduced-motion` 環境や画面外スクロール時はループが止まります。

3D の初期化は、ファーストビューの描画と帯域・CPU を奪い合わないよう `load` イベントとブラウザの
アイドルを待ってから始めます(待っている間はプレースホルダを表示)。`avatar.vrm` は Hero/About と
Tech Stack で共有するため、取得は1回にまとめています。データセーバーが有効な場合や回線が
3G 以下(`navigator.connection` がある Chromium 系のみ判定)の場合は 3D を読み込まず、静的な表示に
なります。詳細は [`DESIGN.md`](./DESIGN.md) §7 を参照してください。

### Hero↔Aboutアバター移動

`prefers-reduced-motion` でなく低速回線でもない場合(モバイル含む)、HeroのVRMアバターと同一インスタンスが
スクロールに合わせてAboutセクションへ画面上を移動し(FLIP的な`transform`補間)、到達すると
`public/models/v-sign.vrma`(ピースサインの静止ポーズ)へワンショットで切り替わります。それ以外の
環境ではHero・Aboutそれぞれが従来通り静的なアバター/写真アイコンを描画します。詳細な設計は
[`DESIGN.md`](./DESIGN.md) §7.7 を参照してください。

### Tech Stackのアバターショーケース

画面幅1024px以上かつ`prefers-reduced-motion`でなく低速回線でもない場合、Tech Stackセクションは
「左にアバター・右に1カテゴリのカード」の構成になり、`public/models/tech-idle.vrma` を
常時ループしながら、スクロールでカテゴリの境目を跨いだ瞬間に `public/models/present-card.vrma`
(両手で下から掬い上げて掲げるジェスチャー)をワンショット再生してカードを切り替えます
(スクロール位置に直接同期するスクラブ方式ではありません)。それ以外の環境では従来の
全カテゴリ一覧グリッドにフォールバックします(全カテゴリの内容は常にDOM上に存在するため、
SEO/no-js環境への影響はありません)。アバターはセクションの1画面手前まで来てから読み込みます。詳細な数式・実装方針は [`DESIGN.md`](./DESIGN.md) §7.5 を参照してください。

## デザイン

見た目のルールは [`DESIGN.md`](./DESIGN.md) に集約しています。「二つの世界を持つ、ゆずのサイト」という
コンセプトのもと、`data-world="tech"`(深い夜空のダークトーン。プロフィール・技術ブログ)と
`data-world="daily"`(温かい紙のようなライトトーン。日常ブログ)をCSS変数トークンで切り替えています。
既定はページごとに決まります(プロフィール=システムの`prefers-color-scheme`、ブログ=記事/一覧の
カテゴリ)が、ヘッダーの`ThemeToggle`で手動切り替えでき、選択は`localStorage`に保存されて以降の
既定より優先されます。生HEXやアドホックな値は使わず、必ずセマンティックトークン(`bg-surface` /
`text-ink` 等)経由で参照します。

## データドリブン設計

`src/data/` 内のデータファイルを編集するだけで、フロントエンドに自動反映されます。

- `src/data/skills.ts` — カテゴリ別の技術スタック・保有資格
- `src/data/aboutme.ts` — 自己紹介文
- `src/data/external-articles.ts` — 外部プラットフォームに書いた記事(Zenn・会社Techブログ等)の手動リスト

プロダクトカード(制作物)は `_products/*.md`(1ファイル1プロダクト、フロントマターに
id/title/thumbnail/techStack/screenshots/description/urls)で管理します。読み込みは
`src/lib/products.ts` が行います。

## 外部記事の表示

ブログ一覧(techタブ)には、ローカル記事に加えて外部プラットフォームの記事が
出典バッジ付きで日付順に混ざって表示されます。

- **Qiita**: [公開API](https://qiita.com/api/v2/users/yuzukq/items)から自動取得
  (`src/lib/external-articles.ts`)。一覧ページはビルド時に静的生成され、ISRで1時間ごとに
  再生成されるため、投稿後はデプロイ不要で最長1時間程度で反映されます。
  取得に失敗した場合やタイムアウト(5秒)した場合は、ローカル記事だけで生成します
  (ネットワークが無い環境でもビルドは失敗しません)。
- **Zenn・会社Techブログ等**: `src/data/external-articles.ts` に1エントリ追加するだけ。
- サムネイルは未指定なら記事URLのog:imageを自動取得。外部記事はsitemapに含めません。
- サムネイルのホストが `src/lib/external-image-hosts.ts` の許可リストにあれば、`next/image` で
  縮小・WebP化して配信します(`next.config.ts` の `images.remotePatterns` も同じリストを参照)。
  リストに無いホストは原寸の `<img>` で表示されるので、新しい出典を足すときは実際の
  og:image のホストを確認してリストに追加してください(現在は Qiita の `qiita-user-contents.imgix.net` のみ)。

## 静的アセットのキャッシュ

`public/images/` と `public/models/` 配下は `next.config.ts` の `headers()` で
`Cache-Control: public, max-age=86400, stale-while-revalidate=604800` を付けて配信します
(再訪問のたびに23MBの `avatar.vrm` などを再検証しないため)。

ファイル名にハッシュが付いていないので、**画像やモデルを同じファイル名で差し替えると、
最大1日(stale-while-revalidate を含めると最大1週間)古いものが表示されます。
差し替えるときはファイル名を変えてください。**

## 開発

```bash
npm install
npm run dev          # 開発サーバー
npm run build        # 本番ビルド
npm run start        # 本番サーバー起動
npm run lint         # ESLint
npm run typecheck    # TypeScript 型チェック
npm run test:e2e     # Playwright E2E(内部でビルド+起動してから実行)
npm run test:e2e:ui  # Playwright UIモード
npm run optimize:images  # public/images の縮小・再圧縮
npm run check:images     # public/images の 1MB 超ファイル検出
npm run optimize:vrm -- <in.vrm> <out.vrm>  # VRM のテクスチャ縮小(public/models/README.md 参照)
```

`npm run test:e2e` の前に、自分で起動した `npm run start` 等の3000番ポートのサーバーは停止してください(`playwright.config.ts` の `reuseExistingServer` によりローカルでは既存サーバーが再利用され、古いビルドのままテストされてしまいます)。

## テスト(Playwright E2E)

`tests/e2e/` に一覧・記事・カテゴリ切替・ナビゲーション・プロダクト詳細・404・SEO(sitemap/robots/
canonical/JSON-LD)まで一通りのE2Eテストがあります。`playwright.config.ts` の `webServer` 設定により、
`npx playwright test` 実行時は本番ビルド(`next build && next start`)に対してテストします。

`performance.spec.ts` は、パフォーマンス改善が後の変更で元に戻っていないかを、HTML の構造で確かめます
(計測値は毎回ぶれるので使いません)。

| 確認内容 | 対応Issue |
|---|---|
| `/`・`/profile`・`/blog/devenv2026` のフォントの preload が3件以下 | #37 |
| 記事サムネイルが `fetchpriority="high"` で、`loading="lazy"` ではない | #38 |
| 全記事(`/sitemap.xml` から列挙)の本文画像が `loading="lazy"`。ローカル画像は `/_next/image` 経由で `width`/`height` 付き | #39 |
| JavaScript 無効でも `/profile` の h1 と `/` の先頭カードが見える(`opacity:0` でない) | #40 |

対応する Issue がまだマージされていないチェックは `test.fixme` でスキップしています。改善の PR をマージするときに、
その Issue の `test.fixme` を外してください。

## CI/CDパイプライン

`.github/workflows/ci.yml` により、プルリクエストおよび主要ブランチへのプッシュ時に自動実行されます。

1. **ESLint** — コード品質チェック
2. **TypeScript typecheck** — 型安全性確認
3. **Next.js Build** — ビルドエラー検出(SSGの破綻等)
4. **Markdownリンクチェック** — `new-article` ブランチへのpush時のみ(外部サイトのbot制限を避けるため)
5. **npm audit** — 依存関係の脆弱性スキャン(`continue-on-error`)
6. **Playwright E2E** — `new-article` ブランチは `blog.spec.ts` のみ、それ以外は全spec

すべてのチェックが通過した後、Vercelが自動デプロイを実行します。

PR では別ワークフローの `.github/workflows/lighthouse.yml` も実行されます。本番ビルドを `npm run start` で起動し、
`/`・`/profile`・`/blog/devenv2026` をLighthouse(モバイル設定)で各3回計測します。CI 環境の計測値はばらつくので
目安値(`lighthouserc.json`: Score 0.8以上、LCP 4秒以下、総転送量2.5MB以下)はすべて `warn` で、PR は失敗になりません。
結果はジョブの Summary にあるレポートのリンク(temporary-public-storage。数日で消える)か、
artifact の `lighthouse-reports` で確認できます。

## 開発フロー

- **ブランチ戦略**: `main`(本番)/ `develop`(開発統合)/ `feature/*`, `ci/*`(機能追加・CI改善用)
- **レビュープロセス**: AI支援レビューを活用
- **デプロイ**: Vercel統合による自動プレビュー & 本番デプロイ

## Author

**yuzukq**
- Portfolio: [https://yuzu621.tech](https://yuzu621.tech)
- GitHub: [@yuzukq](https://github.com/yuzukq)
