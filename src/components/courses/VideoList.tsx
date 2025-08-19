// components/courses/VideoList.tsx (обновленная версия с централизованными типами)
import VideoItem from "./VideoItem";
import type { Video } from "@/types/course";

interface VideoListProps {
  videos: Video[];
  courseId: string;
  courseIsFree: boolean;
  hasAccess: boolean;
}

export default function VideoList({
  videos,
  courseId,
  courseIsFree,
  hasAccess,
}: Readonly<VideoListProps>) {
  const sortedVideos = [...videos].sort((a, b) => a.orderIndex - b.orderIndex);

  // Логика доступа к видео:
  // - Если курс бесплатный - все видео доступны
  // - Если есть доступ к курсу - все видео доступны
  // - Иначе доступны только бесплатные видео
  const getVideoAccess = (video: Video) => {
    if (courseIsFree || hasAccess) return true;
    return video.isFree;
  };

  if (videos.length === 0) {
    return (
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
        <div
          className="text-center py-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          В курсе пока нет видео
        </div>
      </div>
    );
  }

  return (
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
          {sortedVideos.map((video, index) => (
            <VideoItem
              key={video.id}
              video={video}
              index={index}
              isAccessible={getVideoAccess(video)}
              courseId={courseId}
            />
          ))}
        </div>
        {/* Статистика */}
        <div
          className="mt-6 pt-4 border-t"
          style={{ borderColor: "var(--color-primary-400)" }}
        >
          <div
            className="text-sm space-y-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <div>Всего видео: {videos.length}</div>
            <div>Бесплатных: {videos.filter((v) => v.isFree).length}</div>
            <div>
              Доступно вам:{" "}
              {sortedVideos.filter((v) => getVideoAccess(v)).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
