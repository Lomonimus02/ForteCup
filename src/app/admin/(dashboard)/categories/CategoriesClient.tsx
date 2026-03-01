"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, FolderOpen, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Dialog,
  Input,
  Select,
  Label,
  AdminButton,
} from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { createCategory, updateCategory, deleteCategory } from "./actions";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: string | null;
  parentName: string | null;
  childrenCount: number;
  productsCount: number;
}

interface CategoriesClientProps {
  categories: CategoryRow[];
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Отделяем корневые от дочерних для визуального дерева
  const rootCategories = categories.filter((c) => !c.parentId);
  const getChildren = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId);

  function openCreateDialog() {
    setEditingCategory(null);
    setDialogOpen(true);
  }

  function openEditDialog(cat: CategoryRow) {
    setEditingCategory(cat);
    setDialogOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = editingCategory
        ? await updateCategory(formData)
        : await createCategory(formData);

      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(editingCategory ? "Категория обновлена" : "Категория создана");
        setDialogOpen(false);
        router.refresh();
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteCategory(id);
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("Категория удалена");
      }
      setDeleteConfirmId(null);
      router.refresh();
    });
  }

  // Slug generator
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

  function renderCategoryRow(cat: CategoryRow, depth: number = 0) {
    const children = getChildren(cat.id);
    return (
      <tbody key={cat.id}>
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
              {depth > 0 && (
                <ChevronRight size={14} className="text-neutral-600" />
              )}
              <FolderOpen size={16} className="text-neutral-500" />
              <span className="font-medium text-white">{cat.name}</span>
            </div>
          </TableCell>
          <TableCell>
            <code className="text-xs bg-neutral-800 px-2 py-0.5 rounded">{cat.slug}</code>
          </TableCell>
          <TableCell>
            {cat.parentName ? (
              <Badge variant="info">{cat.parentName}</Badge>
            ) : (
              <span className="text-neutral-600 text-xs">Корневая</span>
            )}
          </TableCell>
          <TableCell className="text-center">{cat.productsCount}</TableCell>
          <TableCell className="text-center">{cat.childrenCount}</TableCell>
          <TableCell>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditDialog(cat)}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition"
                title="Редактировать"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setDeleteConfirmId(cat.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition"
                title="Удалить"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </TableCell>
        </TableRow>
        {children.map((child) => renderCategoryRow(child, depth + 1))}
      </tbody>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Категории</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Управление деревом категорий ({categories.length} шт.)
          </p>
        </div>
        <AdminButton onClick={openCreateDialog}>
          <Plus size={16} />
          Добавить
        </AdminButton>
      </div>

      {/* Categories Table */}
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Название</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Родитель</TableHead>
            <TableHead className="text-center">Товары</TableHead>
            <TableHead className="text-center">Дочерние</TableHead>
            <TableHead className="w-[100px]">Действия</TableHead>
          </tr>
        </TableHeader>
        {rootCategories.map((cat) => renderCategoryRow(cat))}
        {categories.length === 0 && (
          <tbody>
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-neutral-600">
                Нет категорий. Нажмите &laquo;Добавить&raquo; для создания.
              </td>
            </tr>
          </tbody>
        )}
      </Table>

      {/* Create / Edit Dialog */}
      <CategoryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        category={editingCategory}
        allCategories={categories}
        onSubmit={handleSubmit}
        isPending={isPending}
        generateSlug={generateSlug}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Удалить категорию?"
      >
        <p className="text-neutral-400 text-sm mb-6">
          Это действие необратимо. Убедитесь, что в категории нет товаров и подкатегорий.
        </p>
        <div className="flex gap-3 justify-end">
          <AdminButton variant="secondary" onClick={() => setDeleteConfirmId(null)}>
            Отмена
          </AdminButton>
          <AdminButton
            variant="danger"
            loading={isPending}
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
          >
            Удалить
          </AdminButton>
        </div>
      </Dialog>
    </div>
  );
}

// ─── Category Dialog (Create / Edit) ─────

function CategoryDialog({
  open,
  onClose,
  category,
  allCategories,
  onSubmit,
  isPending,
  generateSlug,
}: {
  open: boolean;
  onClose: () => void;
  category: CategoryRow | null;
  allCategories: CategoryRow[];
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
  generateSlug: (name: string) => string;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [parentId, setParentId] = useState(category?.parentId ?? "");
  const [imageUrl, setImageUrl] = useState(category?.imageUrl ?? "");
  const [autoSlug, setAutoSlug] = useState(!category);

  // Reset when dialog opens with different category
  const isEditing = !!category;

  // Update fields when category changes
  if (open && category && name !== category.name && slug !== category.slug) {
    setName(category.name);
    setSlug(category.slug);
    setParentId(category.parentId ?? "");
    setImageUrl(category.imageUrl ?? "");
    setAutoSlug(false);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (autoSlug) {
      setSlug(generateSlug(value));
    }
  }

  // Available parents = all categories except self and own children
  const availableParents = allCategories.filter((c) => {
    if (!category) return true;
    return c.id !== category.id && c.parentId !== category.id;
  });

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        setName("");
        setSlug("");
        setParentId("");
        setImageUrl("");
        setAutoSlug(true);
      }}
      title={isEditing ? "Редактировать категорию" : "Новая категория"}
    >
      <form
        action={onSubmit}
        className="space-y-4"
        onReset={() => {
          setName("");
          setSlug("");
          setParentId("");
          setImageUrl("");
          setAutoSlug(true);
        }}
      >
        {isEditing && <input type="hidden" name="id" value={category!.id} />}

        <div>
          <Label htmlFor="cat-name" required>Название</Label>
          <Input
            id="cat-name"
            name="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Двухслойные стаканы"
            required
          />
        </div>

        <div>
          <Label htmlFor="cat-slug" required>Slug (URL)</Label>
          <Input
            id="cat-slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setAutoSlug(false);
            }}
            placeholder="double-wall"
            required
          />
        </div>

        <div>
          <Label htmlFor="cat-parent">Родительская категория</Label>
          <Select
            id="cat-parent"
            name="parentId"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">— Корневая (без родителя) —</option>
            {availableParents.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentName ? `${c.parentName} → ` : ""}{c.name}
              </option>
            ))}
          </Select>
        </div>

        <input type="hidden" name="imageUrl" value={imageUrl} />
        <ImageUpload
          label="Изображение категории"
          value={imageUrl}
          onChange={setImageUrl}
        />

        <div className="flex gap-3 justify-end pt-2">
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => {
              onClose();
              setName("");
              setSlug("");
              setParentId("");
              setImageUrl("");
              setAutoSlug(true);
            }}
          >
            Отмена
          </AdminButton>
          <AdminButton type="submit" loading={isPending}>
            {isEditing ? "Сохранить" : "Создать"}
          </AdminButton>
        </div>
      </form>
    </Dialog>
  );
}
