// app/admin/courses/[id]/videos/page.tsx (обновленная версия)
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import VideoUploadForm from "@/components/admin/VideoUploadForm";
import VideoEditModal from "@/components/admin/VideoEditModal";
import SortableVideoList from "@/components/admin/SortableVideoList";

interface Video {
  id: string;
  title: string;
  displayName: string;
  description: string | null;
  filename: string;
  orderIndex: number;
  isFree: boolean;
  duration: number | null;
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  videos: Video[];
}

interface DiskInfo {
  total: string;
  used: string;
  available: string;
  usePercentage: string;
}

export default function ManageVideosPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const resolvedParams = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diskInfo, setDiskInfo] = useState<DiskInfo | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setCourse(data.data);
        setError(null);
      } else {
        setError(data.error || "Курс не найден");
      }
    } catch (err) {
      setError("Ошибка загрузки курса");
      console.error("Ошибка загрузки курса:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiskInfo = async () => {
    try {
      const response = await fetch("/api/admin/upload/video");
      const data = await response.json();
      if (data.success) {
        setDiskInfo(data.data);
      }
    } catch (err) {
      console.error("Ошибка получения информации о диске:", err);
    }
  };

  const handleDeleteVideo = async (videoId: string, videoTitle: string) => {
    if (
      !confirm(
        `Удалить видео "${videoTitle}"?\n\nЭто действие нельзя отменить.`
      )
    ) {
      return;
    }

    setDeletingVideo(videoId);

    try {
      const response = await fetch(`/api/admin/videos?id=${videoId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        alert("Видео успешно удалено");
        fetchCourse(); // Обновляем список видео
        fetchDiskInfo(); // Обновляем информацию о диске
      } else {
        alert(result.error || "Ошибка удаления видео");
      }
    } catch (err) {
      console.error("Ошибка удаления видео:", err);
      alert("Ошибка удаления видео");
    } finally {
      setDeletingVideo(null);
    }
  };

  const handleVideoAdded = () => {
    fetchCourse();
    fetchDiskInfo();
  };

  useEffect(() => {
    fetchCourse();
    fetchDiskInfo();
  }, [resolvedParams.id]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`;
  };

  const formatFileSize = (filename: string) => {
    // Примерная оценка, в реальности нужно получать размер файла
    return "~50-100MB";
  };

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--color-primary-200)" }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--color-primary-200)" }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Курс не найден
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/admin" className="btn-discord btn-discord-primary">
              Вернуться к курсам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      {/* Header */}
      <header
        className="border-b px-6 py-4"
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="btn-discord btn-discord-secondary">
              ← К курсам
            </Link>
            <Link
              href={`/admin/courses/${resolvedParams.id}`}
              className="btn-discord btn-discord-secondary"
            >
              ← К редактированию
            </Link>
            <h1
              className="text-xl font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              🎥 Видео курса: {course.title}
            </h1>
          </div>

          {/* Disk Space Info */}
          {diskInfo && (
            <div
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              💾 Свободно: {diskInfo.available} / {diskInfo.total}
              {diskInfo.usePercentage !== "N/A" && (
                <span className="ml-2">({diskInfo.usePercentage} занято)</span>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Upload Form */}
        <div className="mb-6">
          <VideoUploadForm
            courseId={resolvedParams.id}
            onVideoAdded={handleVideoAdded}
          />
        </div>

        {/* Videos List */}
        <div
          className="p-6 rounded-lg border"
          style={{
            background: "var(--color-primary-300)",
            borderColor: "var(--color-primary-400)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Видео курса ({course.videos.length})
            </h2>

            {course.videos.length > 0 && (
              <div
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Общая длительность:{" "}
                {formatDuration(
                  course.videos.reduce(
                    (acc, video) => acc + (video.duration || 0),
                    0
                  )
                )}
              </div>
            )}
          </div>

          {course.videos.length === 0 ? (
            <SortableVideoList
              videos={[]}
              onEdit={setEditingVideo}
              onDelete={handleDeleteVideo}
              deletingVideo={deletingVideo}
            />
          ) : (
            <SortableVideoList
              videos={course.videos}
              onEdit={setEditingVideo}
              onDelete={handleDeleteVideo}
              deletingVideo={deletingVideo}
            />
          )}
        </div>

        {/* Video Edit Modal */}
        <VideoEditModal
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
          onSave={handleVideoAdded}
        />
      </main>
    </div>
  );
}
