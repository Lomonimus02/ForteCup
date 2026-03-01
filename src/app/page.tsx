import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { SETTINGS_FALLBACKS } from "@/data/constants";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { BentoCategories } from "@/components/sections/BentoCategories";
import { ProductGrid } from "@/components/sections/ProductGrid";
import type { SerializedProduct } from "@/types";

export default async function HomePage() {
  // ── Parallel data fetching ──
  const [settings, allRootCategories, products] = await Promise.all([
    getSiteSettings(),
    prisma.category.findMany({
      where: { parentId: null },
      select: { id: true, name: true, slug: true, imageUrl: true },
    }),
    prisma.product.findMany({
      where: { isDraft: false, isPopular: true },
      include: { variants: true, category: true },
      take: 8,
    }),
  ]);

  // ── Resolve homepage categories (admin-picked or fallback first 4) ──
  let homepageCatIds: string[] = [];
  try {
    const raw = settings.homepageCategoryIds;
    if (raw) homepageCatIds = JSON.parse(raw) as string[];
  } catch { /* ignore */ }

  let categories: typeof allRootCategories;
  if (homepageCatIds.length > 0) {
    // Keep admin-defined order
    const catMap = new Map(allRootCategories.map((c) => [c.id, c]));
    categories = homepageCatIds
      .map((id) => catMap.get(id))
      .filter((c): c is NonNullable<typeof c> => c != null);
  } else {
    categories = allRootCategories.slice(0, 4);
  }

  // ── Settings with fallbacks ──
  const heroTitle = settings.heroTitle ?? SETTINGS_FALLBACKS.heroTitle;
  const heroSubtitle = settings.heroSubtitle ?? SETTINGS_FALLBACKS.heroSubtitle;
  const heroImageUrl = settings.heroImageUrl || SETTINGS_FALLBACKS.heroImageUrl || undefined;
  const marqueeText = settings.marqueeText ?? SETTINGS_FALLBACKS.marqueeText;

  // ── Serialize categories ──
  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
  }));

  // ── Serialize products (Decimal → number) ──
  const serializedProducts: SerializedProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    imageBaseUrl: p.imageBaseUrl,
    isPopular: p.isPopular,
    isDraft: p.isDraft,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      volume: v.volume,
      colorOrDesign: v.colorOrDesign,
      pricePerPiece: Number(v.pricePerPiece),
      piecesPerBox: v.piecesPerBox,
      boxPrice: Number(v.boxPrice),
      inStock: v.inStock,
    })),
  }));

  return (
    <>
      <Hero title={heroTitle} subtitle={heroSubtitle} imageUrl={heroImageUrl} />
      <Marquee text={marqueeText} />
      <BentoCategories categories={serializedCategories} />
      <ProductGrid products={serializedProducts} />
    </>
  );
}
