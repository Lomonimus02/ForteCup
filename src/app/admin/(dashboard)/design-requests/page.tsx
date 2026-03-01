import { prisma } from "@/lib/prisma";
import DesignRequestsClient from "./DesignRequestsClient";

export default async function DesignRequestsPage() {
  const requests = await prisma.designRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = requests.map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    quantity: r.quantity,
    comment: r.comment,
    isRead: r.isRead,
    createdAt: r.createdAt.toISOString(),
  }));

  const unreadCount = serialized.filter((r) => !r.isRead).length;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Заявки на дизайн</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {serialized.length} {serialized.length === 1 ? "заявка" : "заявок"}
            {unreadCount > 0 && (
              <span className="ml-2 text-yellow-400">
                ({unreadCount} {unreadCount === 1 ? "новая" : "новых"})
              </span>
            )}
          </p>
        </div>
      </div>

      <DesignRequestsClient requests={serialized} />
    </div>
  );
}
