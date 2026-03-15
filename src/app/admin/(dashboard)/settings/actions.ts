"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SETTINGS_KEYS } from "./constants";
import { deleteUploadedFile } from "@/app/admin/upload-action";

// ─── getSettings ─────────────────────────

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSettings.findMany();
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

// ─── updateSettings Server Action ────────

export async function updateSettings(
  data: Record<string, string>
): Promise<{ success?: boolean; error?: string }> {
  try {
    // Delete old image if heroImageUrl changed
    const oldHero = await prisma.siteSettings.findUnique({ where: { key: "heroImageUrl" } });
    if (oldHero?.value && data.heroImageUrl !== oldHero.value) {
      await deleteUploadedFile(oldHero.value);
    }

    // Upsert каждого ключа в транзакции
    await prisma.$transaction(
      SETTINGS_KEYS.map((key) =>
        prisma.siteSettings.upsert({
          where: { key },
          create: { key, value: data[key] ?? "" },
          update: { value: data[key] ?? "" },
        })
      )
    );

    revalidatePath("/admin/settings");
    revalidatePath("/"); // Главная страница тоже зависит от настроек
    return { success: true };
  } catch (error) {
    console.error("updateSettings error:", error);
    return { error: "Не удалось сохранить настройки" };
  }
}
