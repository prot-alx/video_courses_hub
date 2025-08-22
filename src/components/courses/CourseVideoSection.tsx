import Image from "next/image";
import VideoPlayer from "@/components/videos/VideoPlayer";
import { formatDuration } from "@/lib/utils/duration";
import type { Course, Video } from "@/types";

interface CourseVideoSectionProps {
  course: Course;
  selectedVideo: Video | null;
  selectedVideoDetails: Video | null;
  loadingVideoDetails: boolean;
  getVideoAccess: (video: Video) => boolean;
  getThumbnailUrl: (thumbnail: string | null) => string | null;
}

export default function CourseVideoSection({
  course,
  selectedVideo,
  selectedVideoDetails,
  loadingVideoDetails,
  getVideoAccess,
  getThumbnailUrl,
}: Readonly<CourseVideoSectionProps>) {
  const thumbnailUrl = getThumbnailUrl(course.thumbnail);

  if (selectedVideo) {
    return (
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
    );
  }

  // Превьюшка курса, если нет выбранного видео
  return (
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
  );
}
