// =========================================
// Server Action: createOrder
// =========================================
//
// Server Actions — это функции, помеченные "use server", которые
// выполняются ТОЛЬКО на сервере, но могут вызываться из клиентских компонентов.
//
// Этот экшен:
//  1. Принимает данные формы + товары из Zustand-корзины
//  2. Валидирует входные данные через Zod
//  3. Создаёт Order + OrderItem[] в одной транзакции ($transaction)
//  4. Возвращает ID созданного заказа
//
// Транзакция гарантирует, что либо все записи создаются,
// либо ни одна — нет «зависших» заказов без позиций.
// =========================================

"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

// ─── Zod-схема для валидации на сервере ──────────────
// Мы НЕ доверяем клиентским данным — повторная валидация обязательна.
const orderSchema = z.object({
  firstName: z.string().min(2, "Минимум 2 символа"),
  lastName: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  phone: z.string().min(10, "Введите корректный телефон"),
  address: z.string().min(5, "Введите полный адрес"),
  city: z.string().min(2, "Введите город"),
  postalCode: z.string().min(5, "Введите индекс"),
  notes: z.string().optional(),
});

// Элемент корзины, приходящий от клиента
const cartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(), // Цена, которую видел клиент
});

// ─── Типы ответа ─────────────────────────────────────

interface CreateOrderSuccess {
  success: true;
  orderId: string;
}

interface CreateOrderError {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
}

type CreateOrderResult = CreateOrderSuccess | CreateOrderError;

// ─── Server Action ───────────────────────────────────

export async function createOrder(
  formData: FormData,
  cartItems: { variantId: string; quantity: number; price: number }[]
): Promise<CreateOrderResult> {
  try {
    // ── 1. Извлекаем и валидируем данные формы ──

    const rawForm = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      city: formData.get("city"),
      postalCode: formData.get("postalCode"),
      notes: formData.get("notes") || undefined,
    };

    const formResult = orderSchema.safeParse(rawForm);
    if (!formResult.success) {
      return {
        success: false,
        error: "Ошибка валидации формы",
        fieldErrors: formResult.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // ── 2. Валидируем элементы корзины ──

    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "Корзина пуста" };
    }

    const parsedItems = z.array(cartItemSchema).safeParse(cartItems);
    if (!parsedItems.success) {
      return { success: false, error: "Некорректные данные корзины" };
    }

    const validItems = parsedItems.data;
    const form = formResult.data;

    // ── 3. Проверяем варианты в БД и актуальные цены ──
    // Это защита от манипуляции ценами на клиенте

    const variantIds = validItems.map((item) => item.variantId);

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    // Проверяем, что все variantId существуют
    if (variants.length !== variantIds.length) {
      const found = new Set(variants.map((v) => v.id));
      const missing = variantIds.filter((id) => !found.has(id));
      return {
        success: false,
        error: `Товары не найдены: ${missing.join(", ")}`,
      };
    }

    // Создаём Map для быстрого доступа
    const variantMap = new Map(
      variants.map((v) => [v.id, v] as const)
    );

    // Проверяем наличие на складе
    for (const item of validItems) {
      const variant = variantMap.get(item.variantId);
      if (!variant) continue;
      if (!variant.inStock) {
        return {
          success: false,
          error: `Товар «${variant.product.name}» (${variant.volume ?? ""} ${variant.colorOrDesign ?? ""}). Нет в наличии`,
        };
      }
    }

    // ── 4. Вычисляем итоговую сумму по СЕРВЕРНЫМ ценам ──
    // Используем цены из БД, а не от клиента — это критически важно для безопасности

    // Используем B2B цены коробок из БД

    const totalAmount = validItems.reduce((sum, item) => {
      const variant = variantMap.get(item.variantId);
      if (!variant) return sum;
      return sum + Number(variant.boxPrice) * item.quantity;
    }, 0);

    // ── 5. Создаём заказ в транзакции ──
    // prisma.$transaction гарантирует атомарность:
    // - Создание Order
    // - Создание всех OrderItem
    // Если любая операция упадёт — всё откатится (ROLLBACK)

    const order = await prisma.$transaction(async (tx) => {
      // Создаём заказ с вложенными позициями (nested create)
      const newOrder = await tx.order.create({
        data: {
          customerName: `${form.firstName} ${form.lastName}`,
          customerEmail: form.email,
          customerPhone: form.phone,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          notes: form.notes ?? null,
          totalAmount,
          status: "PENDING",
          items: {
            create: validItems.map((item) => {
              const variant = variantMap.get(item.variantId)!;
              return {
                variantId: item.variantId,
                productId: variant.productId,
                quantity: item.quantity,
                // Сохраняем snapshot B2B цены коробки на момент покупки
                priceAtPurchase: Number(variant.boxPrice),
              };
            }),
          },
        },
      });

      // Отмечаем варианты как недоступные, если нужно (inStock = false)
      // При необходимости менеджер может вручную снять с продажи в админке

      return newOrder;
    });

    return {
      success: true,
      orderId: order.id,
    };
  } catch (error) {
    console.error("[createOrder] Ошибка:", error);
    return {
      success: false,
      error: "Внутренняя ошибка сервера. Попробуйте позже.",
    };
  }
}
