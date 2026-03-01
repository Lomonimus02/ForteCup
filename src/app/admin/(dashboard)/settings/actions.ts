"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SETTINGS_KEYS } from "./constants";

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
