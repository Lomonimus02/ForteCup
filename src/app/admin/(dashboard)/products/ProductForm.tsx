"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Copy, Calculator } from "lucide-react";
import toast from "react-hot-toast";
import {
  Input,
  Textarea,
  Select,
  Label,
  AdminButton,
  Checkbox,
} from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { upsertProduct, deleteProduct } from "./actions";

// ─── Types ───────────────────────────────

interface VariantFormData {
  id?: string;
  sku: string;
  volume: string;
  colorOrDesign: string;
  pricePerPiece: string; // string for input, convert to number on submit
  piecesPerBox: string;
  boxPrice: string;
  inStock: boolean;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  imageBaseUrl: string;
  categoryId: string;
  isDraft: boolean;
  isPopular: boolean;
  variants: VariantFormData[];
}

interface CategoryOption {
  id: string;
  name: string;
  parentName: string | null;
}

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageBaseUrl: string | null;
    categoryId: string;
    isDraft: boolean;
    isPopular: boolean;
    variants: {
      id: string;
      sku: string;
      volume: string | null;
      colorOrDesign: string | null;
      pricePerPiece: number;
      piecesPerBox: number;
      boxPrice: number;
      inStock: boolean;
    }[];
  };
  categories: CategoryOption[];
}

// ─── Slug generator ──────────────────────

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[а-яё]/gi, (char) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
        з: "z", и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o",
        п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
        ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
      };
      return map[char.toLowerCase()] ?? char;
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Default variant ─────────────────────

const emptyVariant: VariantFormData = {
  sku: "",
  volume: "",
  colorOrDesign: "",
  pricePerPiece: "",
  piecesPerBox: "",
  boxPrice: "",
  inStock: true,
};

// ─── Component ───────────────────────────

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [autoSlug, setAutoSlug] = useState(!product);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      imageBaseUrl: product?.imageBaseUrl ?? "",
      categoryId: product?.categoryId ?? "",
      isDraft: product?.isDraft ?? false,
      isPopular: product?.isPopular ?? false,
      variants: product?.variants
        ? product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            volume: v.volume ?? "",
            colorOrDesign: v.colorOrDesign ?? "",
            pricePerPiece: String(v.pricePerPiece),
            piecesPerBox: String(v.piecesPerBox),
            boxPrice: String(v.boxPrice),
            inStock: v.inStock,
          }))
        : [{ ...emptyVariant }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // Watch name for auto-slug
  const watchName = watch("name");
  useEffect(() => {
    if (autoSlug && watchName) {
      setValue("slug", generateSlug(watchName));
    }
  }, [watchName, autoSlug, setValue]);

  // Watch variants for auto-boxPrice calculation
  const watchVariants = watch("variants");

  function autoCalcBoxPrice(index: number) {
    const ppp = parseFloat(watchVariants[index]?.pricePerPiece || "0");
    const ppb = parseInt(watchVariants[index]?.piecesPerBox || "0", 10);
    if (ppp > 0 && ppb > 0) {
      setValue(`variants.${index}.boxPrice`, String((ppp * ppb).toFixed(2)));
    }
  }

  function onSubmit(data: ProductFormData) {
    startTransition(async () => {
      const result = await upsertProduct({
        id: product?.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageBaseUrl: data.imageBaseUrl,
        categoryId: data.categoryId,
        isDraft: data.isDraft,
        isPopular: data.isPopular,
        variants: data.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          volume: v.volume,
          colorOrDesign: v.colorOrDesign,
          pricePerPiece: parseFloat(v.pricePerPiece) || 0,
          piecesPerBox: parseInt(v.piecesPerBox, 10) || 0,
          boxPrice: parseFloat(v.boxPrice) || 0,
          inStock: v.inStock,
        })),
      });

      if (result && "error" in result) {
        toast.error(result.error);
      } else {
        toast.success(product ? "Товар обновлён" : "Товар создан");
      }
    });
  }

  function handleDelete() {
    if (!product) return;
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (result && "error" in result) {
        toast.error(result.error);
        setDeleteConfirm(false);
      } else {
        toast.success("Товар удалён");
        router.push("/admin/products");
      }
    });
  }

  function duplicateVariant(index: number) {
    const source = watchVariants[index];
    append({
      ...source,
      id: undefined,
      sku: source.sku + "-copy",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      {/* ── Base Fields ── */}
      <section className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-bold">Основная информация</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="product-name" required>Название товара</Label>
            <Input
              id="product-name"
              placeholder="Blackout Double"
              {...register("name", { required: "Обязательное поле" })}
              error={errors.name?.message}
            />
          </div>

          <div>
            <Label htmlFor="product-slug" required>Slug (URL)</Label>
            <Input
              id="product-slug"
              placeholder="blackout-double"
              {...register("slug", { required: "Обязательное поле" })}
              error={errors.slug?.message}
              onChange={(e) => {
                setAutoSlug(false);
                register("slug").onChange(e);
              }}
            />
          </div>

          <div>
            <Label htmlFor="product-category" required>Категория</Label>
            <Select
              id="product-category"
              {...register("categoryId", { required: "Выберите категорию" })}
              error={errors.categoryId?.message}
            >
              <option value="">— Выберите —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentName ? `${c.parentName} → ` : ""}{c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-2">
            <ImageUpload
              label="Фото товара"
              value={watch("imageBaseUrl")}
              onChange={(url) => setValue("imageBaseUrl", url, { shouldDirty: true })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="product-desc">Описание</Label>
          <Textarea
            id="product-desc"
            placeholder="Описание товара..."
            rows={4}
            {...register("description")}
          />
        </div>

        <div className="flex gap-6">
          <Controller
            control={control}
            name="isDraft"
            render={({ field }) => (
              <Checkbox
                label="Черновик (скрыт из каталога)"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="isPopular"
            render={({ field }) => (
              <Checkbox
                label="Хит продаж"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </section>

      {/* ── Variants (B2B) ── */}
      <section className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Вариации (B2B)</h2>
            <p className="text-neutral-500 text-xs mt-1">
              Каждая вариация = 1 SKU. Цена за коробку рассчитывается автоматически.
            </p>
          </div>
          <AdminButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ ...emptyVariant })}
          >
            <Plus size={14} />
            Добавить вариацию
          </AdminButton>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border border-neutral-800 rounded-lg p-4 space-y-4 relative"
          >
            {/* Variant header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Вариация #{index + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => duplicateVariant(index)}
                  className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition"
                  title="Дублировать"
                >
                  <Copy size={14} />
                </button>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition"
                    title="Удалить"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Row 1: SKU, Volume, Color */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label required>Артикул (SKU)</Label>
                <Input
                  placeholder="DW-165-BLK"
                  {...register(`variants.${index}.sku`, { required: "Обязательно" })}
                  error={errors.variants?.[index]?.sku?.message}
                />
              </div>
              <div>
                <Label>Объём</Label>
                <Input
                  placeholder="165 мл"
                  {...register(`variants.${index}.volume`)}
                />
              </div>
              <div>
                <Label>Дизайн / цвет</Label>
                <Input
                  placeholder="Чёрный"
                  {...register(`variants.${index}.colorOrDesign`)}
                />
              </div>
            </div>

            {/* Row 2: Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <Label required>Цена за шт. (₽)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="2.00"
                  {...register(`variants.${index}.pricePerPiece`, {
                    required: "Обязательно",
                    onChange: () => autoCalcBoxPrice(index),
                  })}
                  error={errors.variants?.[index]?.pricePerPiece?.message}
                />
              </div>
              <div>
                <Label required>Штук в коробке</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="3000"
                  {...register(`variants.${index}.piecesPerBox`, {
                    required: "Обязательно",
                    onChange: () => autoCalcBoxPrice(index),
                  })}
                  error={errors.variants?.[index]?.piecesPerBox?.message}
                />
              </div>
              <div>
                <Label required>Цена коробки (₽)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="6000.00"
                    {...register(`variants.${index}.boxPrice`, { required: "Обязательно" })}
                    error={errors.variants?.[index]?.boxPrice?.message}
                  />
                  <button
                    type="button"
                    onClick={() => autoCalcBoxPrice(index)}
                    className="flex-shrink-0 p-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
                    title="Рассчитать автоматически"
                  >
                    <Calculator size={16} />
                  </button>
                </div>
              </div>
              <div className="pb-1">
                <Controller
                  control={control}
                  name={`variants.${index}.inStock`}
                  render={({ field }) => (
                    <Checkbox
                      label="В наличии"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-8 text-neutral-600">
            Нет вариаций. Нажмите «Добавить вариацию» выше.
          </div>
        )}
      </section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <AdminButton type="submit" loading={isPending}>
            {product ? "Сохранить" : "Создать товар"}
          </AdminButton>
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/products")}
          >
            Отмена
          </AdminButton>
        </div>

        {product && (
          <div>
            {deleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-sm">Точно удалить?</span>
                <AdminButton
                  type="button"
                  variant="danger"
                  size="sm"
                  loading={isPending}
                  onClick={handleDelete}
                >
                  Да, удалить
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirm(false)}
                >
                  Нет
                </AdminButton>
              </div>
            ) : (
              <AdminButton
                type="button"
                variant="danger"
                onClick={() => setDeleteConfirm(true)}
              >
                <Trash2 size={14} />
                Удалить товар
              </AdminButton>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
