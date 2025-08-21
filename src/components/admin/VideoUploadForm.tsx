// components/admin/VideoUploadForm.tsx (обновленная версия с типизацией)
"use client";
import { useState, useEffect } from "react";
import { useToastContext } from "@/components/providers/ToastProvider";
import { uploadFileWithProgress } from "@/lib/uploadWithProgress";
import { validateVideoFile } from "@/lib/fileValidation";
import type { ApiResponse } from "@/types";

interface VideoUploadFormProps {
  courseId: string;
  onVideoAdded?: () => void;
}

interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  type: string;
  duration?: number | null;
}

// Типизация для видео из API
interface AdminVideoData {
  id: string;
  title: string;
  orderIndex: number;
  courseId: string;
  filename: string;
  duration: number | null;
}

export default function VideoUploadForm({
  courseId,
  onVideoAdded,
}: Readonly<VideoUploadFormProps>) {
  const toast = useToastContext();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [videoMetadata, setVideoMetadata] = useState({
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

  const handleFileUpload = async (file: File) => {
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

      if (result.success && result.data.success) {
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
    }
  };

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
        }),
      });

      const result: ApiResponse<AdminVideoData> = await response.json();

      if (result.success) {
        // Сбрасываем форму
        setUploadedFile(null);
        setVideoMetadata({
          displayName: "",
          description: "",
          isFree: false,
          orderIndex: nextOrderIndex + 1,
        });
        setNextOrderIndex((prev) => prev + 1);

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

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div
      className="p-6 rounded-lg border"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--color-text-primary)" }}
      >
        ➕ Добавить новое видео
      </h2>

      {!uploadedFile ? (
        /* Шаг 1: Загрузка файла */
        <div>
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center mb-4"
            style={{ borderColor: "var(--color-primary-400)" }}
          >
            <div className="text-4xl mb-4">🎥</div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Выберите видеофайл
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Поддерживаемые форматы: MP4, WebM, MOV, AVI
              <br />
              Максимальный размер: 500 MB
            </p>

            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              disabled={uploading}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className={`btn-discord ${
                uploading ? "btn-discord-secondary" : "btn-discord-primary"
              } cursor-pointer`}
            >
              {uploading ? "Загрузка..." : "Выбрать файл"}
            </label>
          </div>

          {uploading && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {uploadProgress < 5
                    ? "Определение длительности..."
                    : "Загрузка видео..."}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {uploadProgress}%
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ background: "var(--color-primary-400)" }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    background: "var(--color-accent)",
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Шаг 2: Настройка метаданных */
        <div>
          <div
            className="p-4 rounded border mb-4"
            style={{
              background: "var(--color-primary-200)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <h4
                  className="font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {uploadedFile.originalName}
                </h4>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {formatFileSize(uploadedFile.size)} • {uploadedFile.type}
                  {uploadedFile.duration && (
                    <span>
                      {" "}
                      • {Math.floor(uploadedFile.duration / 60)}м{" "}
                      {uploadedFile.duration % 60}с
                    </span>
                  )}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Файл на сервере: {uploadedFile.filename}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Название видео *
              </label>
              <input
                type="text"
                value={videoMetadata.displayName}
                onChange={(e) =>
                  setVideoMetadata((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                className="input-discord w-full"
                placeholder="Введите название видео"
                maxLength={200}
              />
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Это название будет отображаться пользователям (
                {videoMetadata.displayName.length}/200)
              </p>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Описание видео
              </label>
              <textarea
                value={videoMetadata.description}
                onChange={(e) =>
                  setVideoMetadata((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="input-discord w-full min-h-[100px] resize-y"
                placeholder="Введите описание видео (необязательно)"
                maxLength={2000}
                rows={4}
              />
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Краткое описание содержания видео (
                {videoMetadata.description.length}/2000)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Порядковый номер
                </label>
                <input
                  type="number"
                  value={videoMetadata.orderIndex}
                  onChange={(e) =>
                    setVideoMetadata((prev) => ({
                      ...prev,
                      orderIndex: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="input-discord w-full"
                  min="0"
                />
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Определяет порядок в списке видео
                </p>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={videoMetadata.isFree}
                  onChange={(e) =>
                    setVideoMetadata((prev) => ({
                      ...prev,
                      isFree: e.target.checked,
                    }))
                  }
                  className="checkbox-discord"
                />
                <label
                  htmlFor="isFree"
                  className="text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Бесплатное видео
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateVideo}
                className="btn-discord btn-discord-primary"
                disabled={!videoMetadata.displayName.trim()}
              >
                Создать видео
              </button>
              <button
                onClick={handleCancel}
                className="btn-discord btn-discord-secondary"
              >
                Отменить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
