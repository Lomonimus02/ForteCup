import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from "@/components/admin/ui";

export default async function AdminPortfolioPage() {
  const works = await prisma.portfolio.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            Портфолио
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Кейсы брендирования — {works.length} работ
          </p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition text-sm uppercase tracking-wider"
        >
          <Plus size={16} />
          Новая работа
        </Link>
      </div>

      {works.length === 0 ? (
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-neutral-700 mb-4"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <h2 className="text-lg font-bold text-neutral-400">Нет работ</h2>
          <p className="text-neutral-600 text-sm mt-2">
            Добавьте первый кейс брендирования
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Фото</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <tbody>
            {works.map((work) => (
              <TableRow key={work.id}>
                <TableCell>
                  {work.imageUrl ? (
                    <div className="w-14 h-14 rounded-lg bg-neutral-800 overflow-hidden">
                      <img
                        src={work.imageUrl}
                        alt={work.clientName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-neutral-800 flex items-center justify-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-neutral-600"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/portfolio/${work.id}`}
                    className="text-white font-medium hover:underline"
                  >
                    {work.clientName}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="text-neutral-500 text-xs line-clamp-2 max-w-xs">
                    {work.description || "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={work.isPublished ? "success" : "warning"}>
                    {work.isPublished ? "Опубликован" : "Черновик"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-neutral-500 text-xs">
                    {work.createdAt.toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/portfolio/${work.id}`}
                    className="text-xs text-neutral-500 hover:text-white transition"
                  >
                    Изменить →
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
