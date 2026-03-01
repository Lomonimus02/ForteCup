"use client";

import { useState, useTransition } from "react";
import { Select } from "@/components/admin/ui";
import { updateOrderStatus } from "./actions";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Hash,
  FileText,
  Package,
  Clock,
} from "lucide-react";
import Image from "next/image";

// ─── Types ───────────────────────────────

interface SerializedVariant {
  sku: string;
  volume: string | null;
  colorOrDesign: string | null;
  pricePerPiece: number;
  piecesPerBox: number;
  boxPrice: number;
  inStock: boolean;
}

interface SerializedProduct {
  name: string;
  imageBaseUrl: string | null;
  slug: string;
}

interface SerializedOrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  product: SerializedProduct | null;
  variant: SerializedVariant;
}

interface SerializedOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  totalAmount: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: SerializedOrderItem[];
}

// ─── Status config ───────────────────────

const statusConfig: Record<
  string,
  { label: string; color: string }
> = {
  PENDING:   { label: "Новый",      color: "bg-yellow-500/20 text-yellow-400" },
  PAID:      { label: "Оплачен",    color: "bg-blue-500/20 text-blue-400" },
  ASSEMBLED: { label: "Собран",     color: "bg-neutral-500/20 text-neutral-300" },
  SHIPPED:   { label: "Отправлен",  color: "bg-green-500/20 text-green-400" },
  CANCELLED: { label: "Отменён",    color: "bg-red-500/20 text-red-400" },
};

const statuses = ["PENDING", "PAID", "ASSEMBLED", "SHIPPED", "CANCELLED"];

// ─── Format helpers ──────────────────────

function formatPrice(n: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ───────────────────────────

export default function OrdersClient({ orders }: { orders: SerializedOrder[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(orderId: string, newStatus: string) {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Статус обновлён");
      }
    });
  }

  if (orders.length === 0) {
    return (
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <Package size={48} className="text-neutral-700 mb-4" />
        <h2 className="text-lg font-bold text-neutral-400">Нет заказов</h2>
        <p className="text-neutral-600 text-sm mt-2">
          Заказы появятся здесь после первого оформления через сайт
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const cfg = statusConfig[order.status] ?? statusConfig.PENDING;
        const isExpanded = expandedId === order.id;
        const totalBoxes = order.items.reduce((sum, i) => sum + i.quantity, 0);

        return (
          <div
            key={order.id}
            className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden transition hover:border-neutral-700"
          >
            {/* ─── Compact header row (clickable) ────── */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left"
            >
              <span className="font-mono text-white font-bold text-sm shrink-0">
                #{order.orderNumber}
              </span>
              <span className="text-neutral-500 text-xs shrink-0 whitespace-nowrap">
                {formatDate(order.createdAt)}
              </span>
              <span className="text-white text-sm font-medium truncate min-w-0">
                {order.customerName}
              </span>
              <span className="text-neutral-500 text-xs shrink-0">
                {order.items.length} поз. ({totalBoxes} кор.)
              </span>
              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0 ${cfg.color}`}>
                {cfg.label}
              </span>
              <span className="text-white font-bold text-sm ml-auto shrink-0 whitespace-nowrap">
                {formatPrice(order.totalAmount)}
              </span>
              {isExpanded ? (
                <ChevronUp size={16} className="text-neutral-500 shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-neutral-500 shrink-0" />
              )}
            </button>

            {/* ─── Expanded details ──────────────────── */}
            {isExpanded && (
              <div className="border-t border-neutral-800 px-5 py-5 space-y-6">
                {/* Status change + timestamps */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-neutral-500 font-medium">Статус:</label>
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={isPending}
                      className="!py-1.5 !px-2 !text-xs !w-auto min-w-[140px]"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {statusConfig[s]?.label ?? s}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-600 text-xs">
                    <Clock size={12} />
                    <span>Создан: {formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-600 text-xs">
                    <Clock size={12} />
                    <span>Обновлён: {formatDate(order.updatedAt)}</span>
                  </div>
                </div>

                {/* Customer + Delivery + Notes grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Customer info */}
                  <div className="bg-neutral-900/60 rounded-xl p-4 space-y-2.5">
                    <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={12} /> Покупатель
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-neutral-600 shrink-0" />
                        <span className="text-white text-sm font-medium">{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-neutral-600 shrink-0" />
                        <a href={`mailto:${order.customerEmail}`} className="text-neutral-400 text-xs hover:text-white transition">
                          {order.customerEmail}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-neutral-600 shrink-0" />
                        <a href={`tel:${order.customerPhone}`} className="text-neutral-400 text-xs hover:text-white transition">
                          {order.customerPhone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Delivery info */}
                  <div className="bg-neutral-900/60 rounded-xl p-4 space-y-2.5">
                    <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={12} /> Доставка
                    </h4>
                    {order.city || order.address || order.postalCode ? (
                      <div className="space-y-1.5">
                        {order.city && (
                          <div className="flex items-start gap-2">
                            <Building2 size={13} className="text-neutral-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-neutral-600 text-[10px] uppercase">Город</p>
                              <p className="text-white text-sm">{order.city}</p>
                            </div>
                          </div>
                        )}
                        {order.address && (
                          <div className="flex items-start gap-2">
                            <MapPin size={13} className="text-neutral-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-neutral-600 text-[10px] uppercase">Адрес</p>
                              <p className="text-white text-sm">{order.address}</p>
                            </div>
                          </div>
                        )}
                        {order.postalCode && (
                          <div className="flex items-start gap-2">
                            <Hash size={13} className="text-neutral-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-neutral-600 text-[10px] uppercase">Индекс</p>
                              <p className="text-white text-sm">{order.postalCode}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-neutral-600 text-xs italic">Не указано</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="bg-neutral-900/60 rounded-xl p-4 space-y-2.5">
                    <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={12} /> Комментарий
                    </h4>
                    {order.notes ? (
                      <p className="text-neutral-300 text-sm leading-relaxed">{order.notes}</p>
                    ) : (
                      <p className="text-neutral-600 text-xs italic">Нет комментария</p>
                    )}
                  </div>
                </div>

                {/* ─── Items table ────────────────────── */}
                <div>
                  <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Package size={12} /> Позиции заказа ({order.items.length})
                  </h4>

                  <div className="bg-neutral-900/40 rounded-xl overflow-hidden border border-neutral-800/50">
                    {/* Table header */}
                    <div className="hidden md:grid grid-cols-[40px_1fr_90px_80px_60px_100px] gap-3 px-4 py-2.5 border-b border-neutral-800/50 text-[10px] uppercase tracking-wider text-neutral-600 font-bold">
                      <span />
                      <span>Товар / Вариант</span>
                      <span className="text-right">Цена/шт</span>
                      <span className="text-right">В коробке</span>
                      <span className="text-right">Кол-во</span>
                      <span className="text-right">Сумма</span>
                    </div>

                    {/* Item rows */}
                    {order.items.map((item, idx) => {
                      const subtotal = item.priceAtPurchase * item.quantity;
                      return (
                        <div
                          key={item.id}
                          className={`grid grid-cols-1 md:grid-cols-[40px_1fr_90px_80px_60px_100px] gap-3 items-center px-4 py-3 ${
                            idx < order.items.length - 1 ? "border-b border-neutral-800/30" : ""
                          }`}
                        >
                          {/* Product image */}
                          <div className="hidden md:block w-10 h-10 rounded-lg bg-neutral-800 overflow-hidden shrink-0">
                            {item.product?.imageBaseUrl ? (
                              <Image
                                src={item.product.imageBaseUrl}
                                alt={item.product.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={14} className="text-neutral-600" />
                              </div>
                            )}
                          </div>

                          {/* Product name + variant details */}
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {item.product?.name ?? "Удалённый товар"}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                              <span className="text-neutral-500 text-[11px] font-mono">
                                {item.variant.sku}
                              </span>
                              {item.variant.volume && (
                                <span className="text-neutral-500 text-[11px]">
                                  {item.variant.volume}
                                </span>
                              )}
                              {item.variant.colorOrDesign && (
                                <span className="text-neutral-500 text-[11px]">
                                  {item.variant.colorOrDesign}
                                </span>
                              )}
                              {!item.variant.inStock && (
                                <span className="text-red-400/80 text-[10px] font-medium">
                                  Нет в наличии
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price per piece */}
                          <div className="md:text-right">
                            <span className="md:hidden text-neutral-600 text-[10px] uppercase mr-1">Цена/шт:</span>
                            <span className="text-neutral-400 text-xs">
                              {formatPrice(item.variant.pricePerPiece)}
                            </span>
                          </div>

                          {/* Pieces per box */}
                          <div className="md:text-right">
                            <span className="md:hidden text-neutral-600 text-[10px] uppercase mr-1">В коробке:</span>
                            <span className="text-neutral-400 text-xs">
                              {item.variant.piecesPerBox} шт
                            </span>
                          </div>

                          {/* Quantity */}
                          <div className="md:text-right">
                            <span className="md:hidden text-neutral-600 text-[10px] uppercase mr-1">Кол-во:</span>
                            <span className="inline-flex items-center justify-center bg-neutral-800 text-white text-xs font-bold rounded-md px-2.5 py-1 min-w-[36px]">
                              {item.quantity}
                            </span>
                          </div>

                          {/* Subtotal */}
                          <div className="md:text-right">
                            <p className="text-white font-bold text-sm whitespace-nowrap">
                              {formatPrice(subtotal)}
                            </p>
                            <p className="text-neutral-600 text-[10px]">
                              за кор: {formatPrice(item.priceAtPurchase)}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Footer total */}
                    <div className="border-t border-neutral-700/50 px-4 py-3 flex items-center justify-between bg-neutral-900/60">
                      <span className="text-neutral-500 text-sm">
                        Итого: {order.items.length} поз., {totalBoxes} кор.
                      </span>
                      <span className="text-white font-bold text-lg">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
