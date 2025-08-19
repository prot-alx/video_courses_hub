"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    isFree: false,
    isActive: true,
    thumbnail: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("thumbnail", file);

      const response = await fetch("/api/admin/upload/thumbnail", {
        method: "POST",
        body: uploadFormData,
      });

      const result = await response.json();

      if (result.success) {
        // Сохраняем только имя файла
        setFormData((prev) => ({ ...prev, thumbnail: result.data.filename }));
        alert("Превью загружено успешно!");
      } else {
        alert(result.error || "Ошибка загрузки превью");
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      alert("Ошибка загрузки превью");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Валидация
    if (!formData.title.trim()) {
      setError("Введите название курса");
      setIsSubmitting(false);
      return;
    }

    if (!formData.isFree && (!formData.price || Number(formData.price) <= 0)) {
      setError("Для платного курса укажите корректную цену");
      setIsSubmitting(false);
      return;
    }

    try {
      // Подготавливаем данные для отправки
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: formData.isFree ? null : Number(formData.price),
        isFree: formData.isFree,
        isActive: formData.isActive,
        thumbnail: formData.thumbnail || null, // Имя файла или null
      };

      // Отправляем запрос на создание курса
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Курс "${result.data.title}" успешно создан!`);
        router.push("/admin"); // Перенаправляем в админку
      } else {
        setError(result.error || "Ошибка создания курса");
      }
    } catch (err) {
      console.error("Ошибка создания курса:", err);
      setError("Ошибка сети. Попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      {/* Header */}
      <header
        className="border-b px-6 py-4"
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="btn-discord btn-discord-secondary">
            ← К курсам
          </Link>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            ➕ Создание нового курса
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}

        <div
          className="p-6 rounded-lg border"
          style={{
            background: "var(--color-primary-300)",
            borderColor: "var(--color-primary-400)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
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
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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
              {formData.thumbnail && (
                <div className="mt-3">
                  <div
                    className="relative w-full max-w-sm h-32 rounded border overflow-hidden"
                    style={{ borderColor: "var(--color-primary-400)" }}
                  >
                    <Image
                      src={`/api/uploads/thumbnails/${formData.thumbnail
                        .split("/")
                        .pop()}`}
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
                    onChange={() =>
                      setFormData({ ...formData, isFree: true, price: "" })
                    }
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
                    onChange={() => setFormData({ ...formData, isFree: false })}
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
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="2500"
                  min="1"
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    background: "var(--color-primary-100)",
                    borderColor: "var(--color-primary-400)",
                    color: "var(--color-primary-300)",
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
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  disabled={isSubmitting}
                  className="w-4 h-4"
                />
                <span style={{ color: "var(--color-text-primary)" }}>
                  Опубликовать курс сразу после создания
                </span>
              </label>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Неопубликованные курсы не видны пользователям
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-discord btn-discord-primary disabled:opacity-50"
              >
                {isSubmitting ? "Создаем..." : "Создать курс"}
              </button>
              <Link href="/admin" className="btn-discord btn-discord-secondary">
                Отмена
              </Link>
            </div>
          </form>
        </div>

        {/* Next Steps Info */}
        <div
          className="mt-6 p-4 rounded-lg border"
          style={{
            background: "var(--color-primary-100)",
            borderColor: "var(--color-accent)",
          }}
        >
          <h3
            className="font-semibold mb-2"
            style={{ color: "var(--color-primary-300)" }}
          >
            💡 Что дальше?
          </h3>
          <p className="text-sm" style={{ color: "var(--color-primary-400)" }}>
            После создания курса вы сможете добавить к нему видео, управлять
            доступом пользователей и редактировать информацию.
          </p>
        </div>
      </main>
    </div>
  );
}
