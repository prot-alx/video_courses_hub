import Image from "next/image";
import Link from "next/link";
import { useThumbnailUpload } from "@/lib/hooks/useThumbnailUpload";

interface CourseFormData {
  title: string;
  description: string;
  price: string;
  isFree: boolean;
  isActive: boolean;
  thumbnail: string;
}

interface CourseEditFormProps {
  formData: CourseFormData;
  onFormDataChange: (updates: Partial<CourseFormData>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export default function CourseEditForm({
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting,
  error,
}: Readonly<CourseEditFormProps>) {
  const { isUploading, handleThumbnailUpload, getThumbnailUrl } =
    useThumbnailUpload({
      onThumbnailUpdated: (filename) =>
        onFormDataChange({ thumbnail: filename }),
    });

  const thumbnailUrl = getThumbnailUrl(formData.thumbnail);

  return (
    <div
      className="p-6 rounded-lg border"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50">
          <p className="text-red-800 text-sm">❌ {error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Course Title */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Название курса *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onFormDataChange({ title: e.target.value })}
            placeholder="Например: Основы React"
            className="w-full px-3 py-2 rounded border"
            style={{
              background: "var(--color-primary-100)",
              borderColor: "var(--color-primary-400)",
              color: "var(--color-primary-300)",
            }}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Course Description */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Описание курса
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ description: e.target.value })}
            placeholder="Подробное описание курса, что изучит студент..."
            rows={4}
            className="w-full px-3 py-2 rounded border resize-none"
            style={{
              background: "var(--color-primary-100)",
              borderColor: "var(--color-primary-400)",
              color: "var(--color-primary-300)",
            }}
            disabled={isSubmitting}
          />
        </div>

        {/* Course Thumbnail */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Превью курса
          </label>

          {/* Текущая превьюшка */}
          {thumbnailUrl && (
            <div className="mb-4">
              <p
                className="text-sm mb-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Текущая превьюшка:
              </p>
              <div className="relative w-full max-w-sm h-32 rounded border overflow-hidden">
                <Image
                  src={thumbnailUrl}
                  alt="Текущая превьюшка курса"
                  fill
                  className="object-cover"
                  onError={() => {
                    console.log("Ошибка загрузки текущей превьюшки");
                  }}
                />
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailUpload}
            disabled={isSubmitting || isUploading}
            className="w-full px-3 py-2 rounded border"
            style={{
              background: "var(--color-primary-100)",
              borderColor: "var(--color-primary-400)",
              color: "var(--color-primary-300)",
            }}
          />

          <p
            className="text-xs mt-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {thumbnailUrl
              ? "Загрузите новое изображение для замены текущего"
              : "Загрузите изображение"}{" "}
            (JPG, PNG, WebP, макс. 5MB). Рекомендуемое соотношение: 16:9,
            минимум 800x450px
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

        {/* Course Type */}
        <div>
          <label
            className="block text-sm font-medium mb-3"
            style={{ color: "var(--color-text-primary)" }}
          >
            Тип курса
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="courseType"
                checked={formData.isFree}
                onChange={() => onFormDataChange({ isFree: true, price: "" })}
                disabled={isSubmitting}
                className="w-4 h-4"
              />
              <span style={{ color: "var(--color-text-primary)" }}>
                Бесплатный курс
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="courseType"
                checked={!formData.isFree}
                onChange={() => onFormDataChange({ isFree: false })}
                disabled={isSubmitting}
                className="w-4 h-4"
              />
              <span style={{ color: "var(--color-text-primary)" }}>
                Платный курс
              </span>
            </label>
          </div>
        </div>

        {/* Price */}
        {!formData.isFree && (
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Цена курса (₽) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => onFormDataChange({ price: e.target.value })}
              placeholder="2500"
              min="1"
              className="w-full px-3 py-2 rounded border"
              style={{
                background: "var(--color-primary-100)",
                borderColor: "var(--color-primary-400)",
                color: "var(--color-text-primary)",
              }}
              disabled={isSubmitting}
              required={!formData.isFree}
            />
          </div>
        )}

        {/* Course Status */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => onFormDataChange({ isActive: e.target.checked })}
              disabled={isSubmitting}
              className="w-4 h-4"
            />
            <span style={{ color: "var(--color-text-primary)" }}>
              Курс активен (видим пользователям)
            </span>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-discord btn-discord-primary disabled:opacity-50"
          >
            {isSubmitting ? "Сохраняем..." : "Сохранить изменения"}
          </button>
          <Link href="/admin" className="btn-discord btn-discord-secondary">
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
