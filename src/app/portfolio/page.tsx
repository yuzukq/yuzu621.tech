import Footer from "@/components/layouts/Footer"
import WorldSync from "@/components/blog/WorldSync"
import PortfolioHeader from "@/components/portfolio/PortfolioHeader"
import Hero from "@/components/portfolio/Hero"
import About from "@/components/portfolio/About"
import Products from "@/components/portfolio/Products"
import Skills from "@/components/portfolio/Skills"

// ポートフォリオは常に tech 世界(DESIGN.md §1)固定。ブログの WorldSync を
// 流用し、<html data-world> をこのページの世界観に明示的に同期させる。
export default function PortfolioPage() {
  return (
    <div data-world="tech" className="flex min-h-dvh flex-col bg-bg">
      <WorldSync world="tech" />
      <PortfolioHeader />
      <main className="flex-1">
        <Hero />
        <About />
        <Products />
        <Skills />
      </main>
      <Footer />
    </div>
  )
}
