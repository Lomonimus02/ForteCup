"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "./actions";
import type { CheckoutFormData } from "@/types";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "Минимум 2 символа"),
  lastName: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  phone: z.string().min(10, "Введите корректный телефон"),
  address: z.string().min(5, "Введите полный адрес"),
  city: z.string().min(2, "Введите город"),
  postalCode: z.string().min(5, "Введите индекс"),
  notes: z.string().optional(),
});

export function CheckoutClient() {
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const clearCart = useCartStore((s) => s.clearCart);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  async function onSubmit(data: CheckoutFormData) {
    setServerError(null);

    // Собираем FormData для Server Action
    const formData = new FormData();
    formData.set("firstName", data.firstName);
    formData.set("lastName", data.lastName);
    formData.set("email", data.email);
    formData.set("phone", data.phone);
    formData.set("address", data.address);
    formData.set("city", data.city);
    formData.set("postalCode", data.postalCode);
    if (data.notes) formData.set("notes", data.notes);

    // Преобразуем корзину Zustand в формат для Server Action
    const cartItems = items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.boxPrice,
    }));

    const result = await createOrder(formData, cartItems);

    if (result.success) {
      clearCart();
      setIsSubmitted(true);
    } else {
      setServerError(result.error);
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dark bg-accent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="font-display text-4xl font-extrabold uppercase lg:text-5xl">
            Заказ оформлен!
          </h1>
          <p className="mt-4 text-lg text-dark/60">
            Мы свяжемся с вами для подтверждения.
          </p>
          <Link href="/" className="mt-8 inline-block">
            <Button>На главную</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-20 text-center">
        <h1 className="font-display text-3xl font-extrabold uppercase text-dark/30">
          Корзина пуста
        </h1>
        <Link href="/" className="mt-6 inline-block">
          <Button>Вернуться к покупкам</Button>
        </Link>
      </div>
    );
  }

  const inputBase =
    "w-full rounded-2xl border-2 border-dark bg-white px-5 py-4 font-main text-sm font-medium outline-none transition-all focus:border-accent focus:shadow-[4px_4px_0_var(--color-accent)]";

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:py-20">
      {/* Breadcrumbs */}
      <nav className="mb-8 text-sm">
        <Link href="/" className="menu-link text-dark/50 hover:text-dark">
          Главная
        </Link>
        <span className="mx-2 text-dark/30">/</span>
        <span className="font-bold">Оформление заказа</span>
      </nav>

      <h1 className="mb-12 font-display text-5xl font-extrabold uppercase lg:text-6xl">
        Checkout
      </h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Ошибка от Server Action */}
          {serverError && (
            <div className="rounded-2xl border-2 border-red-500 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
              {serverError}
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field
              label="Имя"
              error={errors.firstName?.message}
            >
              <input
                {...register("firstName")}
                placeholder="Иван"
                className={inputBase}
              />
            </Field>
            <Field
              label="Фамилия"
              error={errors.lastName?.message}
            >
              <input
                {...register("lastName")}
                placeholder="Иванов"
                className={inputBase}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Email" error={errors.email?.message}>
              <input
                {...register("email")}
                type="email"
                placeholder="ivan@mail.ru"
                className={inputBase}
              />
            </Field>
            <Field label="Телефон" error={errors.phone?.message}>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+7 999 123 45 67"
                className={inputBase}
              />
            </Field>
          </div>

          <Field label="Адрес" error={errors.address?.message}>
            <input
              {...register("address")}
              placeholder="ул. Пушкина, д. 10, кв. 5"
              className={inputBase}
            />
          </Field>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Город" error={errors.city?.message}>
              <input
                {...register("city")}
                placeholder="Москва"
                className={inputBase}
              />
            </Field>
            <Field
              label="Индекс"
              error={errors.postalCode?.message}
            >
              <input
                {...register("postalCode")}
                placeholder="101000"
                className={inputBase}
              />
            </Field>
          </div>

          <Field label="Комментарий (необязательно)">
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="Особые пожелания..."
              className={inputBase + " resize-none"}
            />
          </Field>

          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Оформляем..." : "Подтвердить заказ"}
          </Button>
        </form>

        {/* Order Summary */}
        <div className="h-fit rounded-[var(--radius-apple)] border-2 border-dark bg-white p-6">
          <h3 className="mb-6 font-display text-xl font-extrabold uppercase">
            Ваш заказ
          </h3>

          <div className="space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.variantId}
                  layout
                  className="flex items-center gap-4"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 border-dark">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-dark/5">
                        <span className="text-[10px] text-dark/30">Нет фото</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-dark/50">
                      {item.quantity} кор. × {formatPrice(item.boxPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-bold">
                    {formatPrice(item.boxPrice * item.quantity)}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-6 border-t-2 border-dark pt-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-extrabold uppercase">
                Итого
              </span>
              <span className="font-display text-2xl font-extrabold">
                {formatPrice(totalPrice())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Inline Field wrapper ---- */
interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase text-dark/60">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs font-bold text-red-500">{error}</p>
      )}
    </div>
  );
}
