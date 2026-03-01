"use server";

import { prisma } from "@/lib/prisma";

interface DesignRequestInput {
  name: string;
  phone: string;
  quantity: string;
  comment: string;
}

export async function submitDesignRequest(data: DesignRequestInput) {
  if (!data.name || !data.phone) {
    return { error: "Имя и телефон обязательны" };
  }

  try {
    await prisma.designRequest.create({
      data: {
        name: data.name,
        phone: data.phone,
        quantity: data.quantity || null,
        comment: data.comment || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("submitDesignRequest error:", error);
    return { error: "Не удалось отправить заявку" };
  }
}
