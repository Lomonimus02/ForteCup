// =========================================
// /app/catalog — Server Component
// =========================================
//
// Эта страница — полноценный React Server Component.
// Она читает URL Search Params (?volume=250ml&category=double-wall) и
// динамически строит `where` для Prisma, реализуя серверную фильтрацию.
//
// Преимущества:
//  - Данные загружаются на сервере, без водопада клиентских запросов
//  - SEO-friendly: контент доступен краулерам
//  - Фильтры в URL → можно делиться ссылкой с примененными фильтрами
// =========================================

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CatalogClient } from "./CatalogClient";

export const metadata: Metadata = {
  title: "Каталог",
  description:
    "Полный каталог продукции FORTE CUP — стаканы, крышки, аксессуары.",
};

// Next.js 15 передаёт searchParams как Promise
interface CatalogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  // Дожидаемся searchParams (Next.js 15 async API)
  const params = await searchParams;

  // ──────────────────────────────────────────────
  // 1. Извлекаем фильтры из URL Search Params
  // ──────────────────────────────────────────────
  const categorySlug =
    typeof params.category === "string" ? params.category : undefined;
  const volume =
    typeof params.volume === "string" ? params.volume : undefined;
  const minPrice =
    typeof params.minPrice === "string"
      ? parseFloat(params.minPrice)
      : undefined;
  const maxPrice =
    typeof params.maxPrice === "string"
      ? parseFloat(params.maxPrice)
      : undefined;
  const inStockOnly = params.inStock === "true";
  const search =
    typeof params.q === "string" ? params.q.trim() : undefined;
  const sort =
    typeof params.sort === "string" ? params.sort : "default";

  // ──────────────────────────────────────────────
  // 2. Динамически строим WHERE для Prisma
  // ──────────────────────────────────────────────
  //
  // Вместо мутации объекта where, собираем массив AND-условий.
  // Prisma объединит их через SQL AND. Это чище и типобезопаснее.
  //
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const andConditions: Record<string, any>[] = [];

  // Фильтр по категории: ищем по slug связанной категории
  if (categorySlug) {
    andConditions.push({ category: { slug: categorySlug } });
  }

  // Фильтр по объёму: проверяем, есть ли у товара вариант с нужным volume
  // `some` — хотя бы один вариант должен удовлетворять условию
  if (volume) {
    andConditions.push({
      variants: { some: { volume } },
    });
  }

  // Фильтр по цене коробки: ищем товары, у которых есть вариант в заданном диапазоне
  if (minPrice !== undefined || maxPrice !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const priceCondition: Record<string, any> = {};
    if (minPrice !== undefined) priceCondition.gte = minPrice;
    if (maxPrice !== undefined) priceCondition.lte = maxPrice;

    andConditions.push({
      variants: { some: { boxPrice: priceCondition } },
    });
  }

  // Фильтр «только в наличии»: хотя бы один вариант с inStock = true
  if (inStockOnly) {
    andConditions.push({
      variants: { some: { inStock: true } },
    });
  }

  // Полнотекстовый поиск по названию / описанию (case-insensitive)
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  // Итоговый where: если есть условия — AND, иначе пустой объект
  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  // ──────────────────────────────────────────────
  // 3. Определяем сортировку
  // ──────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: Record<string, any> = { createdAt: "desc" };
  switch (sort) {
    case "name":
      orderBy = { name: "asc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    // Сортировка по цене требует orderBy на уровне variants.
    // Для простоты: сервер сортирует по дате, клиент досортирует по цене.
    case "price-asc":
    case "price-desc":
      orderBy = { createdAt: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  // ──────────────────────────────────────────────
  // 4. Выполняем запрос к БД с include (eager loading)
  // ──────────────────────────────────────────────
  // include подгружает связанные модели в одном SQL-запросе (LEFT JOIN).
  // Это избегает проблемы N+1 запросов.
  const [products, categories, allVolumes, visualCategories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true, // Подгружаем категорию для отображения бейджа
        variants: true, // Подгружаем все варианты для отображения цен
      },
    }),

    // Загружаем все категории для панели фильтров
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),

    // Собираем уникальные значения volume для фасетного фильтра
    // Prisma не поддерживает DISTINCT на связанных полях напрямую,
    // поэтому используем findMany + distinct на ProductVariant
    prisma.productVariant.findMany({
      where: { volume: { not: null } },
      distinct: ["volume"],
      select: { volume: true },
      orderBy: { volume: "asc" },
    }),

    // Корневые категории с изображениями для визуальных карточек
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { id: "asc" },
      select: { id: true, name: true, slug: true, imageUrl: true },
    }),
  ]);

  // Извлекаем список уникальных объёмов (для фасетных фильтров)
  const volumeOptions = allVolumes
    .map((v) => v.volume)
    .filter((v): v is string => v !== null);

  // Считаем диапазон цен коробок для ползунка
  const allPrices = products.flatMap((p) =>
    p.variants.map((v) => Number(v.boxPrice))
  );
  const priceRange: [number, number] =
    allPrices.length > 0
      ? [Math.min(...allPrices), Math.max(...allPrices)]
      : [0, 10000];

  // ──────────────────────────────────────────────
  // 5. Сериализуем данные для Client Component
  // ──────────────────────────────────────────────
  // Prisma Decimal несовместим с JSON-сериализацией React Server Components.
  // Преобразуем Decimal → number перед передачей клиенту.
  const serializedProducts = products.map((product) => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    variants: product.variants.map((variant) => ({
      ...variant,
      pricePerPiece: Number(variant.pricePerPiece),
      boxPrice: Number(variant.boxPrice),
    })),
  }));

  // Текущие активные фильтры (для отображения бейджей на клиенте)
  const activeFilters = {
    category: categorySlug,
    volume,
    minPrice,
    maxPrice,
    inStock: inStockOnly,
    search,
    sort,
  };

  return (
    <CatalogClient
      products={serializedProducts}
      categories={categories}
      visualCategories={visualCategories}
      volumeOptions={volumeOptions}
      priceRange={priceRange}
      activeFilters={activeFilters}
      totalCount={products.length}
    />
  );
}
