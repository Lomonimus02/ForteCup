"use client";

import { ProductCard } from "@/components/product/ProductCard";
import type { SerializedProduct } from "@/types";

interface ProductGridProps {
  products: SerializedProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <section className="overflow-hidden bg-dark py-24 text-light">
      <div className="mx-auto max-w-[1400px] px-5 text-center">
        <h2 className="font-display text-[40px] uppercase text-accent">
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

      <div className="mt-10 flex justify-center gap-8 overflow-x-auto px-10 pb-14 pt-4 hide-scrollbar">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
