// app/page.tsx (обновленная версия)
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import Header from "@/components/layout/Header";
import CourseGrid from "@/components/courses/CourseGrid";
import CourseFilter from "@/components/courses/CourseFilter";

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  isFree: boolean;
  hasAccess: boolean;
  videosCount: number;
  freeVideosCount: number;
  totalDuration: number; // Теперь получаем из API
  thumbnail: string | null;
}

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");

  const fetchCourses = async (filterType: "all" | "free" | "paid" = "all") => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses?type=${filterType}`);
      const data = await response.json();

      if (data.success) {
        console.log("Данные курсов:", data.data); // ← Отладочная информация
        setCourses(data.data);
        setError(null);
      } else {
        setError(data.error || "Ошибка загрузки курсов");
      }
    } catch (err) {
      setError("Ошибка сети при загрузке курсов");
      console.error("Ошибка загрузки курсов:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(filter);
  }, [filter]);

  const handleFilterChange = (newFilter: "all" | "free" | "paid") => {
    setFilter(newFilter);
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-6 py-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            {isAuthenticated
              ? "Добро пожаловать обратно!"
              : "Платформа видеокурсов"}
          </h2>
          <p
            className="text-lg mb-8"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {isAuthenticated
              ? "Продолжайте изучение или выберите новый курс"
              : "Изучайте новые навыки с помощью качественных видеокурсов"}
          </p>

          {/* Course Filter */}
          <CourseFilter
            activeFilter={filter}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Error State */}
        {error && (
          <div
            className="mb-6 p-4 rounded-lg border"
            style={{
              background: "var(--color-danger-bg, #fee)",
              borderColor: "var(--color-danger, #f00)",
            }}
          >
            <div className="flex justify-between items-center">
              <p style={{ color: "var(--color-danger, #f00)" }}>❌ {error}</p>
              <button
                onClick={() => fetchCourses(filter)}
                className="text-sm underline hover:opacity-80"
                style={{ color: "var(--color-danger, #f00)" }}
              >
                Попробовать снова
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span
              className="ml-3"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Загрузка курсов...
            </span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Пока нет курсов
            </h3>
            <p style={{ color: "var(--color-text-secondary)" }}>
              {filter === "all"
                ? "Курсы появятся здесь, когда администратор их добавит."
                : `Нет курсов в категории "${
                    filter === "free" ? "бесплатные" : "платные"
                  }".`}
            </p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && courses.length > 0 && (
          <CourseGrid
            courses={courses.map((course) => ({
              id: course.id,
              title: course.title,
              description: course.description || "",
              price: course.price,
              isFree: course.isFree,
              videosCount: course.videosCount,
              totalDuration: course.totalDuration, // Теперь точная длительность!
              thumbnail: course.thumbnail,
            }))}
            isLoading={loading}
            isAuthenticated={isAuthenticated}
            userCourseAccess={courses
              .filter((c) => c.hasAccess)
              .map((c) => c.id)}
            onPurchaseClick={(courseId) => {
              window.location.href = `/courses/${courseId}`;
            }}
          />
        )}

        {/* CTA for Non-Authenticated Users */}
        {!isAuthenticated && courses.length > 0 && (
          <div
            className="mt-8 p-6 rounded-lg border text-center"
            style={{
              background: "var(--color-primary-100)",
              borderColor: "var(--color-accent)",
            }}
          >
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: "var(--color-primary-400)" }}
            >
              Хотите получить полный доступ?
            </h3>
            <p className="mb-4" style={{ color: "var(--color-primary-400)" }}>
              Войдите в аккаунт, чтобы запрашивать доступ к платным курсам и
              отслеживать прогресс
            </p>
            <a href="/auth/signin" className="btn-discord btn-discord-primary">
              Войти через Google
            </a>
          </div>
        )}
      </main>

      <footer
        className="border-t py-8"
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p style={{ color: "var(--color-text-secondary)" }}>
            © 2025 VideoCourses Platform. Сделано с ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
