import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PortfolioGallery } from "./PortfolioGallery";

export const metadata: Metadata = {
  title: "Портфолио",
  description: "Кейсы брендирования стаканов FORTE CUP для кофеен и ресторанов.",
};

export default async function PortfolioPage() {
  const works = await prisma.portfolio.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  const serialized = works.map((w) => ({
    id: w.id,
    clientName: w.clientName,
    description: w.description,
    imageUrl: w.imageUrl,
  }));

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:py-20">
      {/* Header */}
      <h1 className="font-display text-5xl font-extrabold uppercase lg:text-7xl">
        Портфолио
      </h1>
      <p className="mt-4 max-w-xl text-lg text-dark/60">
        Реальные кейсы брендирования — стаканы с логотипами наших клиентов.
      </p>

      {works.length === 0 ? (
        <div className="mt-20 text-center text-dark/30">
          <p className="text-2xl font-bold uppercase">Скоро здесь появятся работы</p>
        </div>
      ) : (
        <PortfolioGallery works={serialized} />
      )}
    </div>
  );
}
