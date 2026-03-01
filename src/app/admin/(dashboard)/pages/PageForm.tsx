"use client";

import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Input,
  Textarea,
  Label,
  AdminButton,
  Checkbox,
} from "@/components/admin/ui";
import { upsertPage, deletePage } from "./actions";
import toast from "react-hot-toast";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// ─── Transliteration ─────────────────────

const cyrMap: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
  я: "ya",
};

function transliterate(str: string): string {
  return str
    .toLowerCase()
    .split("")
    .map((ch) => cyrMap[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── Types ───────────────────────────────

interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
}

interface PageFormProps {
  page?: PageData;
}

// ─── Component ───────────────────────────

export default function PageForm({ page }: PageFormProps) {
  const isEdit = !!page?.id;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PageData>({
    defaultValues: page ?? {
      title: "",
      slug: "",
      content: "",
      isPublished: false,
    },
  });

  const title = watch("title");

  function handleTitleBlur() {
    const currentSlug = watch("slug");
    if (!currentSlug && title) {
      setValue("slug", transliterate(title));
    }
  }

  function onSubmit(data: PageData) {
    startTransition(async () => {
      const result = await upsertPage({
        ...data,
        id: page?.id,
      });
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (!page?.id) return;
    if (!confirm("Удалить страницу? Это действие необратимо.")) return;

    startTransition(async () => {
      const result = await deletePage(page.id!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Страница удалена");
        router.push("/admin/pages");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-white transition mb-3"
        >
          <ChevronLeft size={14} />
          Назад к страницам
        </Link>
        <h1 className="text-2xl font-bold font-display tracking-tight">
          {isEdit ? "Редактировать страницу" : "Новая страница"}
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          {isEdit ? `Редактирование: ${page?.title}` : "Создание новой CMS-страницы"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Main content */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
            Основное
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" required>
                Заголовок
              </Label>
              <Input
                id="title"
                placeholder="О компании"
                {...register("title", { required: "Обязательное поле", onBlur: handleTitleBlur })}
                error={errors.title?.message}
              />
            </div>
            <div>
              <Label htmlFor="slug" required>
                Slug (URL)
              </Label>
              <Input
                id="slug"
                placeholder="about"
                {...register("slug", { required: "Обязательное поле" })}
                error={errors.slug?.message}
              />
              <p className="text-neutral-600 text-[11px] mt-1">
                Страница будет доступна по адресу: /{watch("slug") || "slug"}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="content">HTML-контент</Label>
            <Textarea
              id="content"
              rows={20}
              placeholder="<h2>Подзаголовок</h2>\n<p>Текст страницы...</p>"
              {...register("content")}
              error={errors.content?.message}
              className="font-mono text-sm"
            />
            <p className="text-neutral-600 text-[11px] mt-1">
              Поддерживается HTML. Используйте теги: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;img&gt;
            </p>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
            Настройки
          </h2>
          <Checkbox label="Опубликовать" {...register("isPublished")} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <AdminButton type="submit" loading={isPending}>
            {isEdit ? "Сохранить" : "Создать страницу"}
          </AdminButton>
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/pages")}
          >
            Отмена
          </AdminButton>
          {isEdit && (
            <AdminButton
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={isPending}
              className="ml-auto"
            >
              Удалить
            </AdminButton>
          )}
        </div>
      </form>
    </div>
  );
}
