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
import { upsertPortfolioWork, deletePortfolioWork } from "./actions";
import toast from "react-hot-toast";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// ─── Types ───────────────────────────────

interface PortfolioData {
  id?: string;
  clientName: string;
  description: string;
  imageUrl: string;
  isPublished: boolean;
}

interface PortfolioFormProps {
  work?: PortfolioData;
}

// ─── Component ───────────────────────────

export default function PortfolioForm({ work }: PortfolioFormProps) {
  const isEdit = !!work?.id;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PortfolioData>({
    defaultValues: work ?? {
      clientName: "",
      description: "",
      imageUrl: "",
      isPublished: false,
    },
  });

  function onSubmit(data: PortfolioData) {
    startTransition(async () => {
      const result = await upsertPortfolioWork({
        ...data,
        id: work?.id,
      });
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (!work?.id) return;
    if (!confirm("Удалить работу? Это действие необратимо.")) return;

    startTransition(async () => {
      const result = await deletePortfolioWork(work.id!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Работа удалена");
        router.push("/admin/portfolio");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/portfolio"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-white transition mb-3"
        >
          <ChevronLeft size={14} />
          Назад к портфолио
        </Link>
        <h1 className="text-2xl font-bold font-display tracking-tight">
          {isEdit ? "Редактировать работу" : "Новая работа"}
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          {isEdit
            ? `Редактирование: ${work?.clientName}`
            : "Добавление нового кейса брендирования"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Main */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
            Основное
          </h2>

          <div>
            <Label htmlFor="clientName" required>
              Название клиента / заведения
            </Label>
            <Input
              id="clientName"
              placeholder="Surf Coffee, Кофейня «Утро»"
              {...register("clientName", { required: "Обязательное поле" })}
              error={errors.clientName?.message}
            />
          </div>

          <div>
            <ImageUpload
              label="Главное фото"
              value={watch("imageUrl")}
              onChange={(url) => setValue("imageUrl", url, { shouldDirty: true })}
            />
          </div>

          <div>
            <Label htmlFor="description">Описание кейса</Label>
            <Textarea
              id="description"
              rows={6}
              placeholder="Брендирование 10 000 стаканов для сети кофеен..."
              {...register("description")}
            />
          </div>
        </div>

        {/* Settings */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
            Настройки
          </h2>
          <Checkbox label="Опубликовать на сайте" {...register("isPublished")} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <AdminButton type="submit" loading={isPending}>
            {isEdit ? "Сохранить" : "Создать работу"}
          </AdminButton>
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/portfolio")}
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
