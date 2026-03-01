"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PortfolioWork {
  id: string;
  clientName: string;
  description: string | null;
  imageUrl: string | null;
}

interface PortfolioGalleryProps {
  works: PortfolioWork[];
}

export function PortfolioGallery({ works }: PortfolioGalleryProps) {
  const [selected, setSelected] = useState<PortfolioWork | null>(null);

  return (
    <>
      {/* Grid */}
      <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {works.map((work, i) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 break-inside-avoid"
          >
            <button
              onClick={() => setSelected(work)}
              className="group relative w-full overflow-hidden border-2 border-dark text-left transition-shadow hover:shadow-[6px_6px_0_var(--color-accent)]"
              style={{ borderRadius: "var(--radius-apple)" }}
            >
              {work.imageUrl ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={work.imageUrl}
                    alt={work.clientName}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-neutral-200">
                  <span className="text-sm text-dark/30 uppercase font-bold">Нет фото</span>
                </div>
              )}
              <div className="bg-light px-5 py-4">
                <h3 className="text-sm font-bold uppercase tracking-wide">
                  {work.clientName}
                </h3>
                {work.description && (
                  <p className="mt-1 text-xs text-dark/50 line-clamp-2">
                    {work.description}
                  </p>
                )}
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-h-[90vh] max-w-[900px] w-full overflow-hidden rounded-3xl bg-light"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-dark/80 text-white transition hover:bg-dark"
              >
                <X size={20} />
              </button>

              {selected.imageUrl && (
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={selected.imageUrl}
                    alt={selected.clientName}
                    fill
                    sizes="900px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                <h2 className="font-display text-2xl font-extrabold uppercase">
                  {selected.clientName}
                </h2>
                {selected.description && (
                  <p className="mt-3 text-dark/60 leading-relaxed">
                    {selected.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
