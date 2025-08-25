"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/lib/hooks/useAuth";
import AdminHeader from "@/components/admin/AdminHeader";
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

export default function CreateNewsPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToastContext();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    image: "",
  });

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpdate = (filename: string) => {
    setFormData((prev) => ({ ...prev, image: filename }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.shortDescription.trim() ||
      !formData.fullDescription.trim()
    ) {
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

      const response = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<News> = await response.json();

      if (data.success) {
        toast.success("Новость создана успешно");
        router.push("/admin/news");
      } else {
        toast.error(data.error || "Ошибка создания новости");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      toast.error("Ошибка создания новости");
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

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      <AdminHeader
        title="Создание новости"
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
            Заполните информацию о новости
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
                maxLength={200}
                className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formData.title.length > 200 ? 'border-red-500' : ''
                }`}
                style={{
                  background: "var(--color-primary-100)",
                  border: `1px solid ${formData.title.length > 200 ? "#ef4444" : "var(--color-primary-400)"}`,
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

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn-discord btn-discord-primary disabled:opacity-50"
              >
                {submitting ? "Создание..." : "Создать новость"}
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
