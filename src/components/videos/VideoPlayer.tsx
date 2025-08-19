// components/videos/VideoPlayer.tsx (обновленная версия)
"use client";

import { useState } from "react";

interface VideoPlayerProps {
  videoId: string;
  hasAccess: boolean;
  poster?: string;
  title?: string;
  className?: string;
}

export default function VideoPlayer({
  videoId,
  hasAccess,
  poster,
  title,
  className = "",
}: Readonly<VideoPlayerProps>) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!hasAccess) {
    return (
      <div
        className={`aspect-video rounded-lg flex items-center justify-center ${className}`}
        style={{ background: "var(--color-primary-400)" }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🔒</div>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Доступ к видео ограничен
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`aspect-video rounded-lg flex items-center justify-center ${className}`}
        style={{ background: "var(--color-primary-400)" }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Ошибка загрузки видео
          </p>
          <button
            onClick={() => {
              setError(false);
              setLoading(true);
            }}
            className="mt-2 text-sm px-3 py-1 rounded"
            style={{
              background: "var(--color-primary-300)",
              color: "var(--color-text-primary)",
            }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`aspect-video rounded-lg overflow-hidden relative ${className}`}
      style={{ background: "var(--color-primary-400)" }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-2"></div>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Загрузка видео...
            </p>
          </div>
        </div>
      )}

      <video
        controls
        className="w-full h-full"
        poster={poster}
        preload="metadata"
        controlsList="nodownload"
        onLoadStart={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        style={{
          display: loading ? "none" : "block",
        }}
      >
        <source src={`/api/videos/${videoId}/stream`} type="video/mp4" />
        <track kind="captions" />
        Ваш браузер не поддерживает воспроизведение видео.
      </video>
    </div>
  );
}
