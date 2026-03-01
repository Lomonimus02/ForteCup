"use client";

import { ProductCard } from "@/components/product/ProductCard";
import type { SerializedProduct } from "@/types";

interface ProductGridProps {
  products: SerializedProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <section className="overflow-hidden bg-dark py-12 text-light md:py-24">
      <div className="mx-auto max-w-[1400px] px-5 text-center">
        <h2 className="font-display text-2xl uppercase text-accent sm:text-[32px] md:text-[40px]">
          Хиты продаж{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="inline"
          >
            <path d="M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.773.5 1.604.5 2.47A7.5 7.5 0 0 1 12 23Z" />
          </svg>
        </h2>
      </div>

      {/* Mobile: horizontal scroll, Tablet+: grid */}
      <div className="mt-8 flex gap-5 overflow-x-auto px-5 pb-10 pt-4 snap-x snap-mandatory md:hidden hide-scrollbar">
        {products.map((product) => (
          <div key={product.id} className="snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 hidden max-w-[1400px] grid-cols-2 gap-6 px-5 pb-14 md:grid lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
