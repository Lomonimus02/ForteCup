"use client";

import { useForm } from "react-hook-form";
import { useTransition, useState, useEffect } from "react";
import { Input, Textarea, Label, AdminButton } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { updateSettings } from "./actions";
import { SETTINGS_KEYS, type SettingsKey } from "./constants";
import toast from "react-hot-toast";

// ─── Types ───────────────────────────────

type SettingsData = Record<SettingsKey, string>;

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface SettingsFormProps {
  initialData: Record<string, string>;
  categories: CategoryOption[];
}

// ─── Component ───────────────────────────

export default function SettingsForm({ initialData, categories }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  // Parse saved category IDs
  const savedCatIds: string[] = (() => {
    try {
      const raw = initialData.homepageCategoryIds;
      if (!raw) return [];
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  })();

  const [selectedCatIds, setSelectedCatIds] = useState<string[]>(savedCatIds);

  const defaults: SettingsData = {} as SettingsData;
  for (const key of SETTINGS_KEYS) {
    defaults[key] = initialData[key] ?? "";
  }

  const { register, handleSubmit, setValue, watch } = useForm<SettingsData>({
    defaultValues: defaults,
  });

  // Sync selectedCatIds into form value
  useEffect(() => {
    setValue("homepageCategoryIds", JSON.stringify(selectedCatIds), { shouldDirty: true });
  }, [selectedCatIds, setValue]);

  function toggleCategory(id: string) {
    setSelectedCatIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function moveCat(id: string, dir: -1 | 1) {
    setSelectedCatIds((prev) => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const next = [...prev];
      const targetIdx = idx + dir;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next;
    });
  }

  function onSubmit(data: SettingsData) {
    startTransition(async () => {
      const result = await updateSettings(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Настройки сохранены");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Hero Section */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
          Главная страница
        </h2>

        <div>
          <Label htmlFor="heroTitle">Заголовок H1 (Hero, каждая строка — отдельная)</Label>
          <Textarea
            id="heroTitle"
            rows={3}
            placeholder="HOLD\n*THE LOUD*\n[BRAND]"
            {...register("heroTitle")}
          />
          <p className="text-xs text-neutral-500 mt-1.5">
            <code className="text-neutral-400">*текст*</code> — контурный стиль &nbsp;|&nbsp;
            <code className="text-neutral-400">[текст]</code> — жёлтый акцент &nbsp;|&nbsp;
            Простой текст — жирный тёмный. Каждая строка — новый блок.
          </p>
        </div>

        <div>
          <Label htmlFor="heroSubtitle">Подзаголовок (Hero)</Label>
          <Textarea
            id="heroSubtitle"
            rows={3}
            placeholder="Производство и продажа одноразовой посуды оптом..."
            {...register("heroSubtitle")}
          />
        </div>

        <ImageUpload
          label="Изображение Hero"
          value={watch("heroImageUrl")}
          onChange={(url) => setValue("heroImageUrl", url, { shouldDirty: true })}
        />

        <div>
          <Label htmlFor="marqueeText">Бегущая строка (Marquee)</Label>
          <Input
            id="marqueeText"
            placeholder="БУМАЖНЫЕ СТАКАНЫ • КРЫШКИ • ХОЛДЕРЫ • БРЕНДИРОВАНИЕ"
            {...register("marqueeText")}
          />
        </div>

        {/* Homepage Categories Picker */}
        <div>
          <Label>Категории на главной странице</Label>
          <p className="text-xs text-neutral-500 mb-3">
            Выберите категории для блока «Категории» на главной. Порядок можно изменять стрелками.
          </p>

          {/* Selected (ordered) */}
          {selectedCatIds.length > 0 && (
            <div className="mb-3 space-y-1.5">
              {selectedCatIds.map((id, idx) => {
                const cat = categories.find((c) => c.id === id);
                if (!cat) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm text-white"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-yellow-500 text-[10px] font-bold text-black">
                      {idx + 1}
                    </span>
                    <span className="flex-1 font-medium">{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => moveCat(id, -1)}
                      disabled={idx === 0}
                      className="rounded px-1.5 py-0.5 text-xs transition hover:bg-neutral-800 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCat(id, 1)}
                      disabled={idx === selectedCatIds.length - 1}
                      className="rounded px-1.5 py-0.5 text-xs transition hover:bg-neutral-800 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCategory(id)}
                      className="rounded px-1.5 py-0.5 text-xs text-red-400 transition hover:bg-red-500/10"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* All categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCatIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                    isSelected
                      ? "border-yellow-500 bg-yellow-500 text-black"
                      : "border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-500 hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
          {categories.length === 0 && (
            <p className="text-xs text-neutral-600">Нет категорий. Создайте их в разделе «Категории».</p>
          )}
          {/* Hidden input for react-hook-form */}
          <input type="hidden" {...register("homepageCategoryIds")} />
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
          Контакты
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactPhone">Телефон</Label>
            <Input
              id="contactPhone"
              placeholder="+7 (999) 123-45-67"
              {...register("contactPhone")}
            />
          </div>
          <div>
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="info@fortecup.ru"
              {...register("contactEmail")}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="contactAddress">Адрес</Label>
          <Input
            id="contactAddress"
            placeholder="г. Москва, ул. Промышленная, д. 10"
            {...register("contactAddress")}
          />
        </div>
      </div>

      {/* Social */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
          Соцсети
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="instagramUrl">Instagram</Label>
            <Input
              id="instagramUrl"
              placeholder="https://instagram.com/fortecup"
              {...register("instagramUrl")}
            />
          </div>
          <div>
            <Label htmlFor="telegramUrl">Telegram</Label>
            <Input
              id="telegramUrl"
              placeholder="https://t.me/fortecup"
              {...register("telegramUrl")}
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <AdminButton type="submit" loading={isPending}>
        Сохранить настройки
      </AdminButton>
    </form>
  );
}
