import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./CategoriesClient";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      parent: true,
      children: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  // Сериализуем для клиента
  const serialized = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
    parentId: c.parentId,
    parentName: c.parent?.name ?? null,
    childrenCount: c.children.length,
    productsCount: c._count.products,
  }));

  return <CategoriesClient categories={serialized} />;
}
