// 日付表示の共通フォーマッタ。
// サーバー(ビルド環境はUTC)とクライアント(閲覧者のローカルTZ)で
// 結果が食い違うとhydrationエラーになるため、タイムゾーンを明示固定する。
// posts.ts と分離しているのは、こちらはクライアントコンポーネントからも
// importされるため(posts.ts は fs 依存でサーバー専用)。
export function formatDateJa(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  })
}
