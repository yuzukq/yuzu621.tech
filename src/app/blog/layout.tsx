import Footer from "@/components/layouts/Footer"
import BlogHeader from "@/components/blog/BlogHeader"

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  // ブログ配下の共通レイアウト
  // dvh: UIを引いた分の実際の表示領域を指定する
  return (
    <div className="flex min-h-dvh flex-col">
      <BlogHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  )
}
