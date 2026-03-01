"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";

// ─── Types ───────────────────────────────

interface PageInput {
  id?: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
}

// ─── upsertPage Server Action ────────────

export async function upsertPage(data: PageInput) {
  if (!data.title || !data.slug) {
    return { error: "Заголовок и slug обязательны" };
  }

  const existingSlug = await prisma.page.findFirst({
    where: {
      slug: data.slug,
      ...(data.id ? { NOT: { id: data.id } } : {}),
    },
  });
  if (existingSlug) {
    return { error: `Slug "${data.slug}" уже занят` };
  }

  try {
    if (data.id) {
      await prisma.page.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          isPublished: data.isPublished,
        },
      });
    } else {
      await prisma.page.create({
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          isPublished: data.isPublished,
        },
      });
    }

    revalidatePath("/admin/pages");
    revalidatePath(`/${data.slug}`);
    redirect("/admin/pages");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("upsertPage error:", error);
    return { error: "Не удалось сохранить страницу" };
  }
}

// ─── deletePage Server Action ────────────

export async function deletePage(id: string) {
  try {
    await prisma.page.delete({ where: { id } });
    revalidatePath("/admin/pages");
    return { success: true };
  } catch (error) {
    console.error("deletePage error:", error);
    return { error: "Не удалось удалить страницу" };
  }
}
