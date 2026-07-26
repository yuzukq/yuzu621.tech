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

**モバイル(767px以下)は`font-size: 106%`(≒17px)に一段下げる**(`@media (max-width: 767px)`で
ルートの`html { font-size }`を上書き)。一度に読める情報量を優先し、PC比で数%だけ縮小する。
rem基準の全サイズが単一のこのルールに追従するため、コンポーネント個別のブレークポイント指定は
不要。`clamp()`でvw成分を持つ見出し(Hero名前・ブログh1)はrem下限側のみこの縮小に追従する。

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
大きめビジュアル + タイトル + 一文説明(`description`・`line-clamp-2`、ブログカードの概要と同じ
voice) + 技術スタックタグ + リンク。奇数偶数で画像左右を入れ替えるエディトリアル風でもよい。

データは`_products/*.md`(ブログの`_posts/*.md`と同じ構成、`src/lib/products.ts`が
`gray-matter`+`renderMarkdown()`で読む)。フロントマターは共有フォーマット
(`id`/`title`/`thumbnail`/`techStack`/`screenshots`/`description`(一文)/`urls`)のみとし、
旧`description`(長文)・`features`・`challenges`は撤廃、Markdown本文に自由記述として統合した
(見出しの立て方はプロダクトごとに任意。既存7件は`## 主な機能` / `## 工夫点・課題`の2見出しに
揃えている)。本文は`ProductDetailOverlay.tsx`が`.markdown-body`としてレンダリングする。
表示順はファイル名の数値プレフィックス(`01-`〜)で制御する。

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
- 挙動: スクロール連動ハイライト、`k`/`j` で次/前の見出しへジャンプ(入力欄フォーカス中・修飾キー
  押下時は無効)。クリックは素のアンカー遷移。reduced-motion では即時ジャンプ。フッターの
  ヒントは`↕ navigation`(英語表記で統一。ヘッダーの`$ index`・`sections`と揃えた)。

**xl未満はモバイル目次モーダル(`MobileToc.tsx`)に切り替わる**: 記事ヘッダー右上の
ハンバーガー(`FiMenu`)から開く、MobileNav.tsx(プロフィールページ)と同じポータル+開閉モーダル。
見出し一覧は`normalizeToc()`(このファイルからexport)を共有し、連番+インデントの見た目も
デスクトップ版と統一。スクロールスパイのハイライトは持たない(タップで該当見出しへ飛んで
即閉じるだけの単純な用途のため)。`<header>`の`backdrop-blur-md`が`position: fixed`の
包含ブロックを作る問題は同じなので、`createPortal(..., document.body)`も同様に必須。

### ブログヘッダー(BlogHeader) — list / article バリアント
一覧ページと記事ページで表示するナビゲーションが異なるため、`variant`propで分岐する。
- **list**(デフォルト、`(blog)/layout.tsx`が使用): タイトル「Yuzuのブログ」(`/`へのリンク) +
  右上「Profile」リンクのみ。「Blog」リンクは自分自身への遷移で無意味なため削除した。
- **article**(`blog/[slug]/page.tsx`が`toc`付きで直接描画): タイトルリンクのみ、ナビリンクは
  PC・モバイルとも一切出さない(記事内では不要と判断)。代わりに`toc`があれば右上に
  `MobileToc`のトリガーボタンを出す(xl以上ではデスクトップ目次が既にあるため`xl:hidden`)。

**Headerの描画位置に注意**: 記事ページのHeaderは`blog/layout.tsx`ではなく`[slug]/page.tsx`が
自前で描画する。目次データ(`toc`)はpage側の`renderPost()`でしか手に入らず、Next.jsのlayoutは
子pageが計算したpropsを受け取れない(逆方向の受け渡しができない)ため。`blog/layout.tsx`は
Footerのみのパススルーになっている。一覧ページ側(`(blog)/layout.tsx`)は従来通りlayoutが
Headerを描画する(こちらはpage側の動的データに依存しないため問題ない)。

### モバイルナビゲーション(MobileNav)
プロフィールページのモバイル(`md:hidden`)で右上のハンバーガーから開く、右からスライドインする
ドロワー。目次(TableOfContents)と同じターミナル様式に揃えている: ヘッダーは mono で
`$ index`(`$`は`--accent`)+ 閉じるボタン、各項目は mono の連番`01`〜+ラベル、フッターに
`esc` キーバッジ + `close`。パネルは`--surface`地の完全不透明(半透明だと背後のコンテンツと
文字が被って読めなくなるため)、背景(バックドロップ)はクリックで閉じる`bg-black/70`。
Escapeキーでも閉じる(`ProductDetailOverlay.tsx`と挙動を統一)。

同じ意匠のモバイル記事目次(`blog/MobileToc.tsx`)とは、トリガー・ポータル・バックドロップ・
ヘッダー・フッター・Escapeハンドラを`TerminalDrawer.tsx`として共通化している。両者の差は
リスト部(`NextLink`+連番 vs アンカー+連番/インデント)、アクセシブルネーム、ブレークポイント
(`md:hidden` vs `xl:hidden`)のみ。

**`document.body`へのポータル必須**: `<header>`に`backdrop-blur-md`(backdrop-filter)が
かかっており、これは`position: fixed`子要素の包含ブロックを作ってしまう。ドロワーを
`<header>`の子としてそのまま`fixed inset-0`しても、画面全体ではなく`<header>`自身の
高さ(数十px)に押し込められて表示が壊れる(=旧UIで「背景が透けて文字と被る」と
報告されていた不具合の実体もこれだった可能性が高い)。`createPortal`で`document.body`
直下に描画することでこの包含ブロック問題を回避している。

開閉アニメーションは開く時のみ(`--animate-drawer-in`: 右からslide-in 0.25s /
`--animate-backdrop-in`: fade-in 0.2s)。閉じる時は演出をつけずコンポーネント自体が
即座にunmountする: 閉じるボタンにe2eの可視性アサーションが直後に続くため、閉じるアニメーション
を残すとPlaywrightの可視性チェックとレースする(Hero↔Aboutの導線で一度踏んだのと同じ教訓)。

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
- 挙動: VRMAループアニメーション(`public/models/loop_verse.vrma`)を再生し、
  マウスへの視線・頭追従を上乗せする。VRMAが読めない場合はプロシージャル待機
  (呼吸・揺れ・まばたき)にフォールバック。いずれも派手に動かさない。
- 品質: `<canvas>` は `aria-hidden`。SEOテキストは通常DOMに置く。低スペック・reduced-motion時は静止。

## 7.5 スクロール連動アバターショーケース(Tech Stack)

lg以上(1024px)・`prefers-reduced-motion`でない場合のみ、TechStackセクションが「左にアバター・
右に1カテゴリのカード」の構成になり、スクロールでカードとアバターの演技が連動する
(`TechStackShowcase.tsx` / `VrmTechStackCanvas.tsx`)。それ以外(狭い画面・reduced-motion・SSR/初回CSR)
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
  `globalProgress`(0〜1)としてカテゴリ数に按分し、`categoryFloat = globalProgress × カテゴリ数`の
  整数部をカテゴリのインデックスとする。
- **カード切り替えとアバターの演技はスクラブではなくワンショットトリガー方式**(旧: スクロール位置に
  `scrubAction.time`を直接同期させる`scrub`モードだったが、スクロール速度に演技の見え方が
  引きずられ「アニメーションがキレイに再生できない」問題があったため、カテゴリの境目を
  跨いだ瞬間に演技を1回再生する方式に変更した)。`categoryFloat`の整数部(`displayedIndex`)が
  変化した瞬間だけ、(1) カードをCSSトランジションでクロスフェードし、(2) アバターに
  `present-card.vrma`(3秒、体ごとカード側へターンしながら屈み込んで両手で掴み、よいしょと
  気合いを入れて持ち上げる。t=0とt=durationが同一の「休め」姿勢)をワンショット再生させる。
  カテゴリ境界ちょうどでの往復スクロールによる連打を防ぐため、`displayedIndex`の確定に
  ヒステリシス(`BOUNDARY_HYSTERESIS`)を持たせている。逆方向にスクロールした場合も同じ
  `present-card.vrma`を順再生する(逆再生は「持ち上げ」の演技として不自然に見えるため)。
  カード切り替えとワンショット再生は境界を跨いだ瞬間に同時開始する: 退出側を即座に
  (350ms)フェードアウトしつつ入場側も遅延なし(`CARD_ENTER_DELAY_MS = 0`)でフェードイン
  させ、アバターの演技がカードの動き出しに同期して始まる(スワイプへの即応性を優先)。
  スクロール速度と演技の再生速度が完全に分離されたため、以前センシ調整のために引き上げて
  いた`VH_PER_CATEGORY`(70)は50に戻せた。`pulseAction.timeScale = 2`でpresent-card.vrma
  (3秒)は実質1.5秒のテンポで再生される。`CARD_ENTER_DELAY_MS`は演技の山場に合わせる用途を
  やめ、カード動き出しとの同期(=0)を既定とするため`timeScale`とは独立した調整値になった。
- **`createVrmScene.ts`の`"pulse"`モード**: `idleAnimationUrl`(常時ループ再生)と
  `pulseAnimationUrl`(トリガーされるたびに再生し直すワンショット)の2action構成。
  `getTriggerToken()`が返す値が変化するたびに`pulseAction.reset().play()` +
  `idleAction.crossFadeTo(pulseAction, ...)`する。真偽値の`"dock"`モード(7.7節)と違い
  カウンタにしているのは、演技が終わる前に短時間で連続トリガーされても(カテゴリを素早く
  スクロールし切った場合など)取りこぼさず都度頭から再生し直すため。ワンショットが最後まで
  再生し終えたら`mixer`の`"finished"`イベントで自動的に`idleAction`へcrossFadeToし直す
  (`dock`モードと違い、呼び出し側が明示的に「戻す」タイミングを与える必要がない)。
  - **切替後の無反応時間を避けるための2点**: (1) クロスフェードは onset(idle→演技、
    `PULSE_ONSET_CROSSFADE_SEC`)と return(演技→idle、`PULSE_RETURN_CROSSFADE_SEC`)で
    分離する。onsetの秒数ぶん演技がidleとブレンドされて中立のまま留まり切替への遅延として
    体感されるため、onsetはほぼ即時の最小値にする(反応の要。演技全体の速さは
    `PULSE_TIME_SCALE`側で決める)。(2) present-card.vrma冒頭の中立立ち保持
    (旧スクラブ機構がt=0を中立姿勢に要求した名残)を**アセット側で除去**した。以前は
    先頭0.35秒がほぼ静止で、コード側で再生開始位置を飛ばして対処していたが、途中から
    再生する回避策(行儀が悪い)をやめ、キーフレーム時刻のリタイミングで冒頭[0,0.35]を
    [0,0.06]へ圧縮した(ポーズは不変、duration 3.0→2.71秒)。t=0は中立のまま残すので
    idleからのクロスフェードは綺麗なまま、切替直後から屈み込みが始まる。
- **VRMAの符号に注意**: このアバターでは、three-vrm-animationのretargeting適用後、
  upperArm/lowerArmのZの符号が、生成時にauthorした値から反転して現れる(Yはそのまま)。
  大きな振れ幅のモーションを作る際は必ず実機で描画確認し、意図と逆に動く場合は該当軸の符号を
  反転して再生成する。**注意**: `~/.claude/skills/vrma-create/reference.md`にはchest/spine/head
  のXも反転すると書かれているが、本セッションでPlaywright経由で実際のボーン回転値を直接検証した
  ところ、chest/spine/headのXは反転せず標準規約通り(+で前屈)に適用されることを確認した
  (前回セッションの記述は誤りだった可能性が高い。ユーザーに報告済み、reference.md未修正)。
- カメラフレーミングはHeroのバストアップより下方向に広げる(`cameraFraming.hipsBottomMargin`)。

## 7.6 セクションスクロールスナップ(プロフィール)

画面の縦幅とセクションの縦幅が一致しないため、素のスクロールだと(特にTech Stackの
`position: sticky`ピン区間へ入る瞬間)セクション境界で急に吸われる感覚が出る。これを
和らげるため、`/profile`のトップレベルセクション(Hero / About / Products / Tech Stack)
にCSS Scroll Snapで緩い停止リズムを付けている(`ScrollSnapSync.tsx` / 各セクションの
`snap-start`)。

- **スコープは`/profile`限定**: `globals.css`はブログページとも共有するため、`html`要素
  に直接ではなく`html[data-scroll-snap="profile"]`にのみ`scroll-snap-type: y proximity`
  を効かせる。この属性は`ScrollSnapSync.tsx`がマウント時に`document.documentElement`へ
  付与し、アンマウント時に削除する(WorldSyncと違い、プロフィール専有属性のため
  ブログへのSPA遷移時に消し忘れると漏れる)。
- **`mandatory`ではなく`proximity`**: `mandatory`はAbout/Productsのようにビューポートより
  縦に長いセクションで、内部を読もうとするスクロールとスナップが綱引きになり
  コンテンツを読めなくする恐れがある。`proximity`は停止位置がスナップポイント付近の
  時だけ緩く吸着し、セクション内部の自由なスクロールは妨げない。
- **スナップ対象はトップレベルセクションのみ**: Tech Stack内部の`TechStackShowcase.tsx`
  (カテゴリカード送りの`position: sticky`ピン機構)には`snap-*`を一切付けない。ネストした
  scroll-snapコンテナにすると、`window`のスクロールイベントを前提にした
  `TechStackShowcase.tsx`のrAFスクラブ計算と食い違う。Footerにもスナップは付けない
  (ページ最後まで自由に読み切れる必要があるため)。
- **オフセットは`scroll-mt-20`のみ**: 各セクションは既存の`scroll-mt-20`
  (`scroll-margin-top: 5rem`、sticky headerの下に着地させるためのもの)を流用する。
  scroll-snapのスナップ位置は要素の`scroll-margin`とスクロールコンテナの
  `scroll-padding`が加算的に効くため、両方に同量を入れると二重オフセットでずれる。
  そのため`scroll-padding-top`は追加しない。
- **`prefers-reduced-motion: reduce`では無効化**: スナップの吸着自体もモーションとみなし、
  既存の全体ルール(`scroll-behavior: auto !important`と同じブロック)に
  `scroll-snap-type: none !important`を追記して打ち消す。

## 7.7 Hero↔Aboutアバター移動演出

`prefers-reduced-motion`でない場合(画面幅は問わない。モバイルも含む)、Heroで使っている
VRMアバターと同一のインスタンスが、スクロールでHero→Aboutへ画面上の位置を移動する
(`AvatarTravelContext.tsx` / `FloatingAvatar.tsx` / `HeroAvatarDock.tsx` /
`AboutAvatarDock.tsx` / `AboutIntro.tsx`)。それ以外(reduced-motion・SSR/初回CSR)では
Hero・Aboutそれぞれが従来通り自前の静的なアバター/写真アイコンを描画する(判定は
TechStackBody.tsxと同じマウント後matchMedia方式)。

**あえてlg限定にしていない**: `avatar.vrm`が23MBあり、WebGLコンテキストも限られた
リソースのため、showcase=false時にHero/Aboutそれぞれが独立したVrmCanvasを持つと
2枚目のcanvasと2回目の23MBロードが発生してしまう。共有アバター1枚だけで完結させる
この設計自体が「2枚目のcanvasを作らずに済ませる手段」になっているため、モバイルでも
lg版と同じ移動演出を使う方がむしろ軽い。モバイルでの配置は「見出し→アバター→吹き出し」の
縦積みで、`AboutAvatarDock`のdocker位置がAboutの見出しの直下に来るようレイアウトされる
(FLIP変換自体はスロットの実際の矩形を読むだけなので、縦並びでも計算式の変更は不要)。

参考にした[davidhckh/portfolio-2025](https://github.com/davidhckh/portfolio-2025)は
Vue+GSAP+Three.jsのフルページ3Dシーンで、1体のアバターを3D空間内のwaypoint間で
スクラブ移動させる構成だった。本サイトはコンポーネント単位でcanvasを持つ構成のため
同じ機構は移植できない。「アバターは体の向きを変えずtranslate+scaleのみで画面上を
移動する」という設計判断(ユーザー確認済み)により、3Dのカメラ/waypoint再設計ではなく
2Dスクリーン座標のtransform補間問題に単純化した。

- **アーキテクチャ**: `AvatarTravelProvider`がHero・About共通の`heroSlotRef`・
  `aboutSlotRef`とshowcase判定をReact Contextで提供する。`HeroAvatarDock`/
  `AboutAvatarDock`はshowcase時、実体を描画せず位置測定用の空divをそれぞれのrefに
  結びつけるだけ(実際のレンダリングは`FloatingAvatar`が1つだけ担当)。
  `FloatingAvatar`は`position: fixed`のラッパーdivをHeroスロットの矩形に一致させて
  基準位置とし、Aboutスロットの矩形との差分(`translate`+`scale`、
  `transform-origin: top left`)をスクロール進捗ぶんだけ適用する(FLIP的な手法)。
  canvasの実サイズ(`clientWidth`/`clientHeight`)は変えない:
  `createVrmScene`のResizeObserverがそこでカメラを再計算するため、動かすたびに
  カメラが暴れてしまう。見た目のサイズ変化は`transform: scale()`だけで表現する。
- **進捗はビューポート相対ではなく絶対スクロール量で計算**(`avatarTravel.ts`の
  `computeTravelProgress(scrollY, aboutSectionDocTop)`)。渡すのは`aboutSlotRef`
  (アバターの実際の配置先。見出しぶん下にオフセットされている)ではなく`#about`
  セクション自身のドキュメント座標top。`REST_TOP_PX`(`scroll-mt-20`と同じ80px)を
  引いた値を「到達scrollY」とみなし、`scrollY / 到達scrollY`を0〜1にクランプする。
  この形にする前は「Aboutがビューポート下端から200px手前まで来たら0」という
  ビューポート相対の式だったが、Heroが`min-h-[85dvh]`でビューポートより低いため、
  scrollY=0の時点で既にAboutがその範囲に入ってしまい、ページ読み込み直後から
  アバターが移動済みの状態(Heroでの位置ズレ)になる不具合があった。また
  `aboutSlotRef`基準だと、scroll-snapでの自然な静止位置に達してもtopが0まで届かず
  進捗が0.9台で頭打ちになる問題もあり、この2つを避けるため絶対スクロール量+
  セクション自身のtopという現在の形にした。
- **アニメーション**: `createVrmScene.ts`の`VrmMotion`に`"dock"`モードを追加。通常は
  Heroのループ(`loop_verse.vrma`)を再生し、`getDocked()`がtrueに変わった瞬間
  `v-sign.vrma`(ワンショット、ピースサインで静止)へ`crossFadeTo`する。逆方向は
  ループへ`crossFadeTo`(v-signを逆再生するのではなく、ループの先頭へ普通にクロス
  フェードする)。ここはスクロール位置と連続的に同期させる必要がない離散的な
  状態遷移のため、Tech Stackの待機モーション(7.5節)と異なり壁時計時間ベースの
  `crossFadeTo`をそのまま使ってよい。ドック判定は0.95で入り0.85を下回るまで解除しない
  ヒステリシスを持たせ、しきい値付近の往復スクロールでの発火連打を防いでいる
  (`nextDockedState`)。
- **マウス追従の頭部回転は`composeOnAnimatedPose=false`固定**: dockモードでは
  `updatePointerFollow`をレスト基準(`false`)で呼ぶ。`true`(合成基準、通常の
  `loop`モードと同じ)のままだと、`v-sign.vrma`にheadボーンのトラックが無い場合
  `mixer.update()`がheadBoneに触れず、毎フレームの`quaternion.multiply()`が
  前フレームの結果に積み重なって頭部が際限なく回転し続けるバグになる
  (Aboutにドックした状態で発生していた)。レスト基準にするとクリップ側の頭の
  動きは犠牲になるが、安全を優先した。
- **2Dテキストのフェード**: 見出し・吹き出し(`AboutIntro.tsx`)は`FadeIn`の
  IntersectionObserverではなく、アバター移動と同じ進捗値から直接`opacity`を
  設定する(移動の最後10%でフェードイン、逆方向で対称にフェードアウト)。
  「ブログを読む」ボタンはこのフェード対象に含める(見出し・吹き出しと同じ
  タイミングで現れないと視覚的に浮いて見えるため)。既存e2eテスト
  (`home.spec.ts`・`navigation.spec.ts`)はこれに伴い、`#about`へスクロールしてから
  可視性を確認するよう更新した。
- **フォールバック**: モバイル・reduced-motionでは、Aboutは従来通りの丸型写真
  アイコン(VRMアバターではない)のまま。Hero用の第2のアバターインスタンスを
  増やさずに済み、リスクとスコープを最小化している。
- **ロード中プレースホルダ**: showcase時、`avatar.vrm`(22MB)の読込完了までHero
  スロットが空白になるのを避けるため、`AvatarTravelContext`の`avatarReady`
  (`FloatingAvatar`が`createVrmScene()`解決時にtrueへ更新)がfalseの間、
  `HeroAvatarDock`が`VrmFallback`(グラデーション球)を`absolute inset-0`で
  表示する。ready後は`VrmCanvas.tsx`のロード完了と同じopacity遷移(700ms)で
  フェードアウトする。`FloatingAvatar`のcanvasは`alpha: true`で透明なため、
  読込中はこのフォールバックがcanvas越しに透けて見える。読込失敗時(catch)は
  `avatarReady`がtrueにならないため、フォールバックが出続ける。

## 8. 禁止事項

- 生HEX・任意値のアドホック指定(トークンを経由する)
- 世界(tech/daily)ごとの三項演算子での色分岐(`data-world` + CSS変数で解決する)
- ブログ本文ページへのクライアントJS追加(共有ボタン等の既存最小限を除く)
- CDN読み込み(フォント含めすべてセルフホスト/next/font)
