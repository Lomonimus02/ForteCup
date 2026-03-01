"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import Link from "next/link";

interface HeroProps {
  title: string;
  subtitle: string;
  imageUrl?: string;
}

export function Hero({ title, subtitle, imageUrl }: HeroProps) {
  // Split title into lines for dramatic typography
  const lines = title.split("\n").filter(Boolean);

  /**
   * Markup syntax for styled lines:
   *   *text*  → outline stroke (transparent fill, dark stroke)
   *   [text]  → yellow accent block (rounded bg)
   *   plain   → solid dark text
   *
   * Each line can mix segments: "HOLD *THE* [LOUD]"
   */
  function renderStyledLine(raw: string, lineIdx: number) {
    // Regex captures: *outline* or [accent] or plain text
    const segmentRegex = /\*([^*]+)\*|\[([^\]]+)\]|([^*[\]]+)/g;
    const segments: React.ReactNode[] = [];
    let match: RegExpExecArray | null;
    let segIdx = 0;

    while ((match = segmentRegex.exec(raw)) !== null) {
      const [, outline, accent, plain] = match;
      if (outline) {
        segments.push(
          <span
            key={segIdx}
            className="text-transparent"
            style={{ WebkitTextStroke: "2px var(--color-dark)" }}
          >
            {outline}
          </span>
        );
      } else if (accent) {
        segments.push(
          <span
            key={segIdx}
            className="inline rounded-2xl bg-accent px-2.5 text-dark"
            style={{ WebkitTextStroke: "0" }}
          >
            {accent}
          </span>
        );
      } else if (plain) {
        segments.push(<span key={segIdx}>{plain}</span>);
      }
      segIdx++;
    }

    // If the raw line had no markup at all, just render plain
    if (segments.length === 0) {
      segments.push(<span key={0}>{raw}</span>);
    }

    return (
      <span key={lineIdx} className="block">
        {segments}
      </span>
    );
  }

  return (
    <section className="grid min-h-[85vh] grid-cols-1 border-b-2 border-dark lg:grid-cols-[1.2fr_0.8fr]">
      {/* Text side */}
      <div className="flex flex-col justify-center border-dark bg-light px-4 py-8 md:px-16 lg:border-r-2 lg:py-16">
        <Tag className="mb-5 w-fit">МОСКВА / РФ</Tag>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl font-extrabold uppercase leading-[0.85] text-dark md:text-[7vw]"
        >
          {lines.map((line, i) => renderStyledLine(line, i))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 max-w-[400px] text-lg leading-snug"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <Link href="/catalog">
            <Button>ЗАКАЗАТЬ ОПТОМ</Button>
          </Link>
        </motion.div>
      </div>

      {/* Visual side */}
      <div className="flex items-center justify-center bg-light p-4 md:p-5 lg:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="bento-item group relative h-[400px] w-full overflow-hidden border-2 border-dark lg:h-full"
          style={{ borderRadius: "var(--radius-apple)" }}
        >
          <Image
            src={imageUrl || "https://images.unsplash.com/photo-1497515114889-43e4975962f8?q=80&w=2070&auto=format&fit=crop"}
            alt="Forte Cup disposable cups"
            fill
            priority
            className="object-cover grayscale contrast-[1.2] transition-all duration-500 group-hover:grayscale-0 group-hover:contrast-100"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />

          {/* Sticker */}
          <div className="animate-float absolute -left-[30px] bottom-[30px] z-10 flex h-[140px] w-[140px] -rotate-[15deg] items-center justify-center rounded-full border-2 border-dark bg-accent text-center font-display text-sm font-extrabold leading-tight md:h-[140px] md:w-[140px]">
            CUSTOM
            <br />
            PRINT
            <br />
            HERE
          </div>
        </motion.div>
      </div>
    </section>
  );
}
