// Hero→About間でアバターが移動する演出の進捗計算。FloatingAvatar(アバター自体の
// 移動)とAboutIntro(見出し・吹き出しのフェード)の両方から同じ値を参照するため、
// 式をここ1箇所にまとめて食い違いを防ぐ。
const TRAVEL_BAND_EXTRA_PX = 200
// #aboutのscroll-mt-20(Tailwind, 5rem)と揃える。scroll-snapで#aboutが実際に
// 静止する位置はtop:0ではなくこの値になるため、0ではなくこれを「到達」とみなす
// (0のままだと自然にスクロールしただけでは進捗が0.9台で頭打ちになり、
// フェードイン・ドックのしきい値に届かなくなる)
const REST_TOP_PX = 80

/**
 * #aboutセクション自身の上端がビューポート下端からTRAVEL_BAND_EXTRA_PX手前まで
 * 来た時点で0、scroll-snapでの静止位置(REST_TOP_PX)に達した時点で1になる
 * 0〜1の進捗値。渡すのは#aboutセクション自身のtop(アバターの配置先スロットの
 * topではない。スロットは見出し分だけ下にオフセットされ0に到達しないため)。
 */
export function computeTravelProgress(aboutSectionTop: number, viewportHeight: number): number {
  const bandStart = viewportHeight + TRAVEL_BAND_EXTRA_PX
  const raw = (bandStart - aboutSectionTop) / (bandStart - REST_TOP_PX)
  return Math.min(Math.max(raw, 0), 1)
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
