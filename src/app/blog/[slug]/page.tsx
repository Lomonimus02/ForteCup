import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.publishedAt) return {};
  return {
    title: post.title,
    description: post.content.replace(/<[^>]*>/g, "").slice(0, 160),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.publishedAt) notFound();

  const formattedDate = post.publishedAt.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:py-20">
      {/* Breadcrumbs */}
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-dark/50 hover:text-dark transition">
          Главная
        </Link>
        <span className="mx-2 text-dark/30">/</span>
        <Link href="/blog" className="text-dark/50 hover:text-dark transition">
          Блог
        </Link>
        <span className="mx-2 text-dark/30">/</span>
        <span className="font-bold">{post.title}</span>
      </nav>

      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-dark/30">
          {formattedDate}
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold uppercase lg:text-6xl leading-[0.95]">
          {post.title}
        </h1>
      </div>

      {/* Cover image */}
      {post.imageUrl && (
        <div className="mt-10 aspect-[21/9] rounded-[36px] border-2 border-dark overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={1400}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="cms-content mt-12 max-w-3xl"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Back link */}
      <div className="mt-16 pt-8 border-t-2 border-dark/10">
        <Link
          href="/blog"
          className="text-sm font-bold uppercase tracking-wide text-dark/50 hover:text-dark transition"
        >
          ← Все статьи
        </Link>
      </div>
    </div>
  );
}
