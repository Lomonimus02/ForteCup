import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PortfolioForm from "../PortfolioForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminPortfolioEditPage({ params }: Props) {
  const { id } = await params;

  const work = await prisma.portfolio.findUnique({ where: { id } });
  if (!work) notFound();

  return (
    <PortfolioForm
      work={{
        id: work.id,
        clientName: work.clientName,
        description: work.description ?? "",
        imageUrl: work.imageUrl ?? "",
        isPublished: work.isPublished,
      }}
    />
  );
}
