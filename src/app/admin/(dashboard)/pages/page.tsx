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

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            Страницы
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            CMS-страницы сайта — {pages.length} шт.
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition text-sm uppercase tracking-wider"
        >
          <Plus size={16} />
          Новая страница
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-bold text-neutral-400">Нет страниц</h2>
          <p className="text-neutral-600 text-sm mt-2">
            Создайте первую CMS-страницу (О нас, Доставка и т.д.)
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Заголовок</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Обновлено</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <tbody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell>
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="text-white font-medium hover:underline"
                  >
                    {page.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <code className="text-xs text-neutral-500">{page.slug}</code>
                </TableCell>
                <TableCell>
                  <a
                    href={`/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-500 hover:text-white transition"
                  >
                    /{page.slug} ↗
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant={page.isPublished ? "success" : "warning"}>
                    {page.isPublished ? "Опубликована" : "Черновик"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-neutral-500 text-xs">
                    {page.updatedAt.toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/pages/${page.id}`}
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
