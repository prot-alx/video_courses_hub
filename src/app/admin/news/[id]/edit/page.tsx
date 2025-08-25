"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import ThumbnailUploader from "@/components/admin/ThumbnailUploader";
import { useToastContext } from "@/components/providers/ToastProvider";
import type { ApiResponse } from "@/types";

interface News {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    displayName: string | null;
    name: string | null;
    email: string;
  };
}

export default function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToastContext();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpdate = (filename: string) => {
    setFormData((prev) => ({ ...prev, image: filename }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.shortDescription.trim() || !formData.fullDescription.trim()) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    // Валидация ограничений по символам
    if (formData.title.length > 200) {
      toast.error("Заголовок не должен превышать 200 символов");
      return;
    }
    if (formData.shortDescription.length > 300) {
      toast.error("Краткое описание не должно превышать 300 символов");
      return;
    }
    if (formData.fullDescription.length > 2000) {
      toast.error("Полное описание не должно превышать 2000 символов");
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AdminNavigation />
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNavigation />

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Редактирование новости</h1>
        <p className="text-gray-600">
          Измените информацию о новости
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Заголовок <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={200}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.title.length > 200 ? 'border-red-500' : ''
              }`}
              style={{
                background: "var(--color-primary-100)",
                borderColor: formData.title.length > 200 ? "#ef4444" : "var(--color-primary-400)",
                color: "var(--color-text-primary)",
              }}
              placeholder="Введите заголовок новости"
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Заголовок, который увидят читатели
              </p>
              <span
                className={`text-xs ${formData.title.length > 200 ? 'text-red-500' : 'text-gray-500'}`}
              >
                {formData.title.length}/200
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
              maxLength={300}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                formData.shortDescription.length > 300 ? 'border-red-500' : ''
              }`}
              style={{
                background: "var(--color-primary-100)",
                borderColor: formData.shortDescription.length > 300 ? "#ef4444" : "var(--color-primary-400)",
                color: "var(--color-text-primary)",
              }}
              placeholder="Краткое описание для отображения в списке новостей"
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Это описание будет показано в карточке новости
              </p>
              <span
                className={`text-xs ${formData.shortDescription.length > 300 ? 'text-red-500' : 'text-gray-500'}`}
              >
                {formData.shortDescription.length}/300
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                formData.fullDescription.length > 2000 ? 'border-red-500' : ''
              }`}
              style={{
                background: "var(--color-primary-100)",
                borderColor: formData.fullDescription.length > 2000 ? "#ef4444" : "var(--color-primary-400)",
                color: "var(--color-text-primary)",
              }}
              placeholder="Полное содержание новости"
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Детальное описание будет показано на странице новости
              </p>
              <span
                className={`text-xs ${formData.fullDescription.length > 2000 ? 'text-red-500' : 'text-gray-500'}`}
              >
                {formData.fullDescription.length}/2000
              </span>
            </div>
          </div>

          <ThumbnailUploader
            thumbnail={formData.image}
            onThumbnailUpdated={handleImageUpdate}
            isSubmitting={submitting}
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
              <span className="text-sm font-medium">Опубликовать новость</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Если галочка снята, новость будет скрыта от пользователей
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-discord btn-discord-primary disabled:opacity-50"
            >
              {submitting ? "Сохранение..." : "Сохранить изменения"}
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
  );
}