import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageForm from "../PageForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminPageEditPage({ params }: Props) {
  const { id } = await params;

  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <PageForm
      page={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        isPublished: page.isPublished,
      }}
    />
  );
}
