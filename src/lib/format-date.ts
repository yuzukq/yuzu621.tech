// タイムゾーンを固定しないと、サーバー(UTC)とクライアント(ローカルTZ)で表示が
// 食い違いhydrationエラーになる。posts.ts に置かないのは、あちらが fs 依存で
// クライアントコンポーネントから import できないため。
export function formatDateJa(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  })
}
