import Footer from "@/components/layouts/Footer"

// Headerはここでは描画しない: 記事ページはヘッダーに目次(page側で
// レンダリングしたtoc)を渡す必要があり、layoutはpageが計算したデータを
// 受け取れないため、[slug]/page.tsx が自前でBlogHeaderを描画する
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  // dvh: モバイルのブラウザUIを除いた実表示領域に合わせる
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  )
}
