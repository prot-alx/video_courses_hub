"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/lib/hooks/useAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import ThumbnailUploader from "@/components/admin/ThumbnailUploader";
import { useToastContext } from "@/components/providers/ToastProvider";
import { UpdateNewsSchema } from "@/lib/validations";
import { useFormValidation } from "@/lib/hooks/useFormValidation";
import type { ApiResponse, News } from "@/types";

export default function EditNewsPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = use(params);
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToastContext();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const { validate, validationErrors, getFieldError } = useFormValidation(
    UpdateNewsSchema,
    {
      showToastOnError: true,
      toastErrorTitle: "Ошибка валидации новости",
    }
  );
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    image: "",
    isActive: true,
  });

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/news/${id}`);
      const data: ApiResponse<News> = await response.json();

      if (data.success && data.data) {
        const news = data.data;
        setFormData({
          title: news.title,
          shortDescription: news.shortDescription,
          fullDescription: news.fullDescription,
          image: news.image || "",
          isActive: news.isActive,
        });
      } else {
        toast.error("Новость не найдена");
        router.push("/admin/news");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      toast.error("Ошибка загрузки новости");
      router.push("/admin/news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [id]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpdate = (filename: string) => {
    setFormData((prev) => ({ ...prev, image: filename }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация с Zod
    if (!validate(formData)) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/admin/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<News> = await response.json();

      if (data.success) {
        toast.success("Новость обновлена успешно");
        router.push("/admin/news");
      } else {
        toast.error(data.error || "Ошибка обновления новости");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      toast.error("Ошибка обновления новости");
    } finally {
      setSubmitting(false);
    }
  };

  // Проверка доступа
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Доступ запрещен
          </h2>
          <p className="text-gray-600 mb-6">Требуются права администратора</p>
          <a
            href="/admin"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            В админку
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--color-primary-200)" }}
      >
        <AdminHeader
          title="Редактирование новости"
          onSignOut={handleSignOut}
          showBackToSite={true}
        />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <AdminNavigation />
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      <AdminHeader
        title="Редактирование новости"
        onSignOut={handleSignOut}
        showBackToSite={true}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNavigation />

        <div className="mb-6">
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Измените информацию о новости
          </p>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Заголовок <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={100}
                className={`w-full input-discord ${
                  getFieldError("title") ? "border-red-500" : ""
                }`}
                style={getFieldError("title") ? { borderColor: "#ef4444" } : {}}
                placeholder="Введите заголовок новости"
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-1">
                {getFieldError("title") ? (
                  <p className="text-xs text-red-500">
                    {getFieldError("title")}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Заголовок, который увидят читатели
                  </p>
                )}
                <span
                  className={`text-xs ${
                    getFieldError("title") ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  {formData.title.length}/100
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Краткое описание <span className="text-red-500">*</span>
              </label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                maxLength={150}
                rows={3}
                className={`w-full input-discord resize-none ${
                  getFieldError("shortDescription") ? "border-red-500" : ""
                }`}
                style={
                  getFieldError("shortDescription")
                    ? { borderColor: "#ef4444" }
                    : {}
                }
                placeholder="Краткое описание для отображения в списке новостей"
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-1">
                {getFieldError("shortDescription") ? (
                  <p className="text-xs text-red-500">
                    {getFieldError("shortDescription")}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Это описание будет показано в карточке новости
                  </p>
                )}
                <span
                  className={`text-xs ${
                    getFieldError("shortDescription")
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {formData.shortDescription.length}/150
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Полное описание <span className="text-red-500">*</span>
              </label>
              <textarea
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleInputChange}
                maxLength={2000}
                rows={8}
                className={`w-full input-discord resize-none ${
                  getFieldError("fullDescription") ? "border-red-500" : ""
                }`}
                style={
                  getFieldError("fullDescription")
                    ? { borderColor: "#ef4444" }
                    : {}
                }
                placeholder="Полное содержание новости"
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-1">
                {getFieldError("fullDescription") ? (
                  <p className="text-xs text-red-500">
                    {getFieldError("fullDescription")}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Детальное описание будет показано на странице новости
                  </p>
                )}
                <span
                  className={`text-xs ${
                    getFieldError("fullDescription")
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {formData.fullDescription.length}/2000
                </span>
              </div>
            </div>

            <ThumbnailUploader
              thumbnail={formData.image}
              onThumbnailUpdated={handleImageUpdate}
              isSubmitting={submitting}
              onUploadStateChange={setIsUploadingThumbnail}
            />

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="mr-2"
                />
                <span className="text-sm font-medium">
                  Опубликовать новость
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Если галочка снята, новость будет скрыта от пользователей
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting || isUploadingThumbnail}
                className="btn-discord btn-discord-primary disabled:opacity-50"
              >
                {submitting
                  ? "Сохранение..."
                  : isUploadingThumbnail
                  ? "Загрузка изображения..."
                  : "Сохранить изменения"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/news")}
                disabled={submitting}
                className="btn-discord btn-discord-secondary"
              >
                Отменить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
