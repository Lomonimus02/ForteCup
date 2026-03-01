import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "./ProductDetailClient";
import type { SerializedProduct } from "@/types";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { OR: [{ slug: id }, { id }] },
    select: { name: true, description: true, imageBaseUrl: true },
  });

  if (!product) return { title: "Товар не найден" };

  return {
    title: `${product.name} | FORTE CUP`,
    description: product.description ?? undefined,
    openGraph: {
      title: `${product.name} | FORTE CUP`,
      description: product.description ?? undefined,
      images: product.imageBaseUrl ? [product.imageBaseUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { OR: [{ slug: id }, { id }], isDraft: false },
    include: { variants: true, category: true },
  });

  if (!product) notFound();

  const serialized: SerializedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    imageBaseUrl: product.imageBaseUrl,
    isPopular: product.isPopular,
    isDraft: product.isDraft,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      volume: v.volume,
      colorOrDesign: v.colorOrDesign,
      pricePerPiece: Number(v.pricePerPiece),
      piecesPerBox: v.piecesPerBox,
      boxPrice: Number(v.boxPrice),
      inStock: v.inStock,
    })),
  };

  return <ProductDetailClient product={serialized} />;
}
