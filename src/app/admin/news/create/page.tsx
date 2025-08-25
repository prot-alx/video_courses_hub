"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/lib/hooks/useAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import ThumbnailUploader from "@/components/admin/ThumbnailUploader";
import { useToastContext } from "@/components/providers/ToastProvider";
import { CreateNewsSchema } from "@/lib/validations";
import { useFormValidation } from "@/lib/hooks/useFormValidation";
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
  
  const { validate, validationErrors, getFieldError } = useFormValidation(
    CreateNewsSchema, 
    {
      showToastOnError: true,
      toastErrorTitle: "Ошибка валидации новости"
    }
  );
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

    // Валидация с Zod
    const validationData = {
      title: formData.title,
      shortDescription: formData.shortDescription,
      fullDescription: formData.fullDescription,
      image: formData.image || null,
      isActive: true,
    };

    if (!validate(validationData)) {
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
                maxLength={100}
                className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  getFieldError("title") ? 'border-red-500' : ''
                }`}
                style={{
                  background: "var(--color-primary-100)",
                  border: `1px solid ${getFieldError("title") ? "#ef4444" : "var(--color-primary-400)"}`,
                  color: "var(--color-primary-400)",
                }}
                placeholder="Введите заголовок новости"
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-1">
                {getFieldError("title") ? (
                  <p className="text-xs text-red-500">{getFieldError("title")}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Заголовок, который увидят читатели
                  </p>
                )}
                <span
                  className={`text-xs ${getFieldError("title") ? 'text-red-500' : 'text-gray-500'}`}
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  getFieldError("shortDescription") ? 'border-red-500' : ''
                }`}
                style={{
                  background: "var(--color-primary-100)",
                  borderColor: getFieldError("shortDescription") ? "#ef4444" : "var(--color-primary-400)",
                  color: "var(--color-primary-400)",
                }}
                placeholder="Краткое описание для отображения в списке новостей"
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-1">
                {getFieldError("shortDescription") ? (
                  <p className="text-xs text-red-500">{getFieldError("shortDescription")}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Это описание будет показано в карточке новости
                  </p>
                )}
                <span
                  className={`text-xs ${getFieldError("shortDescription") ? 'text-red-500' : 'text-gray-500'}`}
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  getFieldError("fullDescription") ? 'border-red-500' : ''
                }`}
                style={{
                  background: "var(--color-primary-100)",
                  borderColor: getFieldError("fullDescription") ? "#ef4444" : "var(--color-primary-400)",
                  color: "var(--color-primary-400)",
                }}
                placeholder="Полное содержание новости"
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-1">
                {getFieldError("fullDescription") ? (
                  <p className="text-xs text-red-500">{getFieldError("fullDescription")}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Детальное описание будет показано на странице новости
                  </p>
                )}
                <span
                  className={`text-xs ${getFieldError("fullDescription") ? 'text-red-500' : 'text-gray-500'}`}
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
