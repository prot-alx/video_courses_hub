"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useDragAndDrop } from "@/lib/hooks/useDragAndDrop";
import { useVideoOrder } from "@/lib/hooks/useVideoOrder";
import { formatDuration } from "@/lib/utils/duration";
import { formatFileSize } from "@/lib/fileValidation";
import OrderChangeNotification from "./OrderChangeNotification";
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
  const { saving, saveOrder, hasOrderChanged, setOrderChanged } = useVideoOrder();
  
  const sortedInitialVideos = [...videos].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  const {
    draggedIndex,
    items: sortedVideos,
    setItems: setSortedVideos,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useDragAndDrop<AdminVideo>(sortedInitialVideos, setOrderChanged);

  // Обновляем список при изменении пропса
  useEffect(() => {
    const newSortedVideos = [...videos].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
    setSortedVideos(newSortedVideos);
  }, [videos, setSortedVideos]);

  const handleSaveOrder = async () => {
    const videoIds = sortedVideos.map((video) => video.id);
    await saveOrder(videoIds);
  };

  const orderChanged = hasOrderChanged(sortedVideos);

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
      {orderChanged && (
        <OrderChangeNotification saving={saving} onSaveOrder={handleSaveOrder} />
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
              background: "var(--color-primary-300)",
              borderColor: "var(--color-primary-400)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-primary-400)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--color-primary-300)"}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div style={{ color: "var(--color-text-secondary)" }}>☰</div>
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-sm font-medium"
                  style={{ 
                    background: "var(--color-primary-400)",
                    color: "var(--color-text-primary)"
                  }}
                >
                  {index + 1}
                </div>
              </div>
              <div>
                <h4
                  className="font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {video.displayName}
                </h4>
                <div
                  className="text-sm flex items-center gap-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <span>{video.filename}</span>
                  {video.duration && (
                    <span>• {formatDuration(video.duration, "short")}</span>
                  )}
                  <span>• {video.fileSize ? formatFileSize(video.fileSize) : "~50-100MB"}</span>
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
                className="btn-discord btn-discord-secondary text-xs px-2 py-1"
              >
                👁️ Просмотр
              </Link>
              <button
                onClick={() => onEdit(video)}
                className="btn-discord btn-discord-secondary text-xs px-2 py-1"
              >
                ✏️ Изменить
              </button>
              <button
                onClick={() => onDelete(video.id, video.title)}
                disabled={deletingVideo === video.id}
                className="btn-discord text-xs px-2 py-1 disabled:opacity-50"
                style={{
                  background: "var(--color-danger)",
                  color: "var(--color-text-primary)"
                }}
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
