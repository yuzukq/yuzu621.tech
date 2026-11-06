import BlogIndex, { buildBlogIndexMetadata } from '@/components/blog/BlogIndex'

// searchParams を読むと動的レンダリングになるため、カテゴリはURLから読まない。
// /?category=daily は next.config.ts の rewrite で /daily に振り分け、
// それ以外(tech・不正値・指定なし)はすべてこの tech 一覧になる
export const metadata = buildBlogIndexMetadata('tech')

// external-articles.ts の LIST_REVALIDATE_SEC と同じ値。セグメント設定は静的解析されるため
// import した定数や式は使えない(https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
export const revalidate = 3600

export default function BlogIndexPage() {
  return <BlogIndex category="tech" />
}
