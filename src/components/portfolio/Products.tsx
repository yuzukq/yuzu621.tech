import SectionHeading from "./SectionHeading"
import ProductsGrid from "./ProductsGrid"

export default function Products() {
  return (
    <section id="products" className="scroll-mt-20 border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <SectionHeading eyebrow="Products" title="制作物" />
        <p className="mt-6 max-w-2xl text-ink-muted">
          これまでに開発したプロダクトをご紹介します。各カードをクリックすると詳細情報をご確認いただけます。
        </p>

        <div className="mt-12">
          <ProductsGrid />
        </div>
      </div>
    </section>
  )
}
