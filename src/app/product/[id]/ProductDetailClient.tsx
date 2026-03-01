"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { formatPrice } from "@/lib/utils";
import type { SerializedProduct, SerializedVariant } from "@/types";
import toast from "react-hot-toast";

interface ProductDetailClientProps {
  product: SerializedProduct;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const addBox = useCartStore((s) => s.addBox);
  const openCart = useCartStore((s) => s.openCart);

  // Track selected variant
  const inStockVariants = product.variants.filter((v) => v.inStock);
  const [selectedVariant, setSelectedVariant] = useState<SerializedVariant>(
    inStockVariants[0] ?? product.variants[0]
  );

  const anyInStock = inStockVariants.length > 0;

  function handleAddToCart() {
    if (!selectedVariant?.inStock) return;
    addBox({
      variantId: selectedVariant.id,
      productId: product.id,
      name: `${product.name}${selectedVariant.volume ? ` ${selectedVariant.volume}` : ""}${selectedVariant.colorOrDesign ? ` (${selectedVariant.colorOrDesign})` : ""}`,
      volume: selectedVariant.volume,
      color: selectedVariant.colorOrDesign,
      sku: selectedVariant.sku,
      imageUrl: product.imageBaseUrl,
      pricePerPiece: selectedVariant.pricePerPiece,
      piecesPerBox: selectedVariant.piecesPerBox,
      boxPrice: selectedVariant.boxPrice,
    });
    openCart();
    toast.success("Коробка добавлена в корзину", {
      style: {
        background: "#0D0D0D",
        color: "#FFD600",
        fontFamily: "var(--font-main)",
        fontWeight: 700,
        borderRadius: "100px",
      },
      iconTheme: { primary: "#FFD600", secondary: "#0D0D0D" },
    });
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:py-20">
      {/* Breadcrumbs */}
      <nav className="mb-8 text-sm">
        <Link href="/" className="menu-link text-dark/50 hover:text-dark">
          Главная
        </Link>
        <span className="mx-2 text-dark/30">/</span>
        <Link
          href={`/catalog?category=${product.categorySlug}`}
          className="menu-link text-dark/50 hover:text-dark"
        >
          {product.categoryName}
        </Link>
        <span className="mx-2 text-dark/30">/</span>
        <span className="font-bold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Image */}
        <div>
          <motion.div
            className="relative aspect-square overflow-hidden border-2 border-dark"
            style={{ borderRadius: "var(--radius-apple)" }}
          >
            {product.imageBaseUrl ? (
              <Image
                src={product.imageBaseUrl}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-dark/5">
                <span className="text-dark/30">Нет фото</span>
              </div>
            )}

            {!anyInStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-dark/50">
                <span className="rounded-full bg-white px-6 py-3 font-display text-lg font-extrabold uppercase">
                  Нет в наличии
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          {product.isPopular && <Tag>Хит</Tag>}

          <h1 className="mt-4 font-display text-5xl font-extrabold uppercase leading-tight lg:text-6xl">
            {product.name}
          </h1>

          {product.description && (
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-dark/70">
              {product.description}
            </p>
          )}

          {/* Variant Selector */}
          {product.variants.length > 1 && (
            <div className="mt-8">
              <p className="mb-3 text-xs font-bold uppercase text-dark/50">
                Выберите вариант
              </p>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    disabled={!v.inStock}
                    className={`rounded-2xl border-2 px-5 py-3 text-left transition-all ${
                      selectedVariant?.id === v.id
                        ? "border-accent shadow-[4px_4px_0_var(--color-dark)]"
                        : v.inStock
                          ? "border-dark/30 hover:border-dark"
                          : "border-dark/10 opacity-40"
                    }`}
                  >
                    {v.volume && (
                      <p className="text-sm font-bold">{v.volume}</p>
                    )}
                    {v.colorOrDesign && (
                      <p className="text-xs text-dark/60">{v.colorOrDesign}</p>
                    )}
                    <p className="mt-1 text-xs font-bold text-accent">
                      {formatPrice(v.boxPrice)} / кор.
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Variant Meta */}
          {selectedVariant && (
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="rounded-2xl border-2 border-dark px-5 py-3">
                <p className="text-xs font-bold uppercase text-dark/50">
                  Артикул
                </p>
                <p className="font-bold">{selectedVariant.sku}</p>
              </div>
              <div className="rounded-2xl border-2 border-dark px-5 py-3">
                <p className="text-xs font-bold uppercase text-dark/50">
                  В коробке
                </p>
                <p className="font-bold">{selectedVariant.piecesPerBox} шт.</p>
              </div>
              <div className="rounded-2xl border-2 border-dark px-5 py-3">
                <p className="text-xs font-bold uppercase text-dark/50">
                  Наличие
                </p>
                <p className="font-bold">
                  {selectedVariant.inStock ? "В наличии" : "Нет в наличии"}
                </p>
              </div>
            </div>
          )}

          {/* Price & CTA */}
          {selectedVariant && (
            <div className="mt-10">
              <p className="text-sm text-dark/50">
                От {formatPrice(selectedVariant.pricePerPiece)} / шт.
              </p>
              <div className="mt-2 flex items-center gap-6">
                <span className="font-display text-4xl font-extrabold">
                  {formatPrice(selectedVariant.boxPrice)}
                  <span className="ml-2 text-lg font-bold text-dark/50">
                    / кор. ({selectedVariant.piecesPerBox} шт.)
                  </span>
                </span>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant.inStock}
                  className={
                    !selectedVariant.inStock
                      ? "opacity-40 cursor-not-allowed"
                      : ""
                  }
                >
                  {selectedVariant.inStock
                    ? "Добавить коробку"
                    : "Нет в наличии"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
