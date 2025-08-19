// app/videos/[id]/page.tsx (обновленная версия с централизованными типами)
"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import VideoPlayer from "@/components/videos/VideoPlayer";
import { formatDuration } from "@/lib/utils";
import type { VideoDetails } from "@/types/course";

interface Params {
  id: string;
}

export default function VideoPage({
  params,
}: Readonly<{ params: Promise<Params> }>) {
  const resolvedParams = use(params);
  const { isAuthenticated } = useAuth();

  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/videos/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setVideo(data.data);
        setError(null);
      } else {
        setError(data.error || "Видео не найдено");
      }
    } catch (err) {
      setError("Ошибка загрузки видео");
      console.error("Ошибка загрузки видео:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const formatDurationLocal = (seconds: number | null) => {
    return formatDuration(seconds, "compact");
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

  if (error || !video) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--color-primary-200)" }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Видео не найдено
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/" className="btn-discord btn-discord-primary">
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
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href={`/courses/${video.courseId}`}
            className="btn-discord btn-discord-secondary"
          >
            ← Назад к курсу
          </Link>
          <div>
            <h1
              className="text-lg font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {video.title}
            </h1>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              из курса {video.courseTitle}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {video.hasAccess ? (
          /* Video Player */
          <div className="mb-8">
            {/* Используем компонент VideoPlayer */}
            <VideoPlayer
              videoId={video.id}
              hasAccess={video.hasAccess}
              title={video.title}
              className="mb-4"
            />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {video.title}
                </h2>
                {video.isFree && (
                  <span
                    className="px-2 py-1 text-xs rounded-full font-medium"
                    style={{
                      background: "var(--color-success)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    FREE
                  </span>
                )}
              </div>
              <span
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {formatDurationLocal(video.duration)}
              </span>
            </div>

            <div
              className="p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-300)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--color-text-primary)" }}
              >
                Описание
              </h3>
              <div
                className="leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {video.description ? (
                  <div className="whitespace-pre-wrap">{video.description}</div>
                ) : (
                  <p className="italic">Описание пока не добавлено.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Access Denied */
          <div className="text-center py-16">
            <div
              className="p-8 rounded-lg border max-w-md mx-auto"
              style={{
                background: "var(--color-primary-300)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <div className="text-6xl mb-4">🔒</div>
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                Доступ ограничен
              </h2>
              <p
                className="mb-6"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Для просмотра этого видео необходимо приобрести курс.
              </p>
              <div className="space-y-3">
                {isAuthenticated ? (
                  <button className="btn-discord btn-discord-primary w-full">
                    Открыть курс
                  </button>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="btn-discord btn-discord-primary w-full block text-center"
                  >
                    Войти для покупки
                  </Link>
                )}
                <Link
                  href={`/courses/${video.courseId}`}
                  className="btn-discord btn-discord-secondary w-full block text-center"
                >
                  Подробнее о курсе
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
