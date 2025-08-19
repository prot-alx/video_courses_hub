// components/admin/SortableVideoList.tsx (обновленная версия с централизованными типами)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Video } from "@/types";

// Расширяем базовый Video для админских полей
interface AdminVideo extends Video {
  displayName: string;
  filename: string;
  createdAt: string;
}

interface SortableVideoListProps {
  videos: AdminVideo[];
  onEdit: (video: AdminVideo) => void;
  onDelete: (videoId: string, videoTitle: string) => void;
  deletingVideo: string | null;
}

export default function SortableVideoList({
  videos,
  onEdit,
  onDelete,
  deletingVideo,
}: Readonly<SortableVideoListProps>) {
  const [sortedVideos, setSortedVideos] = useState<AdminVideo[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Обновляем список при изменении пропса
  useEffect(() => {
    setSortedVideos([...videos].sort((a, b) => a.orderIndex - b.orderIndex));
  }, [videos]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newVideos = [...sortedVideos];
    const draggedVideo = newVideos[draggedIndex];

    // Удаляем из старой позиции
    newVideos.splice(draggedIndex, 1);
    // Вставляем в новую позиции
    newVideos.splice(dropIndex, 0, draggedVideo);

    setSortedVideos(newVideos);
    setDraggedIndex(null);
  };

  const saveOrder = async () => {
    setSaving(true);

    try {
      const videoIds = sortedVideos.map((video) => video.id);

      const response = await fetch("/api/admin/videos/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoIds }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Порядок видео сохранен!");
      } else {
        alert(result.error || "Ошибка сохранения порядка");
      }
    } catch (error) {
      console.error("Ошибка сохранения порядка:", error);
      alert("Ошибка сохранения порядка");
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`;
  };

  const formatFileSize = (filename: string) => {
    console.log(filename);
    // Примерная оценка, в реальности нужно получать размер файла
    return "~50-100MB";
  };

  // Проверяем, изменился ли порядок
  const hasOrderChanged = sortedVideos.some(
    (video, index) => video.orderIndex !== index
  );

  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎬</div>
        <h3
          className="text-lg font-medium mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          В курсе пока нет видео
        </h3>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Добавьте первое видео для начала работы с курсом
        </p>
      </div>
    );
  }

  return (
    <div>
      {hasOrderChanged && (
        <div
          className="p-3 rounded mb-4 flex items-center justify-between"
          style={{
            background: "var(--color-warning)",
            color: "var(--color-primary-300)",
          }}
        >
          <span className="text-sm font-medium">📋 Порядок видео изменен</span>
          <button
            onClick={saveOrder}
            disabled={saving}
            className="text-sm px-3 py-1 rounded"
            style={{
              background: "var(--color-primary-300)",
              color: "var(--color-text-primary)",
            }}
          >
            {saving ? "Сохранение..." : "Сохранить порядок"}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {sortedVideos.map((video, index) => (
          <div
            key={video.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`flex items-center justify-between p-4 rounded border cursor-move transition-all ${
              draggedIndex === index ? "opacity-50 scale-95" : ""
            }`}
            style={{
              background: "var(--color-primary-100)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-gray-400">☰</div>
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-sm font-medium"
                  style={{ background: "var(--color-primary-400)" }}
                >
                  {index + 1}
                </div>
              </div>
              <div>
                <h4
                  className="font-medium"
                  style={{ color: "var(--color-primary-400)" }}
                >
                  {video.displayName}
                </h4>
                <div
                  className="text-sm flex items-center gap-2"
                  style={{ color: "var(--color-primary-400)" }}
                >
                  <span>{video.filename}</span>
                  {video.duration && (
                    <span>• {formatDuration(video.duration)}</span>
                  )}
                  <span>• {formatFileSize(video.filename)}</span>
                  {video.isFree && (
                    <span
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        background: "var(--color-success)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Бесплатно
                    </span>
                  )}
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Добавлено:{" "}
                  {new Date(video.createdAt).toLocaleDateString("ru")}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/videos/${video.id}`}
                target="_blank"
                className="text-sm px-3 py-1 rounded hover:opacity-80"
                style={{ color: "var(--color-text-link)" }}
              >
                👁️ Просмотр
              </Link>
              <button
                onClick={() => onEdit(video)}
                className="text-sm px-3 py-1 rounded hover:opacity-80"
                style={{ color: "var(--color-text-link)" }}
              >
                ✏️ Изменить
              </button>
              <button
                onClick={() => onDelete(video.id, video.title)}
                disabled={deletingVideo === video.id}
                className="text-sm px-3 py-1 rounded hover:opacity-80 disabled:opacity-50"
                style={{ color: "var(--color-danger)" }}
              >
                {deletingVideo === video.id ? "⏳" : "🗑️"} Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
