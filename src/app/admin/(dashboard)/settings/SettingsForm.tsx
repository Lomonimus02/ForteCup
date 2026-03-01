"use client";

import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { Input, Textarea, Label, AdminButton } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { updateSettings } from "./actions";
import { SETTINGS_KEYS, type SettingsKey } from "./constants";
import toast from "react-hot-toast";

// ─── Types ───────────────────────────────

type SettingsData = Record<SettingsKey, string>;

interface SettingsFormProps {
  initialData: Record<string, string>;
}

// ─── Component ───────────────────────────

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const defaults: SettingsData = {} as SettingsData;
  for (const key of SETTINGS_KEYS) {
    defaults[key] = initialData[key] ?? "";
  }

  const { register, handleSubmit, setValue, watch } = useForm<SettingsData>({
    defaultValues: defaults,
  });

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
