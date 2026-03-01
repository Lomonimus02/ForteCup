"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// ─── Create Category ─────────────────────

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const parentId = (formData.get("parentId") as string) || null;
  const imageUrl = (formData.get("imageUrl") as string) || null;

  if (!name || !slug) {
    return { error: "Название и slug обязательны" };
  }

  // Проверяем уникальность slug
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return { error: `Slug "${slug}" уже занят` };
  }

  await prisma.category.create({
    data: { name, slug, parentId, imageUrl },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

// ─── Update Category ─────────────────────

export async function updateCategory(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const parentId = (formData.get("parentId") as string) || null;
  const imageUrl = (formData.get("imageUrl") as string) || null;

  if (!id || !name || !slug) {
    return { error: "id, название и slug обязательны" };
  }

  // Проверяем уникальность slug (исключая саму запись)
  const existing = await prisma.category.findFirst({
    where: { slug, NOT: { id } },
  });
  if (existing) {
    return { error: `Slug "${slug}" уже занят` };
  }

  // Нельзя сделать категорию дочерней самой себе
  if (parentId === id) {
    return { error: "Категория не может быть родителем самой себе" };
  }

  await prisma.category.update({
    where: { id },
    data: { name, slug, parentId, imageUrl },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

// ─── Delete Category ─────────────────────

export async function deleteCategory(id: string) {
  // Проверяем, есть ли товары в категории
  const productsCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productsCount > 0) {
    return { error: `Нельзя удалить: в категории ${productsCount} товар(ов)` };
  }

  // Проверяем, есть ли дочерние категории
  const childrenCount = await prisma.category.count({
    where: { parentId: id },
  });

  if (childrenCount > 0) {
    return { error: `Нельзя удалить: есть ${childrenCount} подкатегори(й)` };
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categories");
  return { success: true };
}
