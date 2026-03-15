"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";
import { deleteUploadedFile } from "@/app/admin/upload-action";

// ─── Types ───────────────────────────────

interface PortfolioInput {
  id?: string;
  clientName: string;
  description: string;
  imageUrl: string;
  isPublished: boolean;
}

// ─── upsertPortfolioWork Server Action ───

export async function upsertPortfolioWork(data: PortfolioInput) {
  if (!data.clientName) {
    return { error: "Название клиента обязательно" };
  }

  try {
    if (data.id) {
      const existing = await prisma.portfolio.findUnique({ where: { id: data.id } });
      if (existing?.imageUrl && existing.imageUrl !== data.imageUrl) {
        await deleteUploadedFile(existing.imageUrl);
      }

      await prisma.portfolio.update({
        where: { id: data.id },
        data: {
          clientName: data.clientName,
          description: data.description || null,
          imageUrl: data.imageUrl || null,
          isPublished: data.isPublished,
        },
      });
    } else {
      await prisma.portfolio.create({
        data: {
          clientName: data.clientName,
          description: data.description || null,
          imageUrl: data.imageUrl || null,
          isPublished: data.isPublished,
        },
      });
    }

    revalidatePath("/admin/portfolio");
    redirect("/admin/portfolio");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("upsertPortfolioWork error:", error);
    return { error: "Не удалось сохранить работу" };
  }
}

// ─── deletePortfolioWork Server Action ───

export async function deletePortfolioWork(id: string) {
  try {
    const existing = await prisma.portfolio.findUnique({ where: { id } });
    if (existing?.imageUrl) await deleteUploadedFile(existing.imageUrl);

    await prisma.portfolio.delete({ where: { id } });
    revalidatePath("/admin/portfolio");
    return { success: true };
  } catch (error) {
    console.error("deletePortfolioWork error:", error);
    return { error: "Не удалось удалить работу" };
  }
}
