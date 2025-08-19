// app/courses/[id]/page.tsx (обновленная версия)
"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCourseRequest } from "@/lib/hooks/useApi";
import { formatDuration, formatCourseDuration } from "@/lib/utils";

interface Params {
  id: string;
}

interface Video {
  id: string;
  title: string;
  isFree: boolean;
  duration: number | null;
  orderIndex: number;
  hasAccess: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  isFree: boolean;
  hasAccess: boolean;
  videosCount: number;
  freeVideosCount: number;
  videos: Video[];
  thumbnail: string | null;
}

interface RequestStatus {
  hasAccess: boolean;
  status: string;
  canRequest?: boolean;
  canCancel?: boolean;
  requestId?: string;
  createdAt?: string;
  processedAt?: string;
  grantedAt?: string;
  lastCancelled?: string;
}

export default function CoursePage({
  params,
}: Readonly<{ params: Promise<Params> }>) {
  const resolvedParams = use(params);
  const { isAuthenticated, user } = useAuth();
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

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${resolvedParams.id}`);
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
        alert(
          "Заявка отправлена! Администратор рассмотрит её в течение 24 часов. Если есть вопросы - напишите в Telegram через кнопку внизу экрана."
        );
      } else {
        alert(response.error || "Ошибка отправки заявки");
      }
    } catch (err) {
      console.log(err);
      alert("Ошибка отправки заявки! Подробности в консоли.");
    }
  };

  const handleCancelRequest = async () => {
    if (!course) return;

    try {
      const response = await cancelRequest(course.id);
      if (response.success) {
        await fetchRequestStatus();
        alert("Заявка отменена");
      } else {
        alert(response.error || "Ошибка отмены заявки");
      }
    } catch (err) {
      console.log(err);
      alert("Ошибка отмены заявки. Подробности в консоли.");
    }
  };

  // Функция для получения URL превьюшки
  const getThumbnailUrl = (thumbnail: string | null): string | null => {
    if (!thumbnail) return null;

    // Если уже полный путь
    if (thumbnail.startsWith("/uploads/")) {
      return `/api${thumbnail}`;
    }

    // Если только имя файла
    return `/api/uploads/thumbnails/${thumbnail}`;
  };

  const renderActionButton = () => {
    if (!course) return null;

    // Проверяем, является ли пользователь админом
    const isAdmin = user?.role === "ADMIN";

    // Для админа всегда показываем кнопку доступа
    if (isAdmin) {
      return (
        <button className="btn-discord btn-discord-success">
          ✓ Админский доступ
        </button>
      );
    }

    // Бесплатный курс
    if (course.isFree) {
      return (
        <button className="btn-discord btn-discord-primary">
          Смотреть бесплатно
        </button>
      );
    }

    // Не авторизован
    if (!isAuthenticated) {
      return (
        <Link href="/auth/signin" className="btn-discord btn-discord-primary">
          Войти для покупки
        </Link>
      );
    }

    // Есть доступ
    if (course.hasAccess) {
      return (
        <button className="btn-discord btn-discord-success">
          ✓ Доступ открыт
        </button>
      );
    }

    // Обработка заявок для обычных пользователей
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

    // По умолчанию для обычных пользователей
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
          {/* Course Info */}
          <div className="lg:col-span-2">
            <div
              className="p-6 rounded-lg border mb-6"
              style={{
                background: "var(--color-primary-300)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              {/* Course Thumbnail */}
              {thumbnailUrl && (
                <div className="mb-6">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
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
                </div>
              )}

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

          {/* Video List */}
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
                {course.videos.map((video, index) => (
                  <Link
                    key={video.id}
                    href={video.hasAccess ? `/videos/${video.id}` : "#"}
                    className={`channel-item block ${
                      !video.hasAccess ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-sm font-medium"
                        style={{ background: "var(--color-primary-400)" }}
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
                          {!video.hasAccess && !video.isFree && (
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
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
