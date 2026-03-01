"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";

// ─── Types ───────────────────────────────

interface PostInput {
  id?: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  isPublished: boolean;
}

// ─── upsertPost Server Action ────────────

export async function upsertPost(data: PostInput) {
  if (!data.title || !data.slug) {
    return { error: "Заголовок и slug обязательны" };
  }

  // Уникальность slug
  const existingSlug = await prisma.post.findFirst({
    where: {
      slug: data.slug,
      ...(data.id ? { NOT: { id: data.id } } : {}),
    },
  });
  if (existingSlug) {
    return { error: `Slug "${data.slug}" уже занят` };
  }

  try {
    const publishedAt = data.isPublished ? new Date() : null;

    if (data.id) {
      // При обновлении: если уже опубликован — не трогаем publishedAt
      const existing = await prisma.post.findUnique({ where: { id: data.id } });
      const finalPublishedAt = data.isPublished
        ? existing?.publishedAt ?? new Date()
        : null;

      await prisma.post.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          imageUrl: data.imageUrl || null,
          publishedAt: finalPublishedAt,
        },
      });
    } else {
      await prisma.post.create({
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          imageUrl: data.imageUrl || null,
          publishedAt,
        },
      });
    }

    revalidatePath("/admin/blog");
    redirect("/admin/blog");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("upsertPost error:", error);
    return { error: "Не удалось сохранить статью" };
  }
}

// ─── deletePost Server Action ────────────

export async function deletePost(id: string) {
  try {
    await prisma.post.delete({ where: { id } });
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error) {
    console.error("deletePost error:", error);
    return { error: "Не удалось удалить статью" };
  }
}
