// Hero→About間でアバターが移動する演出の進捗計算。FloatingAvatar(アバター自体の
// 移動)とAboutIntro(見出し・吹き出しのフェード)の両方から同じ値を参照するため、
// 式をここ1箇所にまとめて食い違いを防ぐ。
//
// ビューポート相対(「Aboutが画面下端からNpx以内に来たら」)ではなく、絶対スクロール量
// (scrollY / 到達に必要なscrollY)で計算する。Heroが85dvhとビューポートより低いため、
// ビューポート相対の式だとscrollY=0の時点で既にAboutが「近い」判定になってしまい、
// ページ読み込み直後からアバターが動いた状態で表示される不具合があった。

// #aboutのscroll-mt-20(Tailwind, 5rem)と揃える。scroll-snapで#aboutが実際に
// 静止するscrollYはセクション自身のドキュメント座標topそのものではなくこの分
// 手前になる
const REST_TOP_PX = 80

/**
 * scrollY=0で0、#aboutがscroll-snapで静止するscrollY
 * (aboutSectionDocTop - REST_TOP_PX)に達した時点で1になる0〜1の進捗値。
 * aboutSectionDocTopは#aboutセクション自身のドキュメント座標top
 * (getBoundingClientRect().top + window.scrollY)。アバターの配置先スロットの
 * topではない(スロットは見出し分だけ下にオフセットされ、それを基準にすると
 * 自然にスクロールしただけでは進捗が0.9台で頭打ちになる)。
 */
export function computeTravelProgress(scrollY: number, aboutSectionDocTop: number): number {
  const travelEndY = aboutSectionDocTop - REST_TOP_PX
  if (travelEndY <= 0) return 1
  return Math.min(Math.max(scrollY / travelEndY, 0), 1)
}

const TEXT_FADE_START = 0.9

/** 移動が完了しきる直前(最後の10%)でのみフェードインする */
export function computeTextOpacity(progress: number): number {
  return Math.min(Math.max((progress - TEXT_FADE_START) / (1 - TEXT_FADE_START), 0), 1)
}

const DOCK_ENTER_THRESHOLD = 0.95
const DOCK_EXIT_THRESHOLD = 0.85

/**
 * ドック判定にヒステリシスを持たせ、しきい値付近での往復スクロールによる
 * crossFadeToの連打(フラップ)を防ぐ。
 */
export function nextDockedState(progress: number, wasDocked: boolean): boolean {
  return wasDocked ? progress >= DOCK_EXIT_THRESHOLD : progress >= DOCK_ENTER_THRESHOLD
}
