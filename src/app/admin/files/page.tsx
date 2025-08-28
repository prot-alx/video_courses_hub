"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useDiskSpace } from "@/lib/hooks/useDiskSpage";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import FileManager from "@/components/admin/FileManager";
import DurationUpdater from "@/components/admin/DurationUpdater";

export default function AdminFilesPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const {
    diskInfo,
    loading: diskLoading,
    error: diskError,
    refresh,
    warning,
  } = useDiskSpace();

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
      <AdminHeader title="Управление файлами" onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNavigation />

        {/* Заголовок страницы */}
        <div className="mb-8">
          <p
            className="text-base"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Управление загруженными файлами, очистка неиспользуемых данных и
            обновление метаданных
          </p>
        </div>

        <div className="space-y-6">
          {/* Информация о диске */}
          <div
            className="p-6 rounded-lg border"
            style={{
              background: "var(--color-primary-300)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-lg font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                💾 Место на диске
              </h3>
              <button
                onClick={refresh}
                disabled={diskLoading}
                className="px-3 py-1 text-sm rounded-md border transition-colors hover:bg-gray-50 disabled:opacity-50"
                style={{
                  borderColor: "var(--color-primary-400)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {diskLoading ? "Обновляется..." : "Обновить"}
              </button>
            </div>

            {diskError ? (
              <div className="text-red-600 text-sm">
                Ошибка получения данных о диске: {diskError}
              </div>
            ) : diskInfo ? (
              <div className="space-y-3">
                {warning && (
                  <div
                    className={`p-3 rounded-md text-sm ${
                      warning === "critical"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    }`}
                  >
                    {warning === "critical"
                      ? "⚠️ Критически мало места на диске!"
                      : "⚠️ Мало места на диске, рекомендуется очистка"}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Всего</div>
                    <div
                      className="text-lg font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {diskInfo.total}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">
                      Использовано
                    </div>
                    <div
                      className="text-lg font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {diskInfo.used}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Доступно</div>
                    <div
                      className="text-lg font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {diskInfo.available}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Занято</div>
                    <div
                      className="text-lg font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {diskInfo.usePercentage}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Загрузка данных о диске...
              </div>
            )}
          </div>

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
                <strong>Изображения:</strong> Превью курсов и изображения
                новостей хранятся в папке <code>uploads/thumbnails/</code>
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
