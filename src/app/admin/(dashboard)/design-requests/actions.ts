"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function markDesignRequestRead(id: string) {
  try {
    await prisma.designRequest.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/admin/design-requests");
    return { success: true };
  } catch (error) {
    console.error("markDesignRequestRead error:", error);
    return { error: "Не удалось обновить статус" };
  }
}

export async function deleteDesignRequest(id: string) {
  try {
    await prisma.designRequest.delete({ where: { id } });
    revalidatePath("/admin/design-requests");
    return { success: true };
  } catch (error) {
    console.error("deleteDesignRequest error:", error);
    return { error: "Не удалось удалить заявку" };
  }
}
