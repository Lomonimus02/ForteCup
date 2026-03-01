"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { Tag } from "@/components/ui/Tag";
import type { SerializedProduct } from "@/types";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: SerializedProduct;
  loading?: boolean;
}

export function ProductCard({ product, loading }: ProductCardProps) {
  const addBox = useCartStore((s) => s.addBox);
  const openCart = useCartStore((s) => s.openCart);

  if (loading) {
    return (
      <div className="product-card min-w-[280px] shrink-0 rounded-[var(--radius-apple)] bg-light p-4 sm:min-w-[320px] md:min-w-0 md:shrink">
        <div className="mb-5 h-[260px] animate-pulse rounded-3xl border-2 border-dark/20 bg-dark/10" />
        <div className="h-4 w-20 animate-pulse rounded bg-dark/10" />
        <div className="mt-2 h-6 w-40 animate-pulse rounded bg-dark/10" />
        <div className="mt-4 flex items-center justify-between">
          <div className="h-5 w-20 animate-pulse rounded bg-dark/10" />
          <div className="h-[45px] w-[45px] animate-pulse rounded-full bg-dark/10" />
        </div>
      </div>
    );
  }

  // Pick cheapest available variant for pricing display
  const inStockVariants = product.variants.filter((v) => v.inStock);
  const variant = inStockVariants.length > 0
    ? inStockVariants.reduce((a, b) => (a.boxPrice < b.boxPrice ? a : b))
    : product.variants[0] ?? null;

  const isOutOfStock = inStockVariants.length === 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || !variant) return;

    addBox({
      variantId: variant.id,
      productId: product.id,
      name: product.name,
      volume: variant.volume,
      color: variant.colorOrDesign,
      sku: variant.sku,
      imageUrl: product.imageBaseUrl,
      pricePerPiece: variant.pricePerPiece,
      piecesPerBox: variant.piecesPerBox,
      boxPrice: variant.boxPrice,
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
    <Link href={`/product/${product.id}`}>
      <div
        className={cn(
          "product-card relative min-w-[280px] shrink-0 rounded-[var(--radius-apple)] bg-light p-4 text-dark transition-all duration-300 ease-out hover:-translate-y-1.5 sm:min-w-[320px] md:min-w-0 md:shrink",
          isOutOfStock && "opacity-60"
        )}
        style={{ boxShadow: "0 0 0 transparent" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "8px 8px 0 #FFD600";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 0 0 transparent";
        }}
      >
        {/* Image */}
        <div className="relative mb-5 h-[260px] overflow-hidden rounded-3xl border-2 border-dark">
          {product.imageBaseUrl ? (
            <Image
              src={product.imageBaseUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="320px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-dark/5 text-dark/20 font-display text-sm uppercase">
              Нет фото
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark/50">
              <span className="rounded-full bg-white px-4 py-2 font-display text-sm font-extrabold uppercase">
                Нет в наличии
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <Tag className="mb-2.5">{product.categoryName}</Tag>
          <h3 className="text-[22px] font-extrabold uppercase leading-tight">
            {product.name}
          </h3>

          {/* B2B Pricing */}
          {variant && (
            <div className="mt-3">
              <p className="text-xs text-dark/60">
                От {formatPrice(variant.pricePerPiece)} / шт.
              </p>
              <p className="text-lg font-bold">
                {formatPrice(variant.boxPrice)}{" "}
                <span className="text-sm font-medium text-dark/60">
                  / кор. ({variant.piecesPerBox} шт.)
                </span>
              </p>
            </div>
          )}

          {/* Add to cart */}
          <div className="mt-3 flex items-center justify-end">
            <motion.button
              whileTap={{ scale: 0.9 }}
              transition={{ type: "tween", duration: 0.15 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                "flex h-[45px] w-[45px] items-center justify-center rounded-full border-2 border-dark text-xl transition-colors",
                isOutOfStock
                  ? "cursor-not-allowed bg-dark/20 text-dark/40"
                  : "bg-accent hover:bg-dark hover:text-accent"
              )}
              aria-label={`Добавить коробку ${product.name} в корзину`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </Link>
  );
}
