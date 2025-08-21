"use client";
import { useState, useEffect } from "react";
import { useToastContext } from "@/components/providers/ToastProvider";

interface FileStats {
  videos: {
    total: number;
    unused: number;
    size: number;
  };
  thumbnails: {
    total: number;
    unused: number;
    size: number;
  };
}

export default function FileManager() {
  const toast = useToastContext();
  const [stats, setStats] = useState<FileStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/cleanup-files");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Ошибка получения статистики файлов:", error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupFiles = async (fileType?: "videos" | "thumbnails") => {
    if (
      !confirm("Удалить неиспользуемые файлы? Это действие нельзя отменить.")
    ) {
      return;
    }

    setCleaning(true);

    try {
      const response = await fetch("/api/admin/cleanup-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileType }),
      });

      const data = await response.json();

      if (data.success) {
        const { videos, thumbnails } = data.data;
        const totalDeleted = videos.deleted + thumbnails.deleted;
        const totalFailed = videos.failed + thumbnails.failed;

        toast.success(
          "Очистка завершена!",
          `Удалено файлов: ${totalDeleted}, ошибок: ${totalFailed}. Видео: удалено ${videos.deleted}, ошибок ${videos.failed}. Превью: удалено ${thumbnails.deleted}, ошибок ${thumbnails.failed}`
        );

        fetchStats(); // Обновляем статистику
      } else {
        toast.error("Ошибка очистки", data.error || "Ошибка очистки файлов");
      }
    } catch (error) {
      console.error("Ошибка очистки файлов:", error);
      toast.error("Сетевая ошибка", "Ошибка очистки файлов");
    } finally {
      setCleaning(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div
        className="p-4 rounded border animate-pulse"
        style={{
          background: "var(--color-primary-100)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

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
        🗂️ Управление файлами
      </h2>

      {stats && (
        <div className="space-y-4">
          {/* Статистика видеофайлов */}
          <div
            className="p-4 rounded border"
            style={{
              background: "var(--color-primary-100)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3
                className="font-medium"
                style={{ color: "var(--color-primary-400)" }}
              >
                🎥 Видеофайлы
              </h3>
              {stats.videos.unused > 0 && (
                <button
                  onClick={() => cleanupFiles("videos")}
                  disabled={cleaning}
                  className="text-sm px-3 py-1 rounded"
                  style={{
                    background: "var(--color-danger)",
                    color: "white",
                  }}
                >
                  {cleaning ? "Очистка..." : "Очистить"}
                </button>
              )}
            </div>
            <div
              className="text-sm space-y-1"
              style={{ color: "var(--color-primary-400)" }}
            >
              <div>Всего файлов: {stats.videos.total}</div>
              <div>
                Неиспользуемых: {stats.videos.unused}
                {stats.videos.unused > 0 && (
                  <span className="ml-1">
                    ({formatFileSize(stats.videos.size)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Статистика превью */}
          <div
            className="p-4 rounded border"
            style={{
              background: "var(--color-primary-100)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3
                className="font-medium"
                style={{ color: "var(--color-primary-400)" }}
              >
                🖼️ Превью курсов
              </h3>
              {stats.thumbnails.unused > 0 && (
                <button
                  onClick={() => cleanupFiles("thumbnails")}
                  disabled={cleaning}
                  className="text-sm px-3 py-1 rounded"
                  style={{
                    background: "var(--color-danger)",
                    color: "white",
                  }}
                >
                  {cleaning ? "Очистка..." : "Очистить"}
                </button>
              )}
            </div>
            <div
              className="text-sm space-y-1"
              style={{ color: "var(--color-primary-400)" }}
            >
              <div>Всего файлов: {stats.thumbnails.total}</div>
              <div>
                Неиспользуемых: {stats.thumbnails.unused}
                {stats.thumbnails.unused > 0 && (
                  <span className="ml-1">
                    ({formatFileSize(stats.thumbnails.size)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Общая очистка */}
          <div className="flex gap-3">
            <button
              onClick={() => cleanupFiles()}
              disabled={
                cleaning || stats.videos.unused + stats.thumbnails.unused === 0
              }
              className="btn-discord btn-discord-primary"
            >
              {cleaning ? "🔄 Очистка..." : "🧹 Очистить неиспользуемое"}
            </button>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="btn-discord btn-discord-secondary"
            >
              🔄 Обновить
            </button>
          </div>

          {stats.videos.unused + stats.thumbnails.unused === 0 && (
            <div
              className="text-center p-3 rounded"
              style={{
                background: "var(--color-success)",
                color: "var(--color-text-primary)",
              }}
            >
              ✅ Неиспользуемых файлов не найдено
            </div>
          )}
        </div>
      )}
    </div>
  );
}
