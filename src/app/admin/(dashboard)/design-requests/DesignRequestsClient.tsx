"use client";

import { useState, useTransition } from "react";
import { markDesignRequestRead, deleteDesignRequest } from "./actions";
import toast from "react-hot-toast";
import { Check, Trash2, Phone, User, Package, MessageSquare, Clock } from "lucide-react";

interface DesignRequest {
  id: string;
  name: string;
  phone: string;
  quantity: string | null;
  comment: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function DesignRequestsClient({
  requests,
}: {
  requests: DesignRequest[];
}) {
  const [items, setItems] = useState(requests);
  const [isPending, startTransition] = useTransition();

  function handleMarkRead(id: string) {
    startTransition(async () => {
      const res = await markDesignRequestRead(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        setItems((prev) => prev.map((r) => (r.id === id ? { ...r, isRead: true } : r)));
        toast.success("Отмечена как прочитанная");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Удалить заявку?")) return;
    startTransition(async () => {
      const res = await deleteDesignRequest(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        setItems((prev) => prev.filter((r) => r.id !== id));
        toast.success("Заявка удалена");
      }
    });
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

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-12 text-center">
        <p className="text-neutral-500">Заявок пока нет</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((req) => (
        <div
          key={req.id}
          className={`rounded-2xl border p-6 transition-colors ${
            req.isRead
              ? "border-neutral-800 bg-neutral-900/30"
              : "border-yellow-500/30 bg-yellow-500/5"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-center gap-3 flex-wrap">
                {!req.isRead && (
                  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-[11px] font-bold uppercase text-yellow-400">
                    Новая
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-sm text-neutral-400">
                  <Clock size={14} />
                  {formatDate(req.createdAt)}
                </span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-neutral-500 shrink-0" />
                  <span className="font-medium text-white">{req.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-neutral-500 shrink-0" />
                  <a href={`tel:${req.phone}`} className="text-blue-400 hover:underline">
                    {req.phone}
                  </a>
                </div>
                {req.quantity && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package size={14} className="text-neutral-500 shrink-0" />
                    <span className="text-neutral-300">{req.quantity}</span>
                  </div>
                )}
                {req.comment && (
                  <div className="flex items-start gap-2 text-sm sm:col-span-2 lg:col-span-1">
                    <MessageSquare size={14} className="text-neutral-500 shrink-0 mt-0.5" />
                    <span className="text-neutral-300">{req.comment}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {!req.isRead && (
                <button
                  onClick={() => handleMarkRead(req.id)}
                  disabled={isPending}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition hover:border-green-500/50 hover:text-green-400 disabled:opacity-50"
                  title="Отметить прочитанной"
                >
                  <Check size={16} />
                </button>
              )}
              <button
                onClick={() => handleDelete(req.id)}
                disabled={isPending}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
                title="Удалить"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
