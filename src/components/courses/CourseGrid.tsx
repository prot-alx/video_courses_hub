// components/courses/CourseGrid.tsx (обновленная версия с централизованными типами)
import CourseCard from "./CourseCard";
import type { Course } from "@/types";

interface CourseGridData extends Course {
  totalDuration: number;
}

interface CourseGridProps {
  courses: CourseGridData[];
  isLoading?: boolean;
  isAuthenticated?: boolean;
  userCourseAccess?: string[];
  onPurchaseClick?: (courseId: string) => void;
}

export default function CourseGrid({
  courses,
  isLoading = false,
  isAuthenticated = false,
  userCourseAccess = [],
  onPurchaseClick,
}: Readonly<CourseGridProps>) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="p-6 rounded-lg border animate-pulse"
            style={{
              background: "var(--color-primary-300)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <div
              className="aspect-video rounded mb-4"
              style={{ background: "var(--color-primary-400)" }}
            ></div>
            <div
              className="h-6 rounded mb-2"
              style={{ background: "var(--color-primary-400)" }}
            ></div>
            <div
              className="h-4 rounded mb-4"
              style={{ background: "var(--color-primary-400)" }}
            ></div>
            <div
              className="h-4 rounded w-1/2 mb-4"
              style={{ background: "var(--color-primary-400)" }}
            ></div>
            <div
              className="h-10 rounded"
              style={{ background: "var(--color-primary-400)" }}
            ></div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3
          className="text-xl font-semibold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Курсов пока нет
        </h3>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Скоро здесь появятся интересные курсы!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          isAuthenticated={isAuthenticated}
          hasAccess={userCourseAccess.includes(course.id)}
          onPurchaseClick={onPurchaseClick}
        />
      ))}
    </div>
  );
}
