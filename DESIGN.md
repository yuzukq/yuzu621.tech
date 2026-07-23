# DESIGN.md — yuzu621.tech デザインシステム

サイト全体のデザイン規範。実装時は必ずこのファイルのトークン・パターンに従うこと。
ここにない色・サイズ・影をアドホックに追加しない(必要なら本ファイルを先に更新する)。

## 1. コンセプト

**「二つの世界を持つ、ゆずのサイト」**

- **TECH世界** (`data-world="tech"`): 深い夜のダークトーン + ミクティール(#39C5BB)の発光。プロフィールと技術ブログはこちら。
- **DAILY世界** (`data-world="daily"`): ミントがかった淡いライトトーン。日常ブログはこちら。
- カラーパレットは**初音ミク**由来: シグネチャーのティール(#39C5BB)を主役に、マゼンタ(#E12885)を差し色として少量だけ使う。
- 参考サイト(hoshimachi-suisei.jp)の要素を取り込む: 大判タイポグラフィ、英大文字のセクションラベル、余白を贅沢に使ったカードグリッド、上品なホバーモーション。

世界の切替はユーザートグルではなく**コンテンツ起点**(ブログカテゴリ / ページ)で行う。
`<html>` または世界のルート要素に `data-world` 属性を付け、配下はセマンティックトークンだけで描画する。

## 2. カラートークン

CSS変数で定義し、Tailwind v4 の `@theme inline` で `--color-*` にマップする。
コンポーネントからは **必ずセマンティック名**(`bg-surface`, `text-ink` 等)で参照し、生HEXを書かない。

```css
/* globals.css */
[data-world="tech"] {
  --bg: #0C1214;            /* ベース背景(ティールがかった近黒) */
  --surface: #121A1D;       /* カード・浮遷面 */
  --surface-hover: #182428;
  --ink: #E4ECEB;           /* 本文 */
  --ink-muted: #96A8A7;     /* 補助テキスト */
  --ink-faint: #5D6D6D;     /* さらに弱い(日付等) */
  --accent: #39C5BB;        /* ミクティール(主役) */
  --accent-hover: #5BD5CC;
  --accent-2: #E12885;      /* ミクマゼンタ(差し色。多用しない) */
  --border: rgba(228, 236, 235, 0.08);
  --border-strong: rgba(228, 236, 235, 0.16);
  --glow: 0 0 24px rgba(57, 197, 187, 0.18);  /* ティールの発光 */
}
[data-world="daily"] {
  --bg: #F4F9F8;            /* ミントがかった淡いグレー */
  --surface: #FFFFFF;
  --surface-hover: #EAF4F3;
  --ink: #253335;
  --ink-muted: #5C6E6D;
  --ink-faint: #8FA1A0;
  --accent: #0F8F86;        /* ティール(ライト背景でAAを満たす濃度) */
  --accent-hover: #0B6F68;
  --accent-2: #C21E6F;      /* マゼンタ(ライト用濃度) */
  --border: rgba(37, 51, 53, 0.10);
  --border-strong: rgba(37, 51, 53, 0.20);
  --glow: none;
}
```

- コントラストは WCAG AA (本文 4.5:1) を満たすこと。#39C5BB はダーク背景でのみ本文級に使える。ライト背景では `#0F8F86` 系を使う。
- マゼンタ(`--accent-2`)は「差し色」。リンクや見出しの主役はティールに統一し、マゼンタはホバー・小さな装飾・強調点に限定する。
- 世界の遷移(カテゴリ切替)は `transition: background-color .4s ease, color .4s ease` 程度で滑らかに。

## 3. タイポグラフィ

`next/font/google` で読み込み、CSS変数に割り当てる。

| 役割 | フォント | 変数 |
|---|---|---|
| 欧文ディスプレイ(見出し・ラベル) | Space Grotesk | `--font-display` |
| 和文本文・見出し | Zen Maru Gothic (400/500/700/900) — 丸ゴシック。かわいさと可読性の両立 | `--font-body` |
| コード | JetBrains Mono | `--font-mono` |

**ベースサイズ**: `html { font-size: 112.5% }`(= 18px)。サイト全体の文字を一段大きく
読みやすくするための基準で、rem由来のサイズは全てこれに追従する。
**例外はMarkdown見出し(.markdown-body h1〜h4)**のみ: 元々十分大きいため、
rem値に 16/18 を掛けた補正値で従来の実寸(h1: 28〜40px / h2: 24px / h3: 20px / h4: 18px)を維持する。

スケール(rem表記はルート18px基準):

- **Display** (ヒーローの名前等): `clamp(2.75rem, 7vw, 5rem)` / weight 700 / letter-spacing -0.02em
- **Section label** (参考サイトの "TOPICS" 相当): `0.75rem` / uppercase / tracking `0.25em` / `--accent` 色。英語ラベル(`PRODUCTS`, `TECH STACK`, `ABOUT`, `BLOG`)+ 和文タイトルの2段構成。
- **h1** 記事タイトル: `clamp(1.75rem, 4vw, 2.5rem)` / 800
- **h2**: 1.5rem / 700、**h3**: 1.25rem / 700(ページ見出し用。Markdown内見出しは上記の補正値)
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

外部記事(Qiita/Zenn等)のカードは同じ様式のまま: カテゴリ表示の代わりに
**出典バッジ**(ブランドカラーのドット + 出典名、Qiita=`--brand-qiita` / Zenn=`--brand-zenn` /
その他=`--accent-2`)、タイトル末尾に `↗`、リンクは新規タブ。ブランドカラーは
世界に依存しない `:root` トークンとして globals.css に定義する。

### プロダクトカード
大きめビジュアル + 概要 + 技術スタックタグ + リンク。奇数偶数で画像左右を入れ替えるエディトリアル風でもよい。

### タグ
`rounded-lg` / `--surface` 上に `--border` / テキスト `--ink-muted`、`#` 接頭辞。ホバーで `--accent` 文字色。

### 目次(TableOfContents)
記事ページ右サイドに置くvimライクな目次(参考: blakecrosley.comのターミナル風サイドバー)。
- レイアウト: xl以上のみ表示。記事コンテナを `max-w-6xl` に広げ、`grid-cols-[minmax(0,1fr)_17rem]` で
  本文(max-w-3xl)をやや左へ、右カラムに `sticky top-24` で追従させる。xl未満は従来の中央1カラム。
- 外観: カード様式(§5共通)。ヘッダーは mono で `$ index`(`$` は `--accent`)、フッターに
  `j` `k` のキーバッジ(`--surface-hover` 地 + `--border` 枠)。
- 項目: 最浅見出しレベルを親として2階層に正規化。親には mono の連番 `01`〜、子はインデントのみ。
  アクティブ項目は左2pxの `--accent` バー + `--accent` 10%背景 + `--accent` 文字。それ以外は
  `--ink-muted`、ホバーで `--surface-hover`。
- 挙動: スクロール連動ハイライト、`j`/`k` で次/前の見出しへジャンプ(入力欄フォーカス中・修飾キー
  押下時は無効)。クリックは素のアンカー遷移。reduced-motion では即時ジャンプ。

### Markdown本文 (`.markdown-body`)
- 見出し・段落は §3 のスケールに従う。h2 は下辺に `--border` の細線。
- インラインコード: `--surface` 背景 + `--accent` 系文字。
- 引用: 左 3px `--accent-2` ボーダー + `--ink-muted`。
- **noteブロック** (`:::note info|warn|alert`): `rounded-xl` + 薄い背景 + 左アイコン。
  info=`--accent-2`系 / warn=amber系 / alert=red系。各色は透明度10%の背景 + 本体色ボーダー。
- **リンクカード**: 横並び(左: テキスト3段 = title/description/favicon+ドメイン、右: og:image `aspect-[1.91/1]` 高さ約100px)。`--border` 枠 + ホバーで `--border-strong`。装飾下線なし。
- コードブロック: shiki の `github-dark-default`(tech) / `github-light`(daily) をCSS変数切替。ファイル名ヘッダは上辺タブ風(mono・`--ink-muted`・`--surface` より一段濃い背景)。

## 6. モーション

- 入場: IntersectionObserver で `opacity 0→1` の純フェード、`0.8s ease-out`。連続要素は 100ms ずつ stagger。位置は動かさない(transform併用時にチラつきの原因になったため)。fill-mode は必ず `both`: `forwards` だと stagger の待機中に素の状態が見えて二重発火に見える。
- `prefers-reduced-motion: reduce` では全アニメーション無効化。
- ページ遷移やホバーで過剰な動きをつけない。「上品に、少しだけ」。

## 7. VRMヒーロー(プロフィール)

- 配置: トップのヒーローセクション右側(モバイルでは名前の背後に薄く/または下)。
- 実装: `three` + `@pixiv/three-vrm`。`next/dynamic` + `ssr: false` でCSR分離。ページ自体はSSGを維持。
- モデル: `public/models/avatar.vrm` を読む。**ファイルが無い場合は静かにフォールバック**(ミクティールのグラデーション球など軽量なプレースホルダ)し、エラーを出さない。
- 挙動: VRMAループアニメーション(`public/models/happy-sway.vrma`、ニコニコ左右揺れ)を再生し、
  マウスへの視線・頭追従を上乗せする。VRMAが読めない場合はプロシージャル待機
  (呼吸・揺れ・まばたき)にフォールバック。いずれも派手に動かさない。
- 品質: `<canvas>` は `aria-hidden`。SEOテキストは通常DOMに置く。低スペック・reduced-motion時は静止。

## 7.5 スクロール連動アバターショーケース(Tech Stack)

lg以上(1024px)・`prefers-reduced-motion`でない場合のみ、TechStackセクションが「左にアバター・
右に1カテゴリのカード」の構成になり、スクロールでカードとアバターの演技が連動する
(`TechStackShowcase.tsx` / `VrmScrubCanvas.tsx`)。それ以外(狭い画面・reduced-motion・SSR/初回CSR)
は従来の全カテゴリ一覧グリッド(`TechStackBody.tsx`のフォールバック分岐)を表示する。
判定はマウント後の`matchMedia`で行い、フォールバックを初期値にすることでhydrationミスマッチと
no-js/クローラー向けの全文露出を両立する。全カテゴリのカードは常にDOMに存在し、opacity/translateY
のみで表示を切り替える(内容の出し分けはしない)。

見出し(`SectionHeading`)とリード文は`TechStack.tsx`ではなく、フォールバック分岐(`TechStackBody.tsx`)
とショーケース分岐(`TechStackShowcase.tsx`)それぞれの内側で描画する。ショーケース側は
`position: sticky`の内側コンテナの中で見出しブロックを`shrink-0`、アバター/カード列を`flex-1`とする
縦積みflexにし、見出しが常に画面内に留まったままカードとアバターだけがpin区間中動く構成にしている
(見出しが通常フローに残り sticky の外側にあると、pinが始まった時点でスクロールと共に見出しが
画面外へ流れてしまうため)。見出しブロックの`pt-20`は他セクションの`scroll-mt-20`と同じ量で、
sticky headerの下に自然に着地させるためのもの。リード文の下には現在のカテゴリ位置を示す
`01 / 04`形式の進捗インジケータ(既存の`font-mono text-xs uppercase tracking-[0.2em] text-ink-faint`
のvoiceを踏襲)を置き、新規のscrollリスナーは追加せず既存の`update()`(rAFループ)内で
`currentIndex`から直接更新する。

- **スクロール数式**: 外側wrapperの高さ = `カテゴリ数 × 50vh + 100dvh`。`position: sticky; top: 0`
  の内側コンテナがピン留めされる区間(=`wrapper高さ - viewport高さ` = カテゴリ数×50vh)を
  `globalProgress`(0〜1)としてカテゴリ数に按分し、各カテゴリ区間の後半35%(`TRANSITION_BAND`)を
  次カードへの遷移(アバターの演技)に、前半65%を静止した読了時間に割り当てる。
- **アバターの演技**: `present-card.vrma`(両手で下から掬い上げて掲げる、非ループ、t=0とt=durationが
  同一の「休め」姿勢になるよう設計)を、`THREE.AnimationMixer`で自動再生させず
  `action.time = progress * duration; mixer.update(0)` によって毎フレーム直接スクラブする
  (`createVrmScene.ts`の`motion.mode === 'scrub'`)。カテゴリの境目でprogressが1→0に飛んでも、
  両端が同じ姿勢なので見た目はスナップしない。
- **VRMAの符号に注意**: このアバターでは、three-vrm-animationのretargeting適用後、
  upperArm/lowerArmのZ、chest/spine/headのXの符号が、生成時にauthorした値から反転して現れる
  (Yはそのまま)。大きな振れ幅のモーションを作る際は必ず実機で描画確認し、意図と逆に動く場合は
  該当軸の符号を反転して再生成する(詳細は `~/.claude/skills/vrma-create/reference.md`)。
- カメラフレーミングはHeroのバストアップより下方向に広げる(`cameraFraming.hipsBottomMargin`)。

## 8. 禁止事項

- 生HEX・任意値のアドホック指定(トークンを経由する)
- 世界(tech/daily)ごとの三項演算子での色分岐(`data-world` + CSS変数で解決する)
- ブログ本文ページへのクライアントJS追加(共有ボタン等の既存最小限を除く)
- CDN読み込み(フォント含めすべてセルフホスト/next/font)
