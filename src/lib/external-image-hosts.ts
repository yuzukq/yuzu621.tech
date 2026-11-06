// next/image で最適化して配信してよい外部サムネイルのホスト。
// next.config.ts の images.remotePatterns と BlogCard の両方がここを参照する。
// 載っていないホストを next/image に渡すと画像が表示されなくなるため、
// 出典を増やすときは実際の og:image のホストを確認して追加する
export const EXTERNAL_IMAGE_HOSTS = ['qiita-user-contents.imgix.net']

export function isOptimizableExternalImage(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url)
    return protocol === 'https:' && EXTERNAL_IMAGE_HOSTS.includes(hostname)
  } catch {
    return false
  }
}
