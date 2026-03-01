import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.isPublished) return {};
  return {
    title: page.title,
    description: `${page.title} — FORTE CUP`,
  };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.isPublished) notFound();

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:py-20">
      {/* Breadcrumbs */}
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-dark/50 hover:text-dark transition">
          Главная
        </Link>
        <span className="mx-2 text-dark/30">/</span>
        <span className="font-bold">{page.title}</span>
      </nav>

      {/* Title */}
      <h1 className="font-display text-5xl font-extrabold uppercase lg:text-7xl">
        {page.title}
      </h1>

      {/* Content */}
      <div
        className="cms-content mt-12"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
