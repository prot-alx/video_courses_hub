// app/admin/files/page.tsx
"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import FileManager from "@/components/admin/FileManager";
import DurationUpdater from "@/components/admin/DurationUpdater";

export default function AdminFilesPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Проверка доступа
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Требуется авторизация
          </h2>
          <p className="text-gray-600 mb-6">
            Войдите в систему для доступа к админке
          </p>
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Войти
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Доступ запрещен
          </h2>
          <p className="text-gray-600 mb-6">У вас нет прав администратора</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      <AdminHeader onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNavigation />

        {/* Заголовок страницы */}
        <div className="mb-8">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            🗂️ Управление файлами
          </h1>
          <p
            className="text-base"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Управление загруженными файлами, очистка неиспользуемых данных и
            обновление метаданных
          </p>
        </div>

        <div className="space-y-6">
          {/* Управление файлами */}
          <FileManager />

          {/* Обновление длительности видео */}
          <DurationUpdater />

          {/* Дополнительная информация */}
          <div
            className="p-6 rounded-lg border"
            style={{
              background: "var(--color-primary-300)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              ℹ️ Информация о файлах
            </h3>
            <div
              className="text-sm space-y-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <div>
                <strong>Видеофайлы:</strong> Хранятся в папке{" "}
                <code>uploads/videos/</code>
              </div>
              <div>
                <strong>Превью курсов:</strong> Хранятся в папке{" "}
                <code>uploads/thumbnails/</code>
              </div>
              <div>
                <strong>Автоочистка:</strong> При удалении курса все связанные
                файлы удаляются автоматически
              </div>
              <div>
                <strong>Длительность видео:</strong> Определяется автоматически
                при загрузке в браузере
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
