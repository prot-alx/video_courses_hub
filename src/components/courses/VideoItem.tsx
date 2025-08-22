import Link from "next/link";
import { formatDuration } from "@/lib/utils/duration";
import type { Video } from "@/types";

interface VideoItemProps {
  video: Video;
  index: number;
  isAccessible: boolean; // может ли пользователь смотреть это видео
  courseId: string;
}

export default function VideoItem({
  video,
  index,
  isAccessible,
  courseId,
}: Readonly<VideoItemProps>) {
  const content = (
    <div className="flex items-center gap-3">
      {/* Номер видео */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-sm font-medium"
        style={{
          background: "var(--color-primary-400)",
          color: "var(--color-text-primary)",
        }}
      >
        {index + 1}
      </div>
      {/* Информация о видео */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4
            className={`font-medium truncate ${
              isAccessible ? "" : "opacity-60"
            }`}
            style={{ color: "var(--color-text-primary)" }}
          >
            {video.title}
          </h4>
          {/* Бейдж "FREE" */}
          {video.isFree && (
            <span
              className="text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0"
              style={{
                background: "var(--color-success)",
                color: "var(--color-text-primary)",
              }}
            >
              FREE
            </span>
          )}
        </div>
        {/* Длительность */}
        <div className="flex items-center gap-2">
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {formatDuration(video.duration, "compact")}
          </p>
          {/* Замок для недоступных видео */}
          {!isAccessible && (
            <span
              className="text-xs"
              style={{ color: "var(--color-text-secondary)" }}
            >
              🔒 Требуется доступ к курсу
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Если видео доступно - делаем ссылкой
  if (isAccessible) {
    return (
      <Link
        href={`/videos/${video.id}?course=${courseId}`}
        className="channel-item block"
      >
        {content}
      </Link>
    );
  }

  // Если недоступно - просто div
  return <div className="channel-item cursor-not-allowed">{content}</div>;
}
