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
import { ImageUpload } from "@/components/admin/ImageUpload";
import { upsertPost, deletePost } from "./actions";
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

interface PostData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  isPublished: boolean;
}

interface PostFormProps {
  post?: PostData;
}

// ─── Component ───────────────────────────

export default function PostForm({ post }: PostFormProps) {
  const isEdit = !!post?.id;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostData>({
    defaultValues: post ?? {
      title: "",
      slug: "",
      content: "",
      imageUrl: "",
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

  function onSubmit(data: PostData) {
    startTransition(async () => {
      const result = await upsertPost({
        ...data,
        id: post?.id,
      });
      if (result?.error) {
        toast.error(result.error);
      }
      // redirect happens server-side on success
    });
  }

  function handleDelete() {
    if (!post?.id) return;
    if (!confirm("Удалить статью? Это действие необратимо.")) return;

    startTransition(async () => {
      const result = await deletePost(post.id!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Статья удалена");
        router.push("/admin/blog");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-white transition mb-3"
        >
          <ChevronLeft size={14} />
          Назад к статьям
        </Link>
        <h1 className="text-2xl font-bold font-display tracking-tight">
          {isEdit ? "Редактировать статью" : "Новая статья"}
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          {isEdit ? `Редактирование: ${post?.title}` : "Создание новой статьи блога"}
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
                placeholder="Как выбрать бумажный стакан"
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
                placeholder="kak-vybrat-bumazhnyy-stakan"
                {...register("slug", { required: "Обязательное поле" })}
                error={errors.slug?.message}
              />
            </div>
          </div>

          <div>
            <ImageUpload
              label="Обложка статьи"
              value={watch("imageUrl")}
              onChange={(url) => setValue("imageUrl", url, { shouldDirty: true })}
            />
          </div>

          <div>
            <Label htmlFor="content">Содержание</Label>
            <Textarea
              id="content"
              rows={12}
              placeholder="Текст статьи (Markdown или HTML)..."
              {...register("content")}
              error={errors.content?.message}
            />
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
            {isEdit ? "Сохранить" : "Создать статью"}
          </AdminButton>
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/blog")}
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
