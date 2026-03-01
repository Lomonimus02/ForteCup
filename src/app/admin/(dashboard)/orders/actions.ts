"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

// ─── updateOrderStatus Server Action ─────

export async function updateOrderStatus(orderId: string, newStatus: string) {
  // Валидация статуса
  const validStatuses: OrderStatus[] = [
    "PENDING",
    "PAID",
    "ASSEMBLED",
    "SHIPPED",
    "CANCELLED",
  ];

  if (!validStatuses.includes(newStatus as OrderStatus)) {
    return { error: `Недопустимый статус: ${newStatus}` };
  }

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return { error: "Заказ не найден" };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as OrderStatus },
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return { error: "Не удалось обновить статус заказа" };
  }
}

// ─── updateOrderNotes Server Action ──────

export async function updateOrderNotes(orderId: string, notes: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { notes },
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("updateOrderNotes error:", error);
    return { error: "Не удалось обновить заметку" };
  }
}
