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

export default async function AdminBlogPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            Блог
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Управление статьями — {posts.length} статей
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition text-sm uppercase tracking-wider"
        >
          <Plus size={16} />
          Новая статья
        </Link>
      </div>

      {posts.length === 0 ? (
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
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
          <h2 className="text-lg font-bold text-neutral-400">Нет статей</h2>
          <p className="text-neutral-600 text-sm mt-2">
            Создайте первую статью для блога
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Обложка</TableHead>
              <TableHead>Заголовок</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <tbody>
            {posts.map((post) => {
              const isPublished = !!post.publishedAt;
              return (
                <TableRow key={post.id}>
                  <TableCell>
                    {post.imageUrl ? (
                      <div className="w-12 h-12 rounded-lg bg-neutral-800 overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center">
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
                      href={`/admin/blog/${post.id}`}
                      className="text-white font-medium hover:underline"
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs text-neutral-500">{post.slug}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isPublished ? "success" : "warning"}>
                      {isPublished ? "Опубликован" : "Черновик"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-neutral-500 text-xs">
                      {post.createdAt.toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="text-xs text-neutral-500 hover:text-white transition"
                    >
                      Изменить →
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
