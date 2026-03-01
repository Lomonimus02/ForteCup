import { prisma } from "@/lib/prisma";
import OrdersClient from "./OrdersClient";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: {
            select: { name: true, imageBaseUrl: true, slug: true },
          },
          variant: {
            select: {
              sku: true,
              volume: true,
              colorOrDesign: true,
              pricePerPiece: true,
              piecesPerBox: true,
              boxPrice: true,
              inStock: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize Decimal → number, Date → string
  const serialized = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    address: o.address,
    city: o.city,
    postalCode: o.postalCode,
    totalAmount: Number(o.totalAmount),
    status: o.status,
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      priceAtPurchase: Number(item.priceAtPurchase),
      product: item.product
        ? {
            name: item.product.name,
            imageBaseUrl: item.product.imageBaseUrl,
            slug: item.product.slug,
          }
        : null,
      variant: {
        sku: item.variant.sku,
        volume: item.variant.volume,
        colorOrDesign: item.variant.colorOrDesign,
        pricePerPiece: Number(item.variant.pricePerPiece),
        piecesPerBox: item.variant.piecesPerBox,
        boxPrice: Number(item.variant.boxPrice),
        inStock: item.variant.inStock,
      },
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">
          Заказы
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Управление заказами покупателей — {orders.length} заказ(ов)
        </p>
      </div>

      <OrdersClient orders={serialized} />
    </div>
  );
}
