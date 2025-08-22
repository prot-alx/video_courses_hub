import Image from "next/image";
import { useThumbnailUpload } from "@/lib/hooks/useThumbnailUpload";

interface ThumbnailUploaderProps {
  thumbnail: string;
  onThumbnailUpdated: (filename: string) => void;
  isSubmitting: boolean;
}

export default function ThumbnailUploader({
  thumbnail,
  onThumbnailUpdated,
  isSubmitting,
}: Readonly<ThumbnailUploaderProps>) {
  const { isUploading, handleThumbnailUpload, getThumbnailUrl } =
    useThumbnailUpload({
      onThumbnailUpdated,
    });

  const thumbnailUrl = getThumbnailUrl(thumbnail);

  return (
    <div>
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: "var(--color-text-primary)" }}
      >
        Превью курса
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={handleThumbnailUpload}
        disabled={isSubmitting || isUploading}
        className="w-full px-3 py-2 rounded border"
        style={{
          background: "var(--color-primary-100)",
          borderColor: "var(--color-primary-400)",
          color: "var(--color-primary-500)",
        }}
      />

      {/* Предпросмотр */}
      {thumbnail && thumbnailUrl && (
        <div className="mt-3">
          <div
            className="relative w-full max-w-sm h-32 rounded border overflow-hidden"
            style={{ borderColor: "var(--color-primary-400)" }}
          >
            <Image
              src={thumbnailUrl}
              alt="Превью курса"
              fill
              className="object-cover"
              sizes="(max-width: 400px) 100vw, 400px"
              onError={() => {
                console.log("Ошибка загрузки изображения");
              }}
            />
          </div>
        </div>
      )}

      <p
        className="text-xs mt-2"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Загрузите изображение (JPG, PNG, WebP, макс. 5MB). Рекомендуемое
        соотношение: 16:9, минимум 800x450px
      </p>

      {isUploading && (
        <div className="flex items-center mt-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
          <span style={{ color: "var(--color-text-secondary)" }}>
            Загрузка...
          </span>
        </div>
      )}
    </div>
  );
}
