"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
];

export async function uploadFile(
  formData: FormData
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return { success: false, error: "Файл не выбран" };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Допустимые форматы: JPEG, PNG, WebP, AVIF, SVG",
      };
    }

    if (file.size > MAX_SIZE) {
      return { success: false, error: "Максимальный размер файла — 5 МБ" };
    }

    // Sanitize original filename: remove spaces, keep latin + digits + dots + hyphens
    const safeName = file.name
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    const uniqueName = `${Date.now()}-${safeName}`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Convert File to Buffer and write
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(uploadsDir, uniqueName), buffer);

    return { success: true, url: `/uploads/${uniqueName}` };
  } catch (error) {
    console.error("[uploadFile] Error:", error);
    return { success: false, error: "Ошибка загрузки файла на сервер" };
  }
}
