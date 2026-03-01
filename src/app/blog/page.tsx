import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Блог",
  description: "Новости и статьи FORTE CUP — всё о бумажных стаканах, упаковке и трендах.",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:py-20">
      {/* Breadcrumbs */}
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-dark/50 hover:text-dark transition">
          Главная
        </Link>
        <span className="mx-2 text-dark/30">/</span>
        <span className="font-bold">Блог</span>
      </nav>

      <h1 className="font-display text-5xl font-extrabold uppercase lg:text-7xl">
        Блог
      </h1>
      <p className="mt-4 max-w-xl text-lg text-dark/60">
        Новости, статьи и полезные материалы о бумажной упаковке.
      </p>

      {posts.length === 0 ? (
        <div className="mt-20 text-center text-dark/30">
          <p className="text-2xl font-bold uppercase">Скоро здесь появятся статьи</p>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-[36px] border-2 border-dark overflow-hidden bg-white transition-shadow hover:shadow-[4px_4px_0_var(--color-accent)]"
            >
              {/* Image */}
              <div className="aspect-[16/10] bg-dark/5 overflow-hidden">
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={600}
                    height={375}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display text-3xl font-extrabold text-dark/10">
                      FORTE
                    </span>
                  </div>
                )}
              </div>
              {/* Content */}
              <div className="p-6">
                {post.publishedAt && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-dark/30">
                    {formatDate(post.publishedAt)}
                  </span>
                )}
                <h2 className="mt-2 font-display text-xl font-extrabold uppercase leading-tight">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm text-dark/50 line-clamp-3 leading-relaxed">
                  {post.content.replace(/<[^>]*>/g, "").slice(0, 160)}...
                </p>
                <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wide text-dark/40 group-hover:text-accent transition">
                  Читать →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
