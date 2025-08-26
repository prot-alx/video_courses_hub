import Link from "next/link";
import { useState } from "react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import type { Course } from "@/types";

interface CourseCardData extends Course {
  totalDuration: number;
}

interface CourseCardProps {
  course: CourseCardData;
  isAuthenticated?: boolean;
  hasAccess?: boolean;
  onPurchaseClick?: (courseId: string) => void;
}

export default function CourseCard({
  course,
  isAuthenticated = false,
  hasAccess = false,
  onPurchaseClick,
}: Readonly<CourseCardProps>) {
  const [imageError, setImageError] = useState(false);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`;
  };

  const handleActionClick = (e: React.MouseEvent) => {
    if (!course.isFree && !hasAccess && onPurchaseClick) {
      e.preventDefault();
      onPurchaseClick(course.id);
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

  const getActionButton = () => {
    if (course.isFree) {
      return (
        <Link
          href={`/courses/${course.id}`}
          className="btn-discord btn-discord-success w-full block text-center"
        >
          🆓 Смотреть бесплатно
        </Link>
      );
    }

    if (hasAccess) {
      return (
        <Link
          href={`/courses/${course.id}`}
          className="btn-discord btn-discord-success w-full block text-center"
        >
          🎥 Смотреть курс
        </Link>
      );
    }

    if (!isAuthenticated) {
      return (
        <Link
          href="/auth/signin"
          className="btn-discord btn-discord-secondary w-full block text-center"
        >
          🔐 Войти для покупки
        </Link>
      );
    }

    // Проверяем статус заявки
    if (course.requestStatus) {
      switch (course.requestStatus) {
        case "new":
          return (
            <Link
              href={`/courses/${course.id}`}
              className="btn-discord btn-discord-warning w-full block text-center"
            >
              ⏳ Заявка на рассмотрении
            </Link>
          );
        case "approved":
          return (
            <Link
              href={`/courses/${course.id}`}
              className="btn-discord btn-discord-success w-full block text-center"
            >
              🎥 Смотреть курс
            </Link>
          );
        case "rejected":
          return (
            <button
              onClick={handleActionClick}
              className="btn-discord btn-discord-primary w-full"
            >
              💰 Запросить повторно
            </button>
          );
      }
    }

    return (
      <button
        onClick={handleActionClick}
        className="btn-discord btn-discord-primary w-full"
      >
        💰 Запросить доступ
      </button>
    );
  };

  const thumbnailUrl = getThumbnailUrl(course.thumbnail);
  const shouldShowImage = thumbnailUrl && !imageError;

  return (
    <div
      className="p-6 rounded-lg border transition-all duration-200 hover:border-accent flex flex-col h-full"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      {/* Превью */}
      <div
        className="aspect-video rounded mb-4 flex items-center justify-center overflow-hidden relative"
        style={{ background: "var(--color-primary-400)" }}
      >
        {shouldShowImage ? (
          <OptimizedImage
            src={thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => {
              setImageError(true);
              console.log(
                `Ошибка загрузки превьюшки для курса: ${course.title}`
              );
            }}
            fallback={
              <span style={{ color: "var(--color-text-secondary)" }}>
                🎥 Превью курса
              </span>
            }
          />
        ) : (
          <span style={{ color: "var(--color-text-secondary)" }}>
            🎥 Превью курса
          </span>
        )}
      </div>

      {/* Заголовок и бейдж */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3
            className="font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {course.title}
          </h3>
          {/* Иконка доступа */}
          {!course.isFree && (
            <span
              title={
                hasAccess ? "У вас есть доступ к курсу" : "Курс требует покупки"
              }
              className="text-base"
            >
              {hasAccess ? "🔓" : "🔐"}
            </span>
          )}
        </div>
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            course.isFree
              ? "bg-success text-text-primary"
              : "bg-warning text-primary-300"
          }`}
          style={{
            background: course.isFree
              ? "var(--color-success)"
              : "var(--color-warning)",
            color: course.isFree
              ? "var(--color-text-primary)"
              : "var(--color-primary-300)",
          }}
        >
          {course.isFree ? "Бесплатно" : `${course.price}₽`}
        </span>
      </div>

      {/* Описание */}
      <p
        className="text-sm mb-4"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {course.shortDescription || "Описание курса скоро появится."}
      </p>

      {/* Метаинформация */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {course.videosCount} видео • {formatDuration(course.totalDuration)}
        </span>
      </div>

      {/* Кнопка действия */}
      <div className="mt-auto">{getActionButton()}</div>
    </div>
  );
}
