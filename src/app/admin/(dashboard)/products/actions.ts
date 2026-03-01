"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";

// ─── Types for the form payload ──────────

interface VariantInput {
  id?: string; // undefined = new variant
  sku: string;
  volume: string;
  colorOrDesign: string;
  pricePerPiece: number;
  piecesPerBox: number;
  boxPrice: number;
  inStock: boolean;
}

interface ProductInput {
  id?: string; // undefined = create, string = update
  name: string;
  slug: string;
  description: string;
  imageBaseUrl: string;
  categoryId: string;
  isDraft: boolean;
  isPopular: boolean;
  variants: VariantInput[];
}

// ─── upsertProduct Server Action ─────────

export async function upsertProduct(data: ProductInput) {
  // Валидация
  if (!data.name || !data.slug || !data.categoryId) {
    return { error: "Название, slug и категория обязательны" };
  }

  // Проверяем уникальность slug
  const existingSlug = await prisma.product.findFirst({
    where: {
      slug: data.slug,
      ...(data.id ? { NOT: { id: data.id } } : {}),
    },
  });
  if (existingSlug) {
    return { error: `Slug "${data.slug}" уже занят` };
  }

  // Проверяем уникальность SKU
  const skus = data.variants.map((v) => v.sku);
  const duplicateSku = skus.find((s, i) => skus.indexOf(s) !== i);
  if (duplicateSku) {
    return { error: `Дублирующийся артикул: ${duplicateSku}` };
  }

  // Проверяем SKU в БД (кроме вариантов текущего продукта)
  for (const variant of data.variants) {
    const existingSku = await prisma.productVariant.findFirst({
      where: {
        sku: variant.sku,
        ...(data.id ? { NOT: { productId: data.id } } : {}),
      },
    });
    if (existingSku) {
      return { error: `Артикул "${variant.sku}" уже используется другим товаром` };
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Upsert product
      const product = data.id
        ? await tx.product.update({
            where: { id: data.id },
            data: {
              name: data.name,
              slug: data.slug,
              description: data.description || null,
              imageBaseUrl: data.imageBaseUrl || null,
              categoryId: data.categoryId,
              isDraft: data.isDraft,
              isPopular: data.isPopular,
            },
          })
        : await tx.product.create({
            data: {
              name: data.name,
              slug: data.slug,
              description: data.description || null,
              imageBaseUrl: data.imageBaseUrl || null,
              categoryId: data.categoryId,
              isDraft: data.isDraft,
              isPopular: data.isPopular,
            },
          });

      // 2. Delete all existing variants and recreate
      // Это проще чем diff, и для B2B каталога это нормально
      if (data.id) {
        await tx.productVariant.deleteMany({
          where: { productId: product.id },
        });
      }

      // 3. Create all variants
      if (data.variants.length > 0) {
        await tx.productVariant.createMany({
          data: data.variants.map((v) => ({
            productId: product.id,
            sku: v.sku,
            volume: v.volume || null,
            colorOrDesign: v.colorOrDesign || null,
            pricePerPiece: v.pricePerPiece,
            piecesPerBox: v.piecesPerBox,
            boxPrice: v.boxPrice,
            inStock: v.inStock,
          })),
        });
      }

      return product;
    });

    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    redirect(`/admin/products/${result.id}`);
  } catch (error) {
    // redirect() throws a special error — re-throw it
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("[upsertProduct]", error);
    return { error: "Ошибка сохранения. Проверьте данные." };
  }
}

// ─── deleteProduct Server Action ─────────

export async function deleteProduct(id: string) {
  // Проверяем, нет ли заказов с товарами этого продукта
  const orderItemsCount = await prisma.orderItem.count({
    where: { productId: id },
  });

  if (orderItemsCount > 0) {
    return { error: `Нельзя удалить: товар присутствует в ${orderItemsCount} позици(ях) заказов` };
  }

  await prisma.product.delete({ where: { id } });

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  redirect("/admin/products");
}
