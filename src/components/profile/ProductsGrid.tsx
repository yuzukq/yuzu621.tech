"use client"

import { useState } from "react"
import { products, type Product } from "@/data/products"
import FadeIn from "./FadeIn"
import ProductCard from "./ProductCard"
import ProductDetailOverlay from "./ProductDetailOverlay"

export default function ProductsGrid() {
  const [selected, setSelected] = useState<Product | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <FadeIn key={product.id} delay={index * 100}>
            <ProductCard product={product} onSelect={() => setSelected(product)} />
          </FadeIn>
        ))}
      </div>

      {selected && (
        <ProductDetailOverlay product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
