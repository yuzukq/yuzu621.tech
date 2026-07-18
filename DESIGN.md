# DESIGN.md — yuzu621.tech デザインシステム

サイト全体のデザイン規範。実装時は必ずこのファイルのトークン・パターンに従うこと。
ここにない色・サイズ・影をアドホックに追加しない(必要なら本ファイルを先に更新する)。

## 1. コンセプト

**「二つの世界を持つ、ゆずのサイト」**

- **TECH世界** (`data-world="tech"`): 深い夜空のダークトーン。星・宇宙的な奥行き + アクセントに柚子イエロー。ポートフォリオと技術ブログはこちら。
- **DAILY世界** (`data-world="daily"`): 温かい紙のようなライトトーン。日常ブログはこちら。
- 参考サイト(hoshimachi-suisei.jp)の要素を取り込む: 大判タイポグラフィ、英大文字のセクションラベル、余白を贅沢に使ったカードグリッド、上品なホバーモーション。

世界の切替はユーザートグルではなく**コンテンツ起点**(ブログカテゴリ / ページ)で行う。
`<html>` または世界のルート要素に `data-world` 属性を付け、配下はセマンティックトークンだけで描画する。

## 2. カラートークン

CSS変数で定義し、Tailwind v4 の `@theme inline` で `--color-*` にマップする。
コンポーネントからは **必ずセマンティック名**(`bg-surface`, `text-ink` 等)で参照し、生HEXを書かない。

```css
/* globals.css */
[data-world="tech"] {
  --bg: #0B0E14;            /* ベース背景(近黒ネイビー) */
  --surface: #131826;       /* カード・浮遷面 */
  --surface-hover: #1A2132;
  --ink: #E6E9F0;           /* 本文 */
  --ink-muted: #9AA3B2;     /* 補助テキスト */
  --ink-faint: #5C6572;     /* さらに弱い(日付等) */
  --accent: #FFC838;        /* 柚子イエロー(主役) */
  --accent-hover: #FFD75E;
  --accent-2: #7C86FF;      /* ペリウィンクル(宇宙の差し色) */
  --border: rgba(230, 233, 240, 0.08);
  --border-strong: rgba(230, 233, 240, 0.16);
  --glow: 0 0 24px rgba(255, 200, 56, 0.15);  /* アクセントの発光 */
}
[data-world="daily"] {
  --bg: #FAF6EF;            /* 温かい紙色 */
  --surface: #FFFFFF;
  --surface-hover: #FFF9EE;
  --ink: #2A2722;
  --ink-muted: #6B675F;
  --ink-faint: #9C968A;
  --accent: #D97706;        /* 柚子オレンジ(ライトで読める濃度) */
  --accent-hover: #B45F04;
  --accent-2: #7BA05B;      /* 葉っぱのグリーン */
  --border: rgba(42, 39, 34, 0.10);
  --border-strong: rgba(42, 39, 34, 0.20);
  --glow: none;
}
```

- コントラストは WCAG AA (本文 4.5:1) を満たすこと。柚子イエローはダーク背景でのみ本文級に使える。ライト背景では `#D97706` 系を使う。
- 世界の遷移(カテゴリ切替)は `transition: background-color .4s ease, color .4s ease` 程度で滑らかに。

## 3. タイポグラフィ

`next/font/google` で読み込み、CSS変数に割り当てる。

| 役割 | フォント | 変数 |
|---|---|---|
| 欧文ディスプレイ(見出し・ラベル) | Space Grotesk | `--font-display` |
| 和文本文・見出し | Zen Kaku Gothic New (400/500/700/900) | `--font-body` |
| コード | JetBrains Mono | `--font-mono` |

スケール:

- **Display** (ヒーローの名前等): `clamp(2.75rem, 7vw, 5rem)` / weight 700 / letter-spacing -0.02em
- **Section label** (参考サイトの "TOPICS" 相当): `0.75rem` / uppercase / tracking `0.25em` / `--accent` 色。英語ラベル(`PRODUCTS`, `SKILLS`, `ABOUT`, `BLOG`)+ 和文タイトルの2段構成。
- **h1** 記事タイトル: `clamp(1.75rem, 4vw, 2.5rem)` / 800
- **h2**: 1.5rem / 700、**h3**: 1.25rem / 700
- 本文: 1rem / line-height 1.9(和文なので広め)。ブログ本文は `max-width: 42rem` 前後。

## 4. レイアウト・余白

- コンテナ: `max-w-6xl mx-auto px-4 md:px-8`。記事本文のみ `max-w-3xl`。
- セクション縦余白: `py-20 md:py-28`。詰めない。余白は世界観の一部。
- グリッド: ブログカード `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8`。プロダクトは1〜2カラムの大きめカード。
- 角丸: カード `rounded-2xl`、小要素(タグ・ボタン) `rounded-lg`、リンクカード `rounded-xl`。
- ヘッダー: sticky + 背景ぼかし(`backdrop-blur` + 半透明 `--bg`)。下辺 `--border` の1pxライン。

## 5. コンポーネント様式

### カード(共通)
- `bg-[--surface]` + `border: 1px solid var(--border)`。
- ホバー: `translateY(-2px)` + `border-color: var(--border-strong)` + (tech世界のみ) `box-shadow: var(--glow)`。`transition .25s ease`。
- 画像はカード上部に `aspect-video` で統一、`object-cover`。

### ブログカード
サムネイル / カテゴリ+日付(`--ink-faint`・mono小) / タイトル(2行clamp) / 概要(2行clamp・`--ink-muted`) / タグ。

### プロダクトカード
大きめビジュアル + 概要 + 技術スタックタグ + リンク。奇数偶数で画像左右を入れ替えるエディトリアル風でもよい。

### タグ
`rounded-lg` / `--surface` 上に `--border` / テキスト `--ink-muted`、`#` 接頭辞。ホバーで `--accent` 文字色。

### Markdown本文 (`.markdown-body`)
- 見出し・段落は §3 のスケールに従う。h2 は下辺に `--border` の細線。
- インラインコード: `--surface` 背景 + `--accent` 系文字。
- 引用: 左 3px `--accent-2` ボーダー + `--ink-muted`。
- **noteブロック** (`:::note info|warn|alert`): `rounded-xl` + 薄い背景 + 左アイコン。
  info=`--accent-2`系 / warn=amber系 / alert=red系。各色は透明度10%の背景 + 本体色ボーダー。
- **リンクカード**: 横並び(左: テキスト3段 = title/description/favicon+ドメイン、右: og:image `aspect-[1.91/1]` 高さ約100px)。`--border` 枠 + ホバーで `--border-strong`。装飾下線なし。
- コードブロック: shiki の `github-dark-default`(tech) / `github-light`(daily) をCSS変数切替。ファイル名ヘッダは上辺タブ風(mono・`--ink-muted`・`--surface` より一段濃い背景)。

## 6. モーション

- 入場: IntersectionObserver で `opacity 0→1` + `translateY(12px→0)`、`0.5s ease-out`。連続要素は 60ms ずつ stagger。
- `prefers-reduced-motion: reduce` では全アニメーション無効化。
- ページ遷移やホバーで過剰な動きをつけない。「上品に、少しだけ」。

## 7. VRMヒーロー(ポートフォリオ)

- 配置: トップのヒーローセクション右側(モバイルでは名前の背後に薄く/または下)。
- 実装: `three` + `@pixiv/three-vrm`。`next/dynamic` + `ssr: false` でCSR分離。ページ自体はSSGを維持。
- モデル: `public/models/avatar.vrm` を読む。**ファイルが無い場合は静かにフォールバック**(柚子イエローのグラデーション球など軽量なプレースホルダ)し、エラーを出さない。
- 挙動: 待機モーション(呼吸・揺れ) + スクロール/マウスに軽く反応(視線追従程度)。派手に動かさない。
- 品質: `<canvas>` は `aria-hidden`。SEOテキストは通常DOMに置く。低スペック・reduced-motion時は静止。

## 8. 禁止事項

- 生HEX・任意値のアドホック指定(トークンを経由する)
- 世界(tech/daily)ごとの三項演算子での色分岐(`data-world` + CSS変数で解決する)
- ブログ本文ページへのクライアントJS追加(共有ボタン等の既存最小限を除く)
- CDN読み込み(フォント含めすべてセルフホスト/next/font)
