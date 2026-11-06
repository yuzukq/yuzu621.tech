const bufferPromises = new Map<string, Promise<ArrayBuffer>>()

// Hero/About と Tech Stack のシーンが同じ URL を同時に読みにいっても、fetch は1回に
// まとめる。public/ は max-age=0, must-revalidate で配信されるため、HTTP キャッシュでは
// 同時に始まった2つのリクエストがまとめられる保証が無い。
// 取得済みのバッファはページを離れても解放しない: 再訪問時に再ダウンロードしないため
export function fetchVrmAssetBuffer(url: string): Promise<ArrayBuffer> {
  const cached = bufferPromises.get(url)
  if (cached) return cached

  const promise = fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`)
    }
    return response.arrayBuffer()
  })
  bufferPromises.set(url, promise)
  // 失敗した Promise を残すと、以降の再試行も同じ失敗を返し続けてしまう
  promise.catch(() => {
    if (bufferPromises.get(url) === promise) bufferPromises.delete(url)
  })
  return promise
}
