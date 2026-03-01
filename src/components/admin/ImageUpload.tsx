"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { uploadFile } from "@/app/admin/upload-action";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Только изображения (JPEG, PNG, WebP, AVIF, SVG)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Максимальный размер — 5 МБ");
        return;
      }

      setIsUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const result = await uploadFile(fd);

        if (result.success) {
          onChange(result.url);
          toast.success("Изображение загружено");
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error("Ошибка загрузки");
      } finally {
        setIsUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  // ── Drag & Drop handlers ──

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleRemove() {
    onChange("");
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
          {label}
        </label>
      )}

      {value ? (
        /* ── Preview state ── */
        <div className="group relative inline-block">
          <div className="relative h-44 w-44 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              sizes="176px"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
                title="Заменить"
              >
                {isUploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/80 text-white backdrop-blur transition hover:bg-red-500"
                title="Удалить"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          {/* Uploading overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/70">
              <Loader2 size={24} className="animate-spin text-accent" />
            </div>
          )}
        </div>
      ) : (
        /* ── Empty / drop-zone state ── */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={isUploading}
          className={`flex h-44 w-full max-w-[280px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition
            ${isDragging
              ? "border-accent bg-accent/10 text-accent"
              : "border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300"
            }
            disabled:pointer-events-none disabled:opacity-50`}
        >
          {isUploading ? (
            <>
              <Loader2 size={28} className="animate-spin text-accent" />
              <span className="text-xs font-medium">Загрузка…</span>
            </>
          ) : (
            <>
              <Upload size={28} />
              <span className="text-xs font-medium">
                {isDragging ? "Отпустите файл" : "Нажмите или перетащите"}
              </span>
              <span className="text-[10px] text-neutral-600">
                PNG, JPG, WebP, AVIF, SVG · до 5 МБ
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
