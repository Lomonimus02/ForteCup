// =========================================
// CatalogClient — клиентская часть каталога
// =========================================
//
// Получает уже отфильтрованные данные из Server Component.
// Управляет UI-состоянием фильтров и обновляет URL Search Params
// через useRouter().push() — это триггерит re-fetch на сервере.
//
// Паттерн: «URL as state» — состояние фильтров живёт в URL,
// а не в useState. Это даёт:
//  - Shareable URLs с фильтрами
//  - Browser back/forward работает с фильтрами
//  - SSR-friendly
// =========================================

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { VisualCategories } from "@/components/catalog/VisualCategories";
import toast from "react-hot-toast";

// ─── Типы (из Prisma-сгенерированных, но сериализованные) ───

interface SerializedVariant {
  id: string;
  sku: string;
  volume: string | null;
  colorOrDesign: string | null;
  pricePerPiece: number;
  piecesPerBox: number;
  boxPrice: number;
  inStock: boolean;
  productId: string;
}

interface SerializedCategory {
  id: string;
  name: string;
  slug: string;
}

interface VisualCategoryData {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

interface SerializedProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageBaseUrl: string | null;
  isPopular: boolean;
  categoryId: string;
  category: SerializedCategory;
  variants: SerializedVariant[];
  createdAt: string;
  updatedAt: string;
}

interface ActiveFilters {
  category?: string;
  volume?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  search?: string;
  sort: string;
}

interface CatalogClientProps {
  products: SerializedProduct[];
  categories: SerializedCategory[];
  visualCategories: VisualCategoryData[];
  volumeOptions: string[];
  priceRange: [number, number];
  activeFilters: ActiveFilters;
  totalCount: number;
}

type SortOption = "default" | "price-asc" | "price-desc" | "name" | "newest";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "По умолчанию" },
  { value: "price-asc", label: "Цена ↑" },
  { value: "price-desc", label: "Цена ↓" },
  { value: "name", label: "По названию" },
  { value: "newest", label: "Новинки" },
];

function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border-2 border-dark bg-white px-5 py-2.5 text-xs font-bold uppercase transition-colors hover:border-accent"
      >
        {current.label}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden border-2 border-dark bg-white/95 backdrop-blur-xl"
            style={{ borderRadius: "var(--radius-apple)" }}
          >
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-5 py-3 text-left text-xs font-bold uppercase tracking-wide transition-colors hover:bg-accent hover:text-dark",
                  option.value === value
                    ? "bg-accent/20 text-dark"
                    : "text-dark/70"
                )}
              >
                {option.value === value && (
                  <span className="h-1.5 w-1.5 rounded-full bg-dark" />
                )}
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CatalogClient({
  products,
  categories,
  visualCategories,
  volumeOptions,
  priceRange,
  activeFilters,
  totalCount,
}: CatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ──────────────────────────────────────────────
  // Функция обновления URL Search Params
  // ──────────────────────────────────────────────
  // При изменении фильтра мы обновляем URL, что вызывает
  // re-render Server Component с новыми searchParams → новый запрос к БД
  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Сбросить все фильтры
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  // Клиентская до-сортировка по цене (серверная сортировка по цене вариантов сложна)
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (activeFilters.sort === "price-asc") {
      list.sort((a, b) => {
        const aMin = Math.min(...a.variants.map((v) => v.boxPrice));
        const bMin = Math.min(...b.variants.map((v) => v.boxPrice));
        return aMin - bMin;
      });
    } else if (activeFilters.sort === "price-desc") {
      list.sort((a, b) => {
        const aMin = Math.min(...a.variants.map((v) => v.boxPrice));
        const bMin = Math.min(...b.variants.map((v) => v.boxPrice));
        return bMin - aMin;
      });
    }
    return list;
  }, [products, activeFilters.sort]);

  const hasActiveFilters =
    activeFilters.category ||
    activeFilters.volume ||
    activeFilters.minPrice !== undefined ||
    activeFilters.maxPrice !== undefined ||
    activeFilters.inStock ||
    activeFilters.search;

  // ── Ползунок цены: локальное состояние + debounce ──
  const priceStep = Math.max(50, Math.round((priceRange[1] - priceRange[0]) / 50 / 50) * 50) || 50;
  const [localMaxPrice, setLocalMaxPrice] = useState(
    activeFilters.maxPrice ?? priceRange[1]
  );
  const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePriceChange = useCallback(
    (val: number) => {
      setLocalMaxPrice(val);
      if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
      priceTimerRef.current = setTimeout(() => {
        updateFilter("maxPrice", val >= priceRange[1] ? undefined : String(val));
      }, 400);
    },
    [updateFilter, priceRange]
  );

  // Синхронизация при изменении серверных фильтров
  useEffect(() => {
    setLocalMaxPrice(activeFilters.maxPrice ?? priceRange[1]);
  }, [activeFilters.maxPrice, priceRange]);

  // ──────────────────────────────────────────────
  // Панель фильтров (переиспользуется для desktop и mobile)
  // ──────────────────────────────────────────────
  const filterContent = (
    <>
      {/* Поиск */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-dark/50">
          Поиск
        </h3>
        <input
          type="text"
          defaultValue={activeFilters.search ?? ""}
          placeholder="Название товара..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateFilter("q", (e.target as HTMLInputElement).value || undefined);
            }
          }}
          className="w-full rounded-2xl border-2 border-dark/15 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-dark"
        />
      </div>

      {/* Категории */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-dark/50">
          Категории
        </h3>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => updateFilter("category", undefined)}
            className={cn(
              "flex items-center justify-between rounded-2xl border-2 px-4 py-2.5 text-left text-sm font-bold uppercase transition-all",
              !activeFilters.category
                ? "border-dark bg-dark text-accent"
                : "border-dark/15 bg-white hover:border-dark"
            )}
          >
            Все товары
            <span className="text-xs font-medium opacity-60">{totalCount}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                updateFilter(
                  "category",
                  activeFilters.category === cat.slug ? undefined : cat.slug
                )
              }
              className={cn(
                "flex items-center justify-between rounded-2xl border-2 px-4 py-2.5 text-left text-sm font-bold uppercase transition-all",
                activeFilters.category === cat.slug
                  ? "border-dark bg-dark text-accent"
                  : "border-dark/15 bg-white hover:border-dark"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Объём (фасетный фильтр) */}
      {volumeOptions.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-dark/50">
            Объём
          </h3>
          <div className="flex flex-wrap gap-2">
            {volumeOptions.map((vol) => (
              <button
                key={vol}
                onClick={() =>
                  updateFilter(
                    "volume",
                    activeFilters.volume === vol ? undefined : vol
                  )
                }
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-bold uppercase transition-all",
                  activeFilters.volume === vol
                    ? "border-dark bg-accent text-dark"
                    : "border-dark/20 bg-white text-dark/60 hover:border-dark hover:text-dark"
                )}
              >
                {vol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Цена */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-dark/50">
          Цена до{" "}
          {formatPrice(localMaxPrice)}
        </h3>
        <input
          type="range"
          min={priceRange[0]}
          max={priceRange[1]}
          step={priceStep}
          value={localMaxPrice}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="mt-1 flex justify-between text-xs text-dark/40">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Только в наличии */}
      <div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={activeFilters.inStock}
            onChange={(e) =>
              updateFilter("inStock", e.target.checked ? "true" : undefined)
            }
            className="h-5 w-5 rounded accent-accent"
          />
          <span className="text-sm font-bold uppercase">Только в наличии</span>
        </label>
      </div>

      {/* Сбросить */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full rounded-full border-2 border-dark py-3 text-xs font-bold uppercase transition-colors hover:bg-dark hover:text-accent"
        >
          Сбросить фильтры
        </button>
      )}
    </>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:py-20">
      {/* Breadcrumbs */}
      <nav className="mb-8 text-sm">
        <Link href="/" className="menu-link text-dark/50 hover:text-dark">
          Главная
        </Link>
        <span className="mx-2 text-dark/30">/</span>
        <span className="font-bold">Каталог</span>
      </nav>

      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-5xl font-extrabold uppercase lg:text-7xl">
            Каталог
          </h1>
          <p className="mt-3 max-w-lg text-lg text-dark/60">
            Полный ассортимент стаканов, крышек и аксессуаров для вашего бизнеса.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-full border-2 border-dark px-5 py-2.5 text-xs font-bold uppercase transition-colors hover:bg-dark hover:text-accent lg:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" />
              <line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" />
              <line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" />
              <line x1="2" x2="6" y1="14" y2="14" /><line x1="10" x2="14" y1="8" y2="8" />
              <line x1="18" x2="22" y1="16" y2="16" />
            </svg>
            Фильтры
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] text-dark">!</span>
            )}
          </button>

          {/* Sort */}
          <SortDropdown
            value={activeFilters.sort}
            onChange={(val) =>
              updateFilter("sort", val === "default" ? undefined : val)
            }
          />
        </div>
      </div>

      {/* Visual category cards */}
      <VisualCategories categories={visualCategories} />

      {/* Main layout */}
      <div className="flex gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden w-[260px] flex-shrink-0 space-y-8 lg:block">
          {filterContent}
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {/* Active filter badges */}
          {hasActiveFilters && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {activeFilters.category && (
                <FilterBadge
                  label={categories.find((c) => c.slug === activeFilters.category)?.name ?? activeFilters.category}
                  onRemove={() => updateFilter("category", undefined)}
                />
              )}
              {activeFilters.volume && (
                <FilterBadge
                  label={activeFilters.volume}
                  onRemove={() => updateFilter("volume", undefined)}
                />
              )}
              {activeFilters.maxPrice !== undefined && (
                <FilterBadge
                  label={`до ${formatPrice(activeFilters.maxPrice)}`}
                  onRemove={() => updateFilter("maxPrice", undefined)}
                />
              )}
              {activeFilters.inStock && (
                <FilterBadge
                  label="В наличии"
                  onRemove={() => updateFilter("inStock", undefined)}
                />
              )}
              {activeFilters.search && (
                <FilterBadge
                  label={`«${activeFilters.search}»`}
                  onRemove={() => updateFilter("q", undefined)}
                />
              )}
              <button
                onClick={clearFilters}
                className="text-xs font-bold uppercase text-dark/40 transition-colors hover:text-dark"
              >
                Очистить все
              </button>
            </div>
          )}

          {/* Results count */}
          <p className="mb-6 text-sm text-dark/50">
            {sortedProducts.length}{" "}
            {sortedProducts.length === 1
              ? "товар"
              : sortedProducts.length < 5
                ? "товара"
                : "товаров"}
          </p>

          {/* Product grid */}
          {sortedProducts.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {sortedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <CatalogProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="font-display text-2xl font-extrabold uppercase text-dark/30">
                Ничего не найдено
              </p>
              <p className="mt-2 text-sm text-dark/50">
                Попробуйте изменить фильтры
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 rounded-full border-2 border-dark px-8 py-3 text-sm font-bold uppercase transition-colors hover:bg-dark hover:text-accent"
              >
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 z-[1100] bg-dark/50"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-[1200] flex h-full w-full max-w-sm flex-col bg-light shadow-2xl"
            >
              <div className="flex items-center justify-between border-b-2 border-dark px-6 py-5">
                <h2 className="font-display text-xl font-extrabold uppercase">
                  Фильтры
                </h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dark transition-colors hover:bg-dark hover:text-accent"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
                {filterContent}
              </div>
              <div className="border-t-2 border-dark px-6 py-5">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full rounded-full bg-dark py-4 text-center text-sm font-bold uppercase text-accent transition-colors hover:bg-accent hover:text-dark"
                >
                  Показать {sortedProducts.length}{" "}
                  {sortedProducts.length === 1 ? "товар" : sortedProducts.length < 5 ? "товара" : "товаров"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Карточка товара для каталога (с вариантами) ─────

function CatalogProductCard({ product }: { product: SerializedProduct }) {
  const addBox = useCartStore((s) => s.addBox);
  const openCart = useCartStore((s) => s.openCart);

  // B2B: цена коробки (мин/макс)
  const minBoxPrice = Math.min(...product.variants.map((v) => v.boxPrice));
  const maxBoxPrice = Math.max(...product.variants.map((v) => v.boxPrice));
  const hasMultiplePrices = minBoxPrice !== maxBoxPrice;

  // B2B: цена за штуку (мин)
  const minPiecePrice = Math.min(...product.variants.map((v) => v.pricePerPiece));

  // Есть ли хоть один вариант в наличии
  const inStock = product.variants.some((v) => v.inStock);

  // Уникальные объёмы
  const volumes = product.variants
    .map((v) => v.volume)
    .filter((v): v is string => v !== null);
  const uniqueVolumes = [...new Set(volumes)];

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;

    // Добавляем первый доступный вариант (B2B: коробка)
    const firstInStock = product.variants.find((v) => v.inStock);
    if (!firstInStock) return;

    addBox({
      variantId: firstInStock.id,
      productId: product.id,
      name: `${product.name}${firstInStock.volume ? ` ${firstInStock.volume}` : ""}${firstInStock.colorOrDesign ? ` (${firstInStock.colorOrDesign})` : ""}`,
      volume: firstInStock.volume,
      color: firstInStock.colorOrDesign,
      sku: firstInStock.sku,
      imageUrl: product.imageBaseUrl,
      pricePerPiece: firstInStock.pricePerPiece,
      piecesPerBox: firstInStock.piecesPerBox,
      boxPrice: firstInStock.boxPrice,
    });
    openCart();
    toast.success(`Коробка ${product.name} добавлена в корзину`, {
      style: {
        background: "#0D0D0D",
        color: "#FFD600",
        fontFamily: "var(--font-main)",
        fontWeight: 700,
        borderRadius: "100px",
      },
      iconTheme: { primary: "#FFD600", secondary: "#0D0D0D" },
    });
  }

  return (
    <Link href={`/product/${product.slug}`}>
      <div
        className={cn(
          "product-card relative min-w-[280px] rounded-[var(--radius-apple)] bg-light p-4 text-dark transition-all duration-300 ease-out hover:-translate-y-1.5 sm:min-w-[320px]",
          !inStock && "opacity-60"
        )}
        style={{ boxShadow: "0 0 0 transparent" }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "8px 8px 0 #FFD600"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 0 transparent"; }}
      >
        {/* Image */}
        <div className="relative mb-5 h-[260px] overflow-hidden rounded-3xl border-2 border-dark">
          {product.imageBaseUrl ? (
            <Image
              src={product.imageBaseUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="320px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-dark/5">
              <span className="text-dark/30 text-sm">Нет фото</span>
            </div>
          )}
          {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark/50">
              <span className="rounded-full bg-white px-4 py-2 font-display text-sm font-extrabold uppercase">
                Нет в наличии
              </span>
            </div>
          )}
          {product.isPopular && inStock && (
            <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase text-dark">
              Хит
            </span>
          )}
        </div>

        {/* Category badge */}
        <span className="mb-2 inline-block rounded-md bg-dark/10 px-2 py-0.5 text-[10px] font-bold uppercase text-dark/60">
          {product.category.name}
        </span>

        {/* Title */}
        <h3 className="font-display text-[22px] uppercase">{product.name}</h3>

        {/* Volumes */}
        {uniqueVolumes.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {uniqueVolumes.map((vol) => (
              <span key={vol} className="rounded-md border border-dark/15 px-2 py-0.5 text-[10px] font-bold text-dark/50">
                {vol}
              </span>
            ))}
          </div>
        )}

        {/* Price + Add to cart */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold">
              {hasMultiplePrices
                ? `${formatPrice(minBoxPrice)} – ${formatPrice(maxBoxPrice)}`
                : formatPrice(minBoxPrice)}
            </span>
            <span className="block text-[10px] text-dark/50 font-medium">
              от {formatPrice(minPiecePrice)} / шт
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            transition={{ type: "tween", duration: 0.15 }}
            onClick={handleAddToCart}
            disabled={!inStock}
            className={cn(
              "flex h-[45px] w-[45px] items-center justify-center rounded-full border-2 border-dark text-xl transition-colors",
              !inStock
                ? "cursor-not-allowed bg-dark/20 text-dark/40"
                : "bg-accent hover:bg-dark hover:text-accent"
            )}
            aria-label={`Добавить ${product.name} в корзину`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5v14" />
            </svg>
          </motion.button>
        </div>
      </div>
    </Link>
  );
}

// ─── Filter badge component ─────────────────────────

function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dark bg-accent px-3 py-1 text-xs font-bold uppercase">
      {label}
      <button
        onClick={onRemove}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-dark text-[10px] text-accent transition-colors hover:bg-dark/70"
      >
        ×
      </button>
    </span>
  );
}
