"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart";
import type { CartItem } from "@/types";
import { formatPrice } from "@/lib/utils";

interface CartItemProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemProps) {
  const addBox = useCartStore((s) => s.addBox);
  const decrementBox = useCartStore((s) => s.decrementBox);
  const removeBox = useCartStore((s) => s.removeBox);

  const lineTotal = item.boxPrice * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className="flex gap-4 border-b-2 border-dark/10 pb-4"
    >
      {/* Thumbnail */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-dark">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-dark/5 text-dark/30 text-xs">
            Фото
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h4 className="font-display text-sm font-bold uppercase">
            {item.name}
          </h4>
          <p className="text-xs text-dark/60">
            {item.volume && `${item.volume} • `}
            {item.color && `${item.color} • `}
            {item.piecesPerBox} шт/кор.
          </p>
          <p className="text-xs text-dark/40 mt-0.5">
            {formatPrice(item.boxPrice)} / кор. × {item.quantity}
          </p>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => decrementBox(item.variantId)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-dark text-xs font-bold transition-colors hover:bg-dark hover:text-accent"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-bold">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                addBox({
                  variantId: item.variantId,
                  productId: item.productId,
                  name: item.name,
                  volume: item.volume,
                  color: item.color,
                  sku: item.sku,
                  imageUrl: item.imageUrl,
                  pricePerPiece: item.pricePerPiece,
                  piecesPerBox: item.piecesPerBox,
                  boxPrice: item.boxPrice,
                })
              }
              className="flex h-7 w-7 items-center justify-center rounded-full border border-dark text-xs font-bold transition-colors hover:bg-dark hover:text-accent"
            >
              +
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={() => removeBox(item.variantId)}
            className="text-xs font-bold uppercase text-dark/40 transition-colors hover:text-red-500"
          >
            Удалить
          </button>
        </div>
      </div>

      {/* Line total */}
      <div className="flex flex-shrink-0 items-start pt-1 font-bold">
        {formatPrice(lineTotal)}
      </div>
    </motion.div>
  );
}
