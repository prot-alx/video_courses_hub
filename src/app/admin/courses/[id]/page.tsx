// app/admin/courses/[id]/page.tsx (обновленная версия с централизованными типами)
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToastContext } from "@/components/providers/ToastProvider";
import type { Course, UpdateCourseInput } from "@/types";

// Расширяем базовый Course для админских полей
interface AdminCourse extends Course {
  isActive: boolean;
}

export default function EditCoursePage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const resolvedParams = use(params);
  const router = useRouter();
  const toast = useToastContext();

  const [course, setCourse] = useState<AdminCourse | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    isFree: false,
    isActive: true,
    thumbnail: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        const courseData = data.data;
        setCourse(courseData);
        setFormData({
          title: courseData.title,
          description: courseData.description || "",
          price: courseData.price?.toString() || "",
          isFree: courseData.isFree,
          isActive: courseData.isActive,
          thumbnail: courseData.thumbnail || "",
        });
        setError(null);
      } else {
        setError(data.error || "Курс не найден");
      }
    } catch (err) {
      setError("Ошибка загрузки курса");
      console.error("Ошибка загрузки курса:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

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
        toast.success("Превью обновлено!", "Миниатюра курса успешно загружена");
      } else {
        toast.error(
          "Ошибка загрузки",
          result.error || "Ошибка загрузки превью"
        );
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      toast.error("Сетевая ошибка", "Ошибка загрузки превью");
    } finally {
      setIsUploading(false);
    }
  };

  const getThumbnailUrl = (thumbnail: string | null): string | null => {
    if (!thumbnail) return null;

    // Если уже полный путь
    if (thumbnail.startsWith("/uploads/")) {
      return `/api${thumbnail}`;
    }

    // Если только имя файла
    return `/api/uploads/thumbnails/${thumbnail}`;
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
      const updateData: UpdateCourseInput & { isActive: boolean } = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: formData.isFree ? null : Number(formData.price),
        isFree: formData.isFree,
        isActive: formData.isActive,
        thumbnail: formData.thumbnail.trim() || null,
      };

      const response = await fetch(`/api/admin/courses/${resolvedParams.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          "Курс обновлён!",
          `Курс "${result.data.title}" успешно обновлён`
        );
        router.push("/admin");
      } else {
        setError(result.error || "Ошибка обновления курса");
      }
    } catch (err) {
      console.error("Ошибка обновления курса:", err);
      setError("Ошибка сети. Попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--color-primary-200)" }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--color-primary-200)" }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Курс не найден
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/admin" className="btn-discord btn-discord-primary">
              Вернуться к курсам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const thumbnailUrl = getThumbnailUrl(formData.thumbnail);

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
            ✏️ Редактирование курса
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
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
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

        {/* Additional Actions */}
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
            🎥 Управление видео
          </h3>
          <p
            className="text-sm mb-3"
            style={{ color: "var(--color-primary-400)" }}
          >
            Добавляйте и редактируйте видео этого курса
          </p>
          <Link
            href={`/admin/courses/${resolvedParams.id}/videos`}
            className="btn-discord btn-discord-secondary text-sm"
          >
            Управление видео
          </Link>
        </div>
      </main>
    </div>
  );
}
