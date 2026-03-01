import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  AdminButton,
} from "@/components/admin/ui";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: {
        orderBy: { sku: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Товары</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {products.length} товар(ов) в каталоге
          </p>
        </div>
        <Link href="/admin/products/new">
          <AdminButton>
            <Plus size={16} />
            Добавить
          </AdminButton>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead className="w-[60px]">Фото</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Вариации</TableHead>
            <TableHead>Цена коробки</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="w-[80px]">Действия</TableHead>
          </tr>
        </TableHeader>
        <tbody>
          {products.map((product) => {
            const minBoxPrice = product.variants.length > 0
              ? Math.min(...product.variants.map((v) => Number(v.boxPrice)))
              : 0;
            const maxBoxPrice = product.variants.length > 0
              ? Math.max(...product.variants.map((v) => Number(v.boxPrice)))
              : 0;
            const allInStock = product.variants.every((v) => v.inStock);
            const someInStock = product.variants.some((v) => v.inStock);

            return (
              <TableRow key={product.id}>
                {/* Photo */}
                <TableCell>
                  {product.imageBaseUrl ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neutral-800">
                      <Image
                        src={product.imageBaseUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-600 text-[10px]">
                      N/A
                    </div>
                  )}
                </TableCell>

                {/* Name */}
                <TableCell>
                  <div>
                    <span className="font-medium text-white block">{product.name}</span>
                    <span className="text-xs text-neutral-600">{product.slug}</span>
                  </div>
                </TableCell>

                {/* Category */}
                <TableCell>
                  <Badge>{product.category.name}</Badge>
                </TableCell>

                {/* Variants count */}
                <TableCell>
                  <span className="text-neutral-400">{product.variants.length} шт.</span>
                </TableCell>

                {/* Box Price range */}
                <TableCell>
                  {product.variants.length > 0 ? (
                    <span className="text-white font-medium">
                      {minBoxPrice === maxBoxPrice
                        ? formatPrice(minBoxPrice)
                        : `${formatPrice(minBoxPrice)} – ${formatPrice(maxBoxPrice)}`}
                    </span>
                  ) : (
                    <span className="text-neutral-600">—</span>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {product.isDraft ? (
                      <Badge variant="warning">
                        <EyeOff size={10} className="mr-1" />
                        Черновик
                      </Badge>
                    ) : (
                      <Badge variant="success">
                        <Eye size={10} className="mr-1" />
                        Активен
                      </Badge>
                    )}
                    {!allInStock && someInStock && (
                      <Badge variant="warning">Частично</Badge>
                    )}
                    {!someInStock && product.variants.length > 0 && (
                      <Badge variant="danger">Нет в наличии</Badge>
                    )}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition inline-flex"
                    title="Редактировать"
                  >
                    <Pencil size={14} />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-neutral-600">
                Нет товаров. Нажмите «Добавить» для создания.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
