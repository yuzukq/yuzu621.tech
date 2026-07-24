export type World = "tech" | "daily"

export const THEME_STORAGE_KEY = "theme-preference"

export function isWorld(value: unknown): value is World {
  return value === "tech" || value === "daily"
}

// 「明示保存 > ページ既定」優先順位の唯一の実装。ThemeSync/WorldSyncはこれを
// 呼ぶ。pageDefaultが関数の場合、prefersLightの算出(matchMedia呼び出し)は
// 副作用として呼び出し元に残し、ここでは優先順位判定のみを純粋に行う
export function resolveWorld(
  stored: unknown,
  pageDefault: World | ((prefersLight: boolean) => World),
  prefersLight = false
): World {
  if (isWorld(stored)) return stored
  return typeof pageDefault === "function" ? pageDefault(prefersLight) : pageDefault
}

// <head>直後に同期実行する初期化スクリプト本体。resolveWorld()と同じ
// 優先順位(明示保存 > ページ既定)をハードロード時のペイント前に適用し、
// 「デフォルトの世界で一瞬表示されてから切り替わる」ちらつきを防ぐ。
// SPA遷移では再実行されないため、CSR側の追従はThemeSync/WorldSyncが担う。
// SSR HTMLへ文字列として埋め込む必要がありresolveWorld()を直接呼べないため、
// 同一ロジックをJS文字列として複製している(resolveWorld(stored, prefersLight
// => prefersLight ? 'daily' : 'tech', prefersLight)と等価。変更時は両方を同期させること)
export const THEME_INIT_SCRIPT = `(function(){try{
var KEY=${JSON.stringify(THEME_STORAGE_KEY)};
var stored=localStorage.getItem(KEY);
if(stored==='tech'||stored==='daily'){
document.documentElement.dataset.world=stored;
}else if(location.pathname==='/profile'||location.pathname.indexOf('/profile/')===0){
var prefersLight=window.matchMedia('(prefers-color-scheme: light)').matches;
if(prefersLight)document.documentElement.dataset.world='daily';
}
}catch(e){}})();`

// ブログ一覧・記事ページ用。resolveWorld(stored, defaultWorld)と等価(変更時は
// 両方を同期させること)。カテゴリ(=そのページのworld既定値)はビルド時/
// リクエスト時にサーバー側で確定しているため、ページごとに具体値を埋め込んだ
// 専用initスクリプトを先頭に置く。ルート直下のTHEME_INIT_SCRIPTだけでは
// URLからカテゴリを判別できず(記事スラッグからは分からない)、保存設定が
// 無い読者に「一瞬techで出てから正しい世界へ切り替わる」ちらつきが出るため
export function buildWorldPrePaintScript(defaultWorld: World): string {
  return `(function(){try{
var KEY=${JSON.stringify(THEME_STORAGE_KEY)};
var stored=localStorage.getItem(KEY);
document.documentElement.dataset.world=(stored==='tech'||stored==='daily')?stored:${JSON.stringify(defaultWorld)};
}catch(e){}})();`
}
