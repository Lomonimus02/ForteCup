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
  const [settings, categories, products] = await Promise.all([
    getSiteSettings(),
    prisma.category.findMany({
      where: { parentId: null },
      take: 4,
      select: { id: true, name: true, slug: true, imageUrl: true },
    }),
    prisma.product.findMany({
      where: { isDraft: false, isPopular: true },
      include: { variants: true, category: true },
      take: 8,
    }),
  ]);

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
