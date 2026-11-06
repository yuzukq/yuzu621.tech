import BlogIndex, { buildBlogIndexMetadata } from '@/components/blog/BlogIndex'

// 公開URLは /?category=daily(next.config.ts の rewrite 先)。/daily への直接アクセスは
// redirect しない: canonical が `/` なので重複URLにならず、rewrite とのループも避けられる
export const metadata = buildBlogIndexMetadata('daily')

// external-articles.ts の LIST_REVALIDATE_SEC と同じ値。セグメント設定は静的解析されるため
// import した定数や式は使えない(https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
export const revalidate = 3600

export default function DailyBlogIndexPage() {
  return <BlogIndex category="daily" />
}
