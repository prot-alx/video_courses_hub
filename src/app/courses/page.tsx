"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CourseGrid from "@/components/courses/CourseGrid";
import CourseFilter from "@/components/courses/CourseFilter";
import type { Course, ApiResponse, CourseFilterType } from "@/types";

// Расширяем базовый Course для страницы курсов
interface CoursePageCourse extends Course {
  totalDuration: number;
}

export default function CoursesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<CoursePageCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CourseFilterType>("all");

  const fetchCourses = async (filterType: CourseFilterType = "all") => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses?type=${filterType}`);
      const data: ApiResponse<CoursePageCourse[]> = await response.json();

      if (data.success && data.data) {
        console.log("Данные курсов:", data.data);
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

  const handleFilterChange = (newFilter: CourseFilterType) => {
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
        {/* Заголовок страницы курсов */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            Наши курсы
          </h1>
          <p
            className="text-lg mb-8 max-w-3xl mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {isAuthenticated
              ? "Выберите курс для изучения или запросите доступ к платным материалам"
              : "Откройте для себя мир новых знаний с нашими качественными видеокурсами"}
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
            courses={courses}
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
      </main>

      <Footer />
    </div>
  );
}
