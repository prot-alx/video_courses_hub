"use client";
import { useState, useRef } from "react";

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
  className = "",
}: Readonly<VideoPlayerProps>) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  // Обработчик двойного клика для фулскрина
  const handleVideoDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (videoRef.current) {
      if (document.fullscreenElement) {
        // Выходим из фулскрина
        document.exitFullscreen();
      } else {
        // Входим в фулскрин
        videoRef.current.requestFullscreen().catch((err) => {
          console.log("Ошибка входа в фулскрин:", err);
        });
      }
    }
  };

  // Обработчики защиты от скачивания
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Блокируем только правый клик (контекстное меню)
    return false;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault(); // Блокируем перетаскивание
    return false;
  };

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
      {(loading || buffering) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-2"></div>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {loading ? "Загрузка видео..." : "Буферизация..."}
            </p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        controls
        className="w-full h-full"
        poster={poster}
        preload="none"
        controlsList="nodownload noremoteplaycast" // ← Убрали nofullscreen, разрешаем фулскрин
        disablePictureInPicture // ← Отключаем картинка-в-картинке
        onContextMenu={handleContextMenu} // ← Блокируем только правый клик
        onDragStart={handleDragStart} // ← Блокируем перетаскивание
        onClick={handleVideoClick} // ← Добавляем клик для паузы/плея
        onDoubleClick={handleVideoDoubleClick} // ← Добавляем двойной клик для фулскрина
        onLoadStart={() => setLoading(true)}
        onLoadedData={() => setLoading(false)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onPlaying={() => setBuffering(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        style={{
          display: loading ? "none" : "block",
          userSelect: "none", // ← CSS: запрет выделения текста
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          cursor: "pointer", // ← Показываем, что можно кликать
        }}
      >
        <source src={`/api/videos/${videoId}/stream`} type="video/mp4" />
        <track kind="captions" />
        Ваш браузер не поддерживает воспроизведение видео.
      </video>

      {/* Дополнительные стили для скрытия кнопок скачивания */}
      <style jsx>{`
        video::-webkit-media-controls-download-button {
          display: none !important;
        }
        video::-webkit-media-controls-fullscreen-button {
          display: none !important;
        }
        video::-webkit-media-controls-picture-in-picture-button {
          display: none !important;
        }
        video {
          outline: none;
        }
      `}</style>
    </div>
  );
}
