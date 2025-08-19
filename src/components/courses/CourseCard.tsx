import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    price: number | null;
    isFree: boolean;
    videosCount: number;
    totalDuration: number; // в секундах
    thumbnail: string | null; // Добавлено поле для превьюшки
  };
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
    if (course.isFree || hasAccess) {
      return (
        <Link
          href={`/courses/${course.id}`}
          className="btn-discord btn-discord-primary w-full block text-center"
        >
          {course.isFree ? "Смотреть бесплатно" : "Открыть курс"}
        </Link>
      );
    }

    if (!isAuthenticated) {
      return (
        <button className="btn-discord btn-discord-secondary w-full" disabled>
          Войдите для покупки
        </button>
      );
    }

    return (
      <button
        onClick={handleActionClick}
        className="btn-discord btn-discord-primary w-full"
      >
        Купить курс
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
          <Image
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
          />
        ) : (
          <span style={{ color: "var(--color-text-secondary)" }}>
            🎥 Превью курса
          </span>
        )}
      </div>

      {/* Заголовок и бейдж */}
      <div className="flex items-center justify-between mb-2">
        <h3
          className="font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {course.title}
        </h3>
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
        {course.description}
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
