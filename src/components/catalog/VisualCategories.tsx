"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface VisualCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

interface VisualCategoriesProps {
  categories: VisualCategory[];
}

export function VisualCategories({ categories }: VisualCategoriesProps) {
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category");

  if (categories.length === 0) return null;

  return (
    <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((cat, i) => {
        const isActive = activeSlug === cat.slug;
        const href = isActive
          ? "/catalog"
          : `/catalog?category=${cat.slug}`;

        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={href}
              scroll={false}
              className={`group relative block h-[130px] cursor-pointer overflow-hidden border-2 ${
                isActive
                  ? "border-accent"
                  : "border-dark"
              }`}
              style={{ borderRadius: "var(--radius-apple)" }}
            >
              {/* Background image or plain gray fallback */}
              {cat.imageUrl ? (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-200" />
              )}

              {/* Centered pill label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-black shadow-sm transition-transform duration-300 group-hover:scale-105">
                  {cat.name}
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
