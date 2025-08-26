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
      <video
        ref={videoRef}
        controls
        className="w-full h-full"
        poster={poster}
        preload="metadata"
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

      {/* Кнопка фулскрина */}
      <button
        onClick={handleVideoDoubleClick}
        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-all duration-200"
        style={{
          opacity: loading ? 0 : 1,
          pointerEvents: loading ? "none" : "auto",
        }}
        title="Полноэкранный режим"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15,3 21,3 21,9" />
          <polyline points="9,21 3,21 3,15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      </button>

      {/* Дополнительные стили для скрытия кнопок скачивания */}
      <style jsx>{`
        video::-webkit-media-controls-download-button {
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
