"use client";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToastContext } from "@/components/providers/ToastProvider";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import StatsGrid from "@/components/admin/StatsGrid";
import SortableCourseTable from "@/components/admin/SortableCourseTable";
import type { AdminCourse, AdminStats, ApiResponse } from "@/types";

interface ApiCourse extends AdminCourse {
  usersWithAccess: number;
  pendingRequests: number;
}

export default function AdminPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const toast = useToastContext();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [stats, setStats] = useState<AdminStats>({
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
      const data: ApiResponse<ApiCourse[]> = await response.json();

      if (data.success && data.data) {
        const processedCourses: AdminCourse[] = data.data.map((apiCourse) => ({
          id: apiCourse.id,
          title: apiCourse.title,
          shortDescription: apiCourse.shortDescription || "",
          fullDescription: apiCourse.fullDescription || "",
          price: apiCourse.price,
          isFree: apiCourse.isFree,
          videosCount: apiCourse.videosCount,
          thumbnail: apiCourse.thumbnail,
          isActive: apiCourse.isActive,
          orderIndex: apiCourse.orderIndex,
          totalDuration: apiCourse.totalDuration || 0,
          createdAt: new Date(apiCourse.createdAt).toISOString().split("T")[0], // Форматируем дату
        }));

        setCourses(processedCourses);

        const totalCourses = data.data.length;
        const activeCourses = data.data.filter((c) => c.isActive).length;
        const freeCourses = data.data.filter((c) => c.isFree).length;
        const pendingRequests = data.data.reduce(
          (sum, c) => sum + (c.pendingRequests || 0),
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
        const errorMsg = data.error || "Ошибка загрузки курсов";
        setError(errorMsg);
        toast.error("Ошибка", errorMsg);
      }
    } catch (err) {
      const errorMsg = "Ошибка сети при загрузке курсов";
      setError(errorMsg);
      toast.error("Сетевая ошибка", errorMsg);
      console.error("Ошибка загрузки курсов:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const data: ApiResponse<{
        deletedFiles: number;
        failedFiles: number;
      }> = await response.json();

      if (data.success) {
        const message = data.data
          ? `Удалено файлов: ${data.data.deletedFiles}, ошибок: ${data.data.failedFiles}`
          : undefined;
        toast.success("Курс удален!", message);

        await fetchCourses();
      } else {
        toast.error(
          "Ошибка удаления",
          data.error || "Ошибка при удалении курса"
        );
      }
    } catch (error) {
      toast.error("Сетевая ошибка", "Ошибка сети при удалении курса");
      console.error("Ошибка удаления курса:", error);
    }
  };

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

        <SortableCourseTable
          courses={courses}
          onDelete={handleDeleteCourse}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
