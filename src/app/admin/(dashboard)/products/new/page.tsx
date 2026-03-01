import { prisma } from "@/lib/prisma";
import ProductForm from "../ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function AdminProductNewPage() {
  const categories = await prisma.category.findMany({
    include: { parent: true },
    orderBy: { name: "asc" },
  });

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
          Новый товар
        </h1>
        <p className="text-neutral-500 text-sm mt-1">Создание нового товара</p>
      </div>

      <ProductForm categories={categoryOptions} />
    </div>
  );
}
