import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { sku: "asc" } },
    },
  });

  if (!product) notFound();

  const categories = await prisma.category.findMany({
    include: { parent: true },
    orderBy: { name: "asc" },
  });

  // Serialize Decimal → number
  const serializedProduct = {
    ...product,
    variants: product.variants.map((v) => ({
      ...v,
      pricePerPiece: Number(v.pricePerPiece),
      piecesPerBox: v.piecesPerBox,
      boxPrice: Number(v.boxPrice),
    })),
  };

  const categoryOptions = categories.map((c) => ({
    id: c.id,
    name: c.name,
    parentName: c.parent?.name ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-white transition mb-3"
        >
          <ChevronLeft size={14} />
          Назад к товарам
        </Link>
        <h1 className="text-2xl font-bold font-display tracking-tight">
          {product.name}
        </h1>
        <p className="text-neutral-500 text-sm mt-1">Редактирование товара</p>
      </div>

      <ProductForm product={serializedProduct} categories={categoryOptions} />
    </div>
  );
}
