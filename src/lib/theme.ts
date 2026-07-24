export type World = "tech" | "daily"

export const THEME_STORAGE_KEY = "theme-preference"

export function isWorld(value: unknown): value is World {
  return value === "tech" || value === "daily"
}

// <head>直後に同期実行する初期化スクリプト本体。ThemeSync/WorldSyncと同じ
// 優先順位(明示保存 > ページ既定)をハードロード時のペイント前に適用し、
// 「デフォルトの世界で一瞬表示されてから切り替わる」ちらつきを防ぐ。
// SPA遷移では再実行されないため、CSR側の追従はThemeSync/WorldSyncが担う
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

// ブログ一覧・記事ページ用。カテゴリ(=そのページのworld既定値)はビルド時/
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
