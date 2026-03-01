"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

interface BentoCategoriesProps {
  categories: CategoryItem[];
}

// Grid sizes: first = large, last = wide, rest = default
function getGridClass(index: number, total: number) {
  if (index === 0) return "sm:col-span-2 sm:row-span-2";
  if (index === total - 1 && total > 2) return "sm:col-span-2";
  return "";
}

export function BentoCategories({ categories }: BentoCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="px-5 py-20">
      <h2 className="mx-auto max-w-[1400px] font-display text-2xl uppercase sm:text-[32px] md:text-[40px]">
        Категории ↘
      </h2>

      <div className="mx-auto mt-10 grid max-w-[1400px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[320px_320px]">
        {categories.map((cat, idx) => (
          <Link
            key={cat.id}
            href={`/catalog?category=${cat.slug}`}
            className={cn(
              "bento-item group relative border-2 border-dark bg-white min-h-[260px] transition-all duration-300 ease-out hover:-translate-y-2",
              getGridClass(idx, categories.length)
            )}
            style={{
              borderRadius: "var(--radius-apple)",
              boxShadow: "0 0 0 transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "12px 12px 0 #0D0D0D";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0 transparent";
            }}
          >
            <div
              className="relative h-full w-full overflow-hidden"
              style={{ borderRadius: "calc(var(--radius-apple) - 2px)" }}
            >
              {cat.imageUrl ? (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-dark/5">
                  <span className="text-xl font-extrabold text-dark/20 uppercase">
                    {cat.name}
                  </span>
                </div>
              )}
            </div>

            {/* Overlay label */}
            <div className="absolute left-6 top-6 z-[5] rounded-[20px] border-2 border-dark bg-white px-6 py-3 font-bold uppercase">
              {cat.name}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
