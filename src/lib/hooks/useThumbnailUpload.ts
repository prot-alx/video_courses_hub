import { useState } from "react";
import { useToastContext } from "@/components/providers/ToastProvider";

interface UseThumbnailUploadProps {
  onThumbnailUpdated: (filename: string) => void;
}

interface UseThumbnailUploadReturn {
  isUploading: boolean;
  handleThumbnailUpload: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  getThumbnailUrl: (thumbnail: string | null) => string | null;
}

export function useThumbnailUpload({
  onThumbnailUpdated,
}: UseThumbnailUploadProps): UseThumbnailUploadReturn {
  const toast = useToastContext();
  const [isUploading, setIsUploading] = useState(false);

  const getThumbnailUrl = (thumbnail: string | null): string | null => {
    if (!thumbnail) return null;

    // Если уже полный путь
    if (thumbnail.startsWith("/uploads/")) {
      return `/api${thumbnail}`;
    }

    // Если только имя файла
    return `/api/uploads/thumbnails/${thumbnail}`;
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("thumbnail", file);

      const response = await fetch("/api/admin/upload/thumbnail", {
        method: "POST",
        body: uploadFormData,
      });

      const result = await response.json();

      if (result.success) {
        // Сохраняем только имя файла
        onThumbnailUpdated(result.data.filename);
        toast.success("Превью обновлено!", "Миниатюра курса успешно загружена");
      } else {
        toast.error(
          "Ошибка загрузки",
          result.error || "Ошибка загрузки превью"
        );
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      toast.error("Сетевая ошибка", "Ошибка загрузки превью");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    handleThumbnailUpload,
    getThumbnailUrl,
  };
}
