// app/admin/page.tsx (обновленная версия)
"use client";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import StatsGrid from "@/components/admin/StatsGrid";
import CourseTable from "@/components/admin/CourseTable";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number | null;
  isFree: boolean;
  isActive: boolean;
  videosCount: number;
  createdAt: string;
}

interface ApiCourse extends Course {
  usersWithAccess: number;
  pendingRequests: number;
}

interface Stats {
  totalCourses: number;
  activeCourses: number;
  freeCourses: number;
  pendingRequests: number;
}

export default function AdminPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    activeCourses: 0,
    freeCourses: 0,
    pendingRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/courses");
      const data = await response.json();

      if (data.success) {
        // Преобразуем данные API в формат, ожидаемый CourseTable
        const processedCourses: Course[] = data.data.map(
          (apiCourse: ApiCourse) => ({
            id: apiCourse.id,
            title: apiCourse.title,
            description: apiCourse.description || "", // null -> пустая строка
            price: apiCourse.price,
            isFree: apiCourse.isFree,
            isActive: apiCourse.isActive,
            videosCount: apiCourse.videosCount,
            createdAt: new Date(apiCourse.createdAt)
              .toISOString()
              .split("T")[0], // Форматируем дату
          })
        );

        setCourses(processedCourses);

        // Вычисляем статистику из полученных данных
        const totalCourses = data.data.length;
        const activeCourses = data.data.filter(
          (c: ApiCourse) => c.isActive
        ).length;
        const freeCourses = data.data.filter((c: ApiCourse) => c.isFree).length;
        const pendingRequests = data.data.reduce(
          (sum: number, c: ApiCourse) => sum + (c.pendingRequests || 0),
          0
        );

        setStats({
          totalCourses,
          activeCourses,
          freeCourses,
          pendingRequests,
        });

        setError(null);
      } else {
        setError(data.error || "Ошибка загрузки курсов");
      }
    } catch (err) {
      setError("Ошибка сети при загрузке курсов");
      console.error("Ошибка загрузки курсов:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchCourses();
    }
  }, [isAuthenticated, isAdmin]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (
      !confirm(
        "Вы уверены, что хотите удалить курс? Все связанные файлы будут удалены."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        const message = data.data
          ? `Курс удален!\nУдалено файлов: ${data.data.deletedFiles}\nОшибок удаления: ${data.data.failedFiles}`
          : "Курс удален!";
        alert(message);

        // Обновляем список курсов
        await fetchCourses();
      } else {
        alert(data.error || "Ошибка при удалении курса");
      }
    } catch (error) {
      alert("Ошибка сети при удалении курса");
      console.error("Ошибка удаления курса:", error);
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

  // Навигация (добавлен пункт "Файлы")
  const navItems = [
    { href: "/admin", label: "Курсы", isActive: true },
    {
      href: "/admin/requests",
      label: "Заявки",
      badge: stats.pendingRequests > 0 ? stats.pendingRequests : undefined,
    },
    { href: "/admin/users", label: "Пользователи" },
    { href: "/admin/files", label: "Файлы" }, // ← Новый пункт
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      <AdminHeader onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNavigation items={navItems} />

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50">
            <div className="flex justify-between items-center">
              <p className="text-red-800 text-sm">❌ {error}</p>
              <button
                onClick={fetchCourses}
                className="text-sm text-red-600 hover:text-red-500 underline"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        )}

        <StatsGrid stats={stats} isLoading={isLoading} />

        <CourseTable
          courses={courses}
          onDelete={handleDeleteCourse}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
