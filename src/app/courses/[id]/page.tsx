"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToastContext } from "@/components/providers/ToastProvider";
import { useCourseRequest } from "@/lib/hooks/useApi";
import { formatDuration, formatCourseDuration } from "@/lib/utils";
import VideoPlayer from "@/components/videos/VideoPlayer";
import type { Course, Video } from "@/types/course";
import { RequestStatus } from "@/types";

interface Params {
  id: string;
}

export default function CoursePage({
  params,
}: Readonly<{ params: Promise<Params> }>) {
  const resolvedParams = use(params);
  const { isAuthenticated, user } = useAuth();
  const toast = useToastContext();
  const {
    createRequest,
    cancelRequest,
    getRequestStatus,
    loading: requestLoading,
  } = useCourseRequest();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(
    null
  );

  // Новое состояние для выбранного видео
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedVideoDetails, setSelectedVideoDetails] =
    useState<Video | null>(null);
  const [loadingVideoDetails, setLoadingVideoDetails] = useState(false);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setCourse(data.data);
        setError(null);

        // Автоматически выбираем первое доступное видео
        const sortedVideos = [...data.data.videos].sort(
          (a, b) => a.orderIndex - b.orderIndex
        );
        const firstAccessible = sortedVideos.find((video: Video) => {
          if (data.data.isFree || data.data.hasAccess || user?.role === "ADMIN")
            return true;
          return video.isFree;
        });

        if (firstAccessible) {
          setSelectedVideo(firstAccessible);
          fetchVideoDetails(firstAccessible.id);
        }
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

  // Функция для загрузки детальной информации о видео
  const fetchVideoDetails = async (videoId: string) => {
    try {
      setLoadingVideoDetails(true);
      const response = await fetch(`/api/videos/${videoId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedVideoDetails(data.data);
      } else {
        console.error("Ошибка загрузки деталей видео:", data.error);
      }
    } catch (err) {
      console.error("Ошибка загрузки деталей видео:", err);
    } finally {
      setLoadingVideoDetails(false);
    }
  };

  const fetchRequestStatus = async () => {
    if (!isAuthenticated || !course) return;

    try {
      const response = await getRequestStatus(course.id);
      if (response.success && response.data) {
        setRequestStatus(response.data);
      }
    } catch (err) {
      console.error("Ошибка получения статуса заявки:", err);
    }
  };

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  useEffect(() => {
    if (course && isAuthenticated) {
      fetchRequestStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, isAuthenticated]);

  const handlePurchaseRequest = async () => {
    if (!course || !user?.email) return;

    try {
      const response = await createRequest(course.id, "email");
      if (response.success) {
        await fetchRequestStatus();
        toast.success(
          "Заявка отправлена!",
          "Администратор рассмотрит её в течение 24 часов. Если есть вопросы - напишите в Telegram через кнопку внизу экрана."
        );
      } else {
        toast.error(
          "Ошибка отправки",
          response.error || "Ошибка отправки заявки"
        );
      }
    } catch (err) {
      console.log(err);
      toast.error(
        "Ошибка отправки",
        "Ошибка отправки заявки! Подробности в консоли."
      );
    }
  };

  const handleCancelRequest = async () => {
    if (!course) return;

    try {
      const response = await cancelRequest(course.id);
      if (response.success) {
        await fetchRequestStatus();
        toast.success("Заявка отменена");
      } else {
        toast.error("Ошибка отмены", response.error || "Ошибка отмены заявки");
      }
    } catch (err) {
      console.log(err);
      toast.error(
        "Ошибка отмены",
        "Ошибка отмены заявки. Подробности в консоли."
      );
    }
  };

  // Проверка доступа к видео
  const getVideoAccess = (video: Video): boolean => {
    if (!course) return false;

    const isAdmin = user?.role === "ADMIN";
    if (isAdmin) return true;

    if (course.isFree || course.hasAccess) return true;
    return video.isFree;
  };

  // Обработчик выбора видео
  const handleVideoSelect = (video: Video) => {
    if (getVideoAccess(video)) {
      setSelectedVideo(video);
      setSelectedVideoDetails(null); // Сбрасываем предыдущие детали
      fetchVideoDetails(video.id); // Загружаем новые детали
    }
  };

  // Функция для получения URL превьюшки
  const getThumbnailUrl = (thumbnail: string | null): string | null => {
    if (!thumbnail) return null;

    if (thumbnail.startsWith("/uploads/")) {
      return `/api${thumbnail}`;
    }

    return `/api/uploads/thumbnails/${thumbnail}`;
  };

  const renderActionButton = () => {
    if (!course) return null;

    const isAdmin = user?.role === "ADMIN";

    if (isAdmin) {
      return (
        <button className="btn-discord btn-discord-success">
          ✓ Админский доступ
        </button>
      );
    }

    if (course.isFree) {
      return null;
    }

    if (!isAuthenticated) {
      return (
        <Link href="/auth/signin" className="btn-discord btn-discord-primary">
          Войти для покупки
        </Link>
      );
    }

    if (course.hasAccess) {
      return (
        <button className="btn-discord btn-discord-success">
          ✓ Доступ открыт
        </button>
      );
    }

    if (requestStatus) {
      switch (requestStatus.status) {
        case "new":
          return (
            <button
              onClick={handleCancelRequest}
              disabled={requestLoading}
              className="btn-discord btn-discord-secondary"
            >
              Отменить заявку
            </button>
          );
        case "approved":
          return (
            <button className="btn-discord btn-discord-success">
              ✓ Заявка одобрена
            </button>
          );
        case "rejected":
          return (
            <button
              onClick={handlePurchaseRequest}
              disabled={requestLoading}
              className="btn-discord btn-discord-primary"
            >
              Отправить заявку повторно
            </button>
          );
        default:
          return (
            <button
              onClick={handlePurchaseRequest}
              disabled={requestLoading}
              className="btn-discord btn-discord-primary"
            >
              Отправить заявку
            </button>
          );
      }
    }

    return (
      <button
        onClick={handlePurchaseRequest}
        disabled={requestLoading}
        className="btn-discord btn-discord-primary"
      >
        Отправить заявку
      </button>
    );
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
            <Link href="/" className="btn-discord btn-discord-primary">
              Вернуться к курсам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const thumbnailUrl = getThumbnailUrl(course.thumbnail);
  const sortedVideos = [...course.videos].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

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
          <Link href="/" className="btn-discord btn-discord-secondary">
            ← Назад к курсам
          </Link>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            📚 VideoCourses
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - плеер и информация о курсе */}
          <div className="lg:col-span-2">
            {/* Видео плеер */}
            {selectedVideo ? (
              <div className="mb-6">
                <VideoPlayer
                  key={selectedVideo.id}
                  videoId={selectedVideo.id}
                  hasAccess={getVideoAccess(selectedVideo)}
                  title={selectedVideo.title}
                  className="mb-4"
                />

                {/* Информация о выбранном видео */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h2
                      className="text-xl font-bold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {selectedVideo.title}
                    </h2>
                    {selectedVideo.isFree && (
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
                    {formatDuration(selectedVideo.duration, "compact")}
                  </span>
                </div>

                {/* Описание видео */}
                <div
                  className="p-4 rounded-lg border mb-6"
                  style={{
                    background: "var(--color-primary-300)",
                    borderColor: "var(--color-primary-400)",
                  }}
                >
                  <h3
                    className="text-sm font-semibold mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Описание
                  </h3>

                  {loadingVideoDetails ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      <span
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Загрузка описания...
                      </span>
                    </div>
                  ) : selectedVideoDetails?.description ? (
                    <div
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {selectedVideoDetails.description}
                    </div>
                  ) : (
                    <p
                      className="text-sm italic"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Описание пока не добавлено.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Превьюшка курса, если нет выбранного видео */
              <div className="mb-6">
                {thumbnailUrl ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                    <Image
                      src={thumbnailUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                      onError={() => {
                        console.log("Ошибка загрузки превьюшки курса");
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-full aspect-video rounded-lg flex items-center justify-center mb-4"
                    style={{ background: "var(--color-primary-400)" }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎬</div>
                      <p style={{ color: "var(--color-text-secondary)" }}>
                        Выберите видео для просмотра
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Информация о курсе */}
            <div
              className="p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-300)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {course.title}
                  </h1>
                  <div className="flex items-center gap-4 mb-4">
                    {course.isFree ? (
                      <span
                        className="px-3 py-1 text-sm rounded-full font-medium"
                        style={{
                          background: "var(--color-success)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        Бесплатно
                      </span>
                    ) : (
                      <span
                        className="px-3 py-1 text-sm rounded-full font-medium"
                        style={{
                          background: "var(--color-warning)",
                          color: "var(--color-primary-300)",
                        }}
                      >
                        {course.price}₽
                      </span>
                    )}
                    <span
                      className="text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {course.videos.length} видео •{" "}
                      {formatCourseDuration(course.videos, "short")}
                    </span>
                  </div>
                </div>
              </div>

              <p
                className="text-base leading-relaxed mb-6"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {course.description}
              </p>

              {renderActionButton()}
            </div>
          </div>

          {/* Правая колонка - список видео */}
          <div className="lg:col-span-1">
            <div
              className="p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-300)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                Содержание курса
              </h3>

              <div className="space-y-3">
                {sortedVideos.map((video, index) => {
                  const hasAccess = getVideoAccess(video);
                  const isSelected = selectedVideo?.id === video.id;

                  return (
                    <button
                      key={video.id}
                      onClick={() => handleVideoSelect(video)}
                      disabled={!hasAccess}
                      className={`channel-item block w-full text-left ${
                        !hasAccess ? "opacity-60 cursor-not-allowed" : ""
                      } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-sm font-medium"
                          style={{
                            background: isSelected
                              ? "var(--color-accent)"
                              : "var(--color-primary-400)",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4
                              className="font-medium truncate"
                              style={{ color: "var(--color-text-primary)" }}
                            >
                              {video.title}
                            </h4>
                            {video.isFree && (
                              <span
                                className="text-xs px-2 py-1 rounded-full ml-2"
                                style={{
                                  background: "var(--color-success)",
                                  color: "var(--color-text-primary)",
                                }}
                              >
                                FREE
                              </span>
                            )}
                            {!hasAccess && !video.isFree && (
                              <span
                                className="text-xs px-2 py-1 rounded-full ml-2"
                                style={{
                                  background: "var(--color-primary-400)",
                                  color: "var(--color-text-secondary)",
                                }}
                              >
                                🔒
                              </span>
                            )}
                          </div>
                          <p
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {formatDuration(video.duration, "compact")}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
