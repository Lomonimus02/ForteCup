import { prisma } from "@/lib/prisma";
import {
  Package,
  ShoppingCart,
  FolderOpen,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// ─── Status helpers ──────────────────────

const statusConfig: Record<
  string,
  { label: string; color: string }
> = {
  PENDING: { label: "Новый", color: "bg-yellow-500/20 text-yellow-400" },
  PAID: { label: "Оплачен", color: "bg-blue-500/20 text-blue-400" },
  ASSEMBLED: { label: "Собран", color: "bg-neutral-500/20 text-neutral-300" },
  SHIPPED: { label: "Отправлен", color: "bg-green-500/20 text-green-400" },
  CANCELLED: { label: "Отменён", color: "bg-red-500/20 text-red-400" },
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Data fetching ───────────────────────

async function getStats() {
  const [productsCount, ordersCount, categoriesCount, revenue] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.category.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
    ]);

  return {
    productsCount,
    ordersCount,
    categoriesCount,
    revenue: Number(revenue._sum.totalAmount ?? 0),
  };
}

async function getRecentOrders() {
  const orders = await prisma.order.findMany({
    take: 7,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          variant: {
            select: {
              sku: true,
              volume: true,
              colorOrDesign: true,
              product: { select: { name: true } },
            },
          },
        },
      },
    },
  });
  return orders;
}

type RecentOrder = Awaited<ReturnType<typeof getRecentOrders>>[number];
type RecentOrderItem = RecentOrder["items"][number];

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const recentOrders = await getRecentOrders();

  const cards = [
    {
      label: "Товары",
      value: stats.productsCount,
      icon: Package,
      href: "/admin/products",
    },
    {
      label: "Заказы",
      value: stats.ordersCount,
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      label: "Категории",
      value: stats.categoriesCount,
      icon: FolderOpen,
      href: "/admin/categories",
    },
    {
      label: "Выручка",
      value: `${stats.revenue.toLocaleString("ru-RU")} ₽`,
      icon: DollarSign,
      href: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">
          Дашборд
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Обзор магазина FORTE CUP
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <a
              key={card.label}
              href={card.href}
              className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-500 font-medium">
                  {card.label}
                </span>
                <Icon
                  size={18}
                  className="text-neutral-600 group-hover:text-white transition"
                />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </a>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Последние заказы</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-neutral-500 hover:text-white transition flex items-center gap-1"
          >
            Все заказы <ChevronRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-neutral-500 text-sm">Заказов пока нет</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order: RecentOrder) => {
              const cfg = statusConfig[order.status] ?? statusConfig.PENDING;
              return (
                <Link
                  key={order.id}
                  href="/admin/orders"
                  className="block bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-white font-bold text-sm">
                        #{order.orderNumber}
                      </span>
                      <span className="text-neutral-500 text-xs">
                        {formatDate(order.createdAt)}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <span className="text-white font-bold text-sm whitespace-nowrap">
                      {formatPrice(Number(order.totalAmount))}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-neutral-400 text-xs">
                      {order.customerName}
                    </span>
                    <span className="text-neutral-600 text-xs">•</span>
                    <span className="text-neutral-500 text-xs">
                      {order.customerPhone}
                    </span>
                    {order.city && (
                      <>
                        <span className="text-neutral-600 text-xs">•</span>
                        <span className="text-neutral-500 text-xs">
                          {order.city}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Items preview */}
                  <div className="flex flex-wrap gap-1.5">
                    {order.items.map((item: RecentOrderItem) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1 bg-neutral-800 text-neutral-300 text-[11px] px-2 py-0.5 rounded-md"
                      >
                        <span className="truncate max-w-[150px]">
                          {item.variant.product?.name ?? "—"}
                        </span>
                        {item.variant.volume && (
                          <span className="text-neutral-500">
                            {item.variant.volume}
                          </span>
                        )}
                        <span className="text-neutral-500">×{item.quantity}</span>
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
