import { useState } from "react";
import { useToastContext } from "@/components/providers/ToastProvider";

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  uploading: boolean;
  uploadProgress: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  accept?: string;
  maxSizeInfo?: string;
  supportedFormats?: string;
}

export default function FileDropZone({
  onFileSelect,
  uploading,
  uploadProgress,
  fileInputRef,
  accept = "video/*",
  maxSizeInfo = "500 MB",
  supportedFormats = "MP4, WebM, MOV, AVI",
}: Readonly<FileDropZoneProps>) {
  const toast = useToastContext();
  const [isDragOver, setIsDragOver] = useState(false);

  // Обработчики drag & drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Проверяем, что мышь действительно покинула элемент, а не его дочерний элемент
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (uploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    if (files.length > 1) {
      toast.warning("Множественная загрузка", "Выберите только один видеофайл");
      return;
    }

    const file = files[0];
    onFileSelect(file);
  };

  const handleFileInputClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-all duration-200 ${
          isDragOver ? "border-accent bg-accent/10 scale-[1.02]" : ""
        } ${
          uploading
            ? "pointer-events-none opacity-60"
            : "cursor-pointer hover:border-accent/70"
        }`}
        style={{
          borderColor: isDragOver
            ? "var(--color-accent)"
            : "var(--color-primary-400)",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileInputClick}
      >
        <div
          className={`text-4xl mb-4 transition-transform duration-200 ${
            isDragOver ? "scale-110" : ""
          }`}
        >
          {isDragOver ? "⬇️" : "🎥"}
        </div>
        <h3
          className="text-lg font-medium mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          {isDragOver
            ? "Отпустите файл для загрузки"
            : "Выберите или перетащите видеофайл"}
        </h3>
        <p
          className="text-sm mb-4"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Поддерживаемые форматы: {supportedFormats}
          <br />
          Максимальный размер: {maxSizeInfo}
          <br />
          {isDragOver ? "" : "Перетащите файл сюда или нажмите для выбора"}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
          disabled={uploading}
          className="hidden"
          id="video-upload"
        />
        {!isDragOver && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleFileInputClick();
            }}
            disabled={uploading}
            className={`btn-discord ${
              uploading ? "btn-discord-secondary" : "btn-discord-primary"
            } transition-all duration-200`}
          >
            {uploading ? "Загрузка..." : "Выбрать файл"}
          </button>
        )}
      </div>

      {uploading && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {uploadProgress < 5
                ? "Определение длительности..."
                : "Загрузка видео..."}
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              {uploadProgress}%
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ background: "var(--color-primary-400)" }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                background: "var(--color-accent)",
                width: `${uploadProgress}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
