import Footer from "@/components/layouts/Footer"
import BlogHeader from "@/components/blog/BlogHeader"

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  // dvh: モバイルのブラウザUIを除いた実表示領域に合わせる
  return (
    <div className="flex min-h-dvh flex-col">
      <BlogHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  )
}
