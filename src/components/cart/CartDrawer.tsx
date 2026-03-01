"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { CartItemRow } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const totalBoxes = useCartStore((s) => s.totalBoxes);
  const totalPieces = useCartStore((s) => s.totalPieces);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[1100] bg-dark/50"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-[1200] flex h-full w-full flex-col bg-light shadow-2xl sm:max-w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-dark px-6 py-5">
              <h2 className="font-display text-xl font-extrabold uppercase">
                Корзина
              </h2>
              <button
                onClick={closeCart}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dark transition-colors hover:bg-dark hover:text-accent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-display text-2xl font-extrabold uppercase text-dark/30">
                    Корзина пуста
                  </p>
                  <p className="mt-2 text-sm text-dark/50">
                    Добавьте коробку в корзину
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <CartItemRow key={item.variantId} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t-2 border-dark px-6 py-5">
                {/* Summary */}
                <div className="mb-3 flex items-center justify-between text-xs text-dark/60">
                  <span>{totalBoxes()} кор. • {totalPieces()} шт.</span>
                </div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-display text-lg font-extrabold uppercase">
                    Итого
                  </span>
                  <span className="font-display text-2xl font-extrabold">
                    {formatPrice(totalPrice())}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="rounded-full border-2 border-dark px-5 py-3 text-xs font-bold uppercase transition-colors hover:bg-dark hover:text-accent"
                  >
                    Очистить
                  </button>

                  <Link href="/checkout" onClick={closeCart} className="flex-1">
                    <Button className="w-full" size="md">
                      Оформить заказ
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
