"use client";
import { useState, useEffect } from "react";
import { useToastContext } from "@/components/providers/ToastProvider";
import type { ApiResponse } from "@/types";

interface DurationStats {
  videosWithoutDuration: number;
  totalVideos: number;
}

// Типизация для видео из API админки
interface AdminVideoData {
  id: string;
  title: string;
  duration: number | null;
  filename: string;
  courseId: string;
}

// Типизация для результатов пересчёта
interface RecalculateResult {
  success: boolean;
  coursesUpdated: number;
  videosProcessed: number;
  errors?: string[];
}

export default function DurationUpdater() {
  const toast = useToastContext();
  const [stats, setStats] = useState<DurationStats | null>(null);
  const [updating, setUpdating] = useState(false);
  const [results, setResults] = useState<RecalculateResult | null>(null);

  const fetchStats = async () => {
    try {
      // Получаем статистику видео без длительности
      const response = await fetch("/api/admin/videos");
      const data: ApiResponse<AdminVideoData[]> = await response.json();

      if (data.success) {
        const videos = data.data || [];
        const totalVideos = videos.length;
        const videosWithoutDuration = videos.filter(
          (video) => !video.duration || video.duration === 0
        ).length;

        setStats({
          videosWithoutDuration,
          totalVideos,
        });
      }
    } catch (error) {
      console.error("Ошибка получения статистики видео:", error);
    }
  };

  const updateDurations = async () => {
    setUpdating(true);
    setResults(null);

    try {
      const response = await fetch("/api/admin/courses/recalculate-duration", {
        method: "POST",
      });

      const data: ApiResponse<RecalculateResult> = await response.json();

      if (data.success && data.data) {
        setResults(data.data);
        toast.success(
          "Длительность обновлена!",
          `Обработано ${data.data.videosProcessed} видео, обновлено ${data.data.coursesUpdated} курсов`
        );
        fetchStats(); // Обновляем статистику
      } else {
        toast.error(
          "Ошибка обновления",
          data.error || "Ошибка обновления длительности"
        );
      }
    } catch (error) {
      console.error("Ошибка обновления длительности:", error);
      toast.error("Сетевая ошибка", "Ошибка обновления длительности");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div
        className="p-4 rounded border animate-pulse"
        style={{
          background: "var(--color-primary-100)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
      </div>
    );
  }

  if (stats.videosWithoutDuration === 0) {
    return (
      <div
        className="p-4 rounded border"
        style={{
          background: "var(--color-success)",
          borderColor: "var(--color-primary-400)",
          color: "var(--color-text-primary)",
        }}
      >
        <div className="flex items-center gap-2">
          <span>✅</span>
          <span className="font-medium">
            Все видео имеют информацию о длительности ({stats.totalVideos} из{" "}
            {stats.totalVideos})
          </span>
        </div>
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
        ⏱️ Обновление длительности видео
      </h2>

      <div
        className="p-4 rounded border mb-4"
        style={{
          background: "var(--color-primary-100)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4
              className="font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              📊 Статистика видео
            </h4>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {stats.videosWithoutDuration} из {stats.totalVideos} видео не
              имеют информации о длительности
            </p>
          </div>
        </div>

        <button
          onClick={updateDurations}
          disabled={updating}
          className="btn-discord btn-discord-primary"
        >
          {updating ? "🔄 Пересчет..." : "🚀 Пересчитать длительность курсов"}
        </button>

        {/* Показываем результаты пересчёта */}
        {results && (
          <div
            className="mt-4 p-3 rounded border"
            style={{
              background: "var(--color-success-bg, #f0fff4)",
              borderColor: "var(--color-success, #10b981)",
            }}
          >
            <h5
              className="font-medium mb-2"
              style={{ color: "var(--color-success, #10b981)" }}
            >
              ✅ Результаты пересчёта:
            </h5>
            <ul
              className="text-sm space-y-1"
              style={{ color: "var(--color-text-primary)" }}
            >
              <li>• Курсов обновлено: {results.coursesUpdated}</li>
              <li>• Видео обработано: {results.videosProcessed}</li>
              {results.errors && results.errors.length > 0 && (
                <li>• Ошибок: {results.errors.length}</li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div
        className="text-xs p-3 rounded border"
        style={{
          background: "var(--color-primary-100)",
          borderColor: "var(--color-primary-400)",
          color: "var(--color-text-secondary)",
        }}
      >
        <p className="font-medium mb-1">ℹ️ Как это работает:</p>
        <ul className="space-y-1">
          <li>
            • Длительность видео определяется автоматически при загрузке в
            браузере
          </li>
          <li>
            • Общая длительность курса пересчитывается при изменении видео
          </li>
          <li>
            • Эта функция пересчитывает длительность всех курсов на основе их
            видео
          </li>
          <li>• Полезно для обновления данных после миграции или импорта</li>
        </ul>
      </div>
    </div>
  );
}
