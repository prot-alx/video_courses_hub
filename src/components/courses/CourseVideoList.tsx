import { formatDuration } from "@/lib/utils";
import type { Video } from "@/types/course";

interface CourseVideoListProps {
  videos: Video[];
  selectedVideo: Video | null;
  getVideoAccess: (video: Video) => boolean;
  onVideoSelect: (video: Video) => void;
}

export default function CourseVideoList({
  videos,
  selectedVideo,
  getVideoAccess,
  onVideoSelect,
}: Readonly<CourseVideoListProps>) {
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

      <div className="space-y-3">
        {videos.map((video, index) => {
          const hasAccess = getVideoAccess(video);
          const isSelected = selectedVideo?.id === video.id;

          return (
            <button
              key={video.id}
              onClick={() => onVideoSelect(video)}
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
  );
}
