import { getSettings } from "./actions";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    prisma.category.findMany({
      where: { parentId: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">
          Настройки
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Глобальные тексты и контакты сайта
        </p>
      </div>

      <SettingsForm initialData={settings} categories={categories} />
    </div>
  );
}
