"use client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToastContext } from "@/components/providers/ToastProvider";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function TestToastPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const toast = useToastContext();

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

  const testToasts = () => {
    toast.success("Успех!", "Это успешное уведомление");
    setTimeout(() => toast.error("Ошибка!", "Что-то пошло не так"), 1000);
    setTimeout(
      () => toast.warning("Предупреждение!", "Будьте осторожны"),
      2000
    );
    setTimeout(
      () => toast.info("Информация", "Полезная информация для вас"),
      3000
    );
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      <AdminHeader onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNavigation />

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Тест Toast Уведомлений
          </h1>

          <p className="text-gray-600 mb-6">
            Нажмите кнопку, чтобы показать разные типы уведомлений:
          </p>

          <div className="space-y-4">
            <button
              onClick={() =>
                toast.success("Успех!", "Операция выполнена успешно")
              }
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors mr-4"
            >
              Success Toast
            </button>

            <button
              onClick={() => toast.error("Ошибка!", "Что-то пошло не так")}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors mr-4"
            >
              Error Toast
            </button>

            <button
              onClick={() =>
                toast.warning("Предупреждение!", "Будьте осторожны")
              }
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors mr-4"
            >
              Warning Toast
            </button>

            <button
              onClick={() =>
                toast.info("Информация", "Полезная информация для вас")
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mr-4"
            >
              Info Toast
            </button>

            <br />

            <button
              onClick={testToasts}
              className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors mt-4"
            >
              Показать все типы (с задержкой)
            </button>

            <button
              onClick={() => toast.clear()}
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors mt-4 ml-4"
            >
              Очистить все уведомления
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Что изменилось:</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Заменил alert() на современные toast уведомления</li>
              <li>Добавил анимации появления/исчезновения</li>
              <li>
                Разные типы: success (зелёные), error (красные), warning
                (жёлтые), info (синие)
              </li>
              <li>Автоматическое закрытие через 5 секунд</li>
              <li>Возможность закрыть вручную</li>
              <li>Уведомления показываются в правом верхнем углу</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
