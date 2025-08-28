import { useState, useEffect, useRef } from "react";
import { useToastContext } from "@/components/providers/ToastProvider";
import { uploadFileWithProgress } from "@/lib/uploadWithProgress";
import { validateVideoFile } from "@/lib/fileValidation";
import type { ApiResponse } from "@/types";

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  type: string;
  duration?: number | null;
}

export interface VideoMetadata {
  displayName: string;
  description: string;
  isFree: boolean;
  orderIndex: number;
}

interface AdminVideoData {
  id: string;
  title: string;
  orderIndex: number;
  courseId: string;
  filename: string;
  duration: number | null;
  fileSize: number | null;
}

interface UseVideoUploadProps {
  courseId: string;
  onVideoAdded?: () => void;
}

interface UseVideoUploadReturn {
  // Upload state
  uploading: boolean;
  uploadProgress: number;
  uploadedFile: UploadedFile | null;

  // Form state
  videoMetadata: VideoMetadata;
  nextOrderIndex: number;

  // File input ref
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  // Actions
  handleFileUpload: (file: File) => Promise<void>;
  handleCreateVideo: () => Promise<void>;
  handleCancel: () => Promise<void>;
  updateVideoMetadata: (updates: Partial<VideoMetadata>) => void;
  resetForm: () => void;
}

export function useVideoUpload({
  courseId,
  onVideoAdded,
}: UseVideoUploadProps): UseVideoUploadReturn {
  const toast = useToastContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata>({
    displayName: "",
    description: "",
    isFree: false,
    orderIndex: 0,
  });
  const [nextOrderIndex, setNextOrderIndex] = useState(0);

  // Получаем следующий порядковый номер при загрузке компонента
  useEffect(() => {
    const fetchNextOrderIndex = async () => {
      try {
        const response = await fetch(`/api/admin/videos?courseId=${courseId}`);
        const result: ApiResponse<AdminVideoData[]> = await response.json();

        if (result.success && result.data) {
          const maxOrder = result.data.reduce(
            (max: number, video: AdminVideoData) =>
              Math.max(max, video.orderIndex),
            -1
          );
          const nextIndex = maxOrder + 1;
          setNextOrderIndex(nextIndex);
          setVideoMetadata((prev) => ({ ...prev, orderIndex: nextIndex }));
        }
      } catch (error) {
        console.error("Ошибка получения порядкового номера:", error);
      }
    };

    fetchNextOrderIndex();
  }, [courseId]);

  // Функция для определения длительности видео в браузере
  const getVideoDurationFromFile = (file: File): Promise<number | null> => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          const duration = Math.round(video.duration);
          resolve(isNaN(duration) ? null : duration);
        };

        video.onerror = () => {
          window.URL.revokeObjectURL(video.src);
          resolve(null);
        };

        video.src = URL.createObjectURL(file);
      } catch (error) {
        console.error("Ошибка определения длительности:", error);
        resolve(null);
      }
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Клиентская валидация файла
      const validationResult = await validateVideoFile(file);
      if (!validationResult.isValid) {
        toast.error(
          "Недопустимый файл",
          validationResult.error || "Файл не прошёл проверку"
        );
        return;
      }

      // Определяем длительность видео в браузере
      const duration = await getVideoDurationFromFile(file);

      // Загружаем с реальным прогрессом
      const result = await uploadFileWithProgress(
        "/api/admin/upload/video",
        file,
        "video",
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (result.success && result.data?.success) {
        // Добавляем длительность к данным файла
        const fileWithDuration: UploadedFile = {
          ...result.data.data,
          duration: duration, // Используем длительность из браузера
        };

        setUploadedFile(fileWithDuration);

        // Создаем читаемое название из оригинального имени файла
        const cleanTitle = result.data.data.originalName
          .replace(/\.[^/.]+$/, "") // Убираем расширение
          .replace(/[_-]/g, " ") // Заменяем _ и - на пробелы
          .replace(/([a-z])([A-Z])/g, "$1 $2") // Разделяем camelCase
          .trim();

        setVideoMetadata((prev) => ({
          ...prev,
          displayName: cleanTitle,
        }));

        toast.success("Файл загружен!", "Видеофайл успешно загружен на сервер");
      } else {
        toast.error(
          "Ошибка загрузки",
          result.error || result.data?.error || "Ошибка загрузки файла"
        );
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      toast.error("Ошибка загрузки", "Ошибка загрузки файла");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
      // Сбрасываем значение input для возможности повторного выбора того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCreateVideo = async () => {
    if (!uploadedFile || !videoMetadata.displayName.trim()) {
      toast.warning("Не все поля заполнены", "Заполните все обязательные поля");
      return;
    }

    try {
      const response = await fetch("/api/admin/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          title: videoMetadata.displayName, // Для совместимости
          displayName: videoMetadata.displayName,
          description: videoMetadata.description.trim() || null,
          filename: uploadedFile.filename,
          isFree: videoMetadata.isFree,
          orderIndex: videoMetadata.orderIndex,
          duration: uploadedFile.duration, // Передаем длительность
          fileSize: uploadedFile.size, // Передаем размер файла
        }),
      });

      const result: ApiResponse<AdminVideoData> = await response.json();

      if (result.success) {
        // Сбрасываем форму
        resetForm();
        toast.success("Видео добавлено!", "Видео успешно добавлено в курс");
        onVideoAdded?.();
      } else {
        toast.error("Ошибка создания", result.error || "Ошибка создания видео");
      }
    } catch (error) {
      console.error("Ошибка создания видео:", error);
      toast.error("Ошибка создания", "Ошибка создания видео");
    }
  };

  const handleCancel = async () => {
    if (uploadedFile) {
      // Удаляем загруженный файл с сервера
      try {
        await fetch(
          `/api/admin/upload/cleanup?filename=${uploadedFile.filename}&type=video`,
          {
            method: "DELETE",
          }
        );
      } catch (error) {
        console.error("Ошибка удаления файла:", error);
      }
    }

    // Сбрасываем состояние
    setUploadedFile(null);
    setVideoMetadata({
      displayName: "",
      description: "",
      isFree: false,
      orderIndex: nextOrderIndex,
    });
  };

  const updateVideoMetadata = (updates: Partial<VideoMetadata>) => {
    setVideoMetadata((prev) => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setUploadedFile(null);
    setVideoMetadata({
      displayName: "",
      description: "",
      isFree: false,
      orderIndex: nextOrderIndex + 1,
    });
    setNextOrderIndex((prev) => prev + 1);
  };

  return {
    // Upload state
    uploading,
    uploadProgress,
    uploadedFile,

    // Form state
    videoMetadata,
    nextOrderIndex,

    // File input ref
    fileInputRef,

    // Actions
    handleFileUpload,
    handleCreateVideo,
    handleCancel,
    updateVideoMetadata,
    resetForm,
  };
}
