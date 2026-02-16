"use client";

import { useCallback, useState, useRef } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  currentImageURL?: string | null;
  onUpload: (file: File) => Promise<string>;
  onDelete?: () => Promise<void>;
  shape?: "rectangle" | "circle";
  className?: string;
}

export default function ImageUploader({
  currentImageURL,
  onUpload,
  onDelete,
  shape = "rectangle",
  className = "",
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageURL ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError("");
      setUploading(true);
      try {
        const url = await onUpload(file);
        setPreview(url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "アップロードに失敗しました");
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function handleDelete() {
    if (!onDelete) return;
    setError("");
    setUploading(true);
    try {
      await onDelete();
      setPreview(null);
    } catch {
      setError("削除に失敗しました");
    } finally {
      setUploading(false);
    }
  }

  const isCircle = shape === "circle";
  const containerClass = isCircle
    ? "h-32 w-32 rounded-full"
    : "h-48 w-full rounded-lg";

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative flex cursor-pointer items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:border-primary ${containerClass} overflow-hidden`}
      >
        {preview ? (
          <Image
            src={preview}
            alt="プレビュー"
            fill
            className="object-cover"
          />
        ) : (
          <div className="text-center text-sm text-gray-500">
            <p>クリックまたはドラッグ&ドロップ</p>
            <p className="text-xs">JPEG / PNG / WebP（5MB以下）</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <p className="text-sm text-gray-600">アップロード中...</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />

      {preview && onDelete && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={uploading}
          className="mt-2 text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          画像を削除
        </button>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
