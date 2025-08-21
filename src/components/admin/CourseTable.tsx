import Link from "next/link";
import CourseTableRow from "./CourseTableRow";
import type { Course } from "@/types";

interface AdminCourse extends Course {
  isActive: boolean;
  videosCount: number;
  createdAt: string;
}

interface CourseTableProps {
  courses: AdminCourse[];
  onDelete: (courseId: string) => void;
  isLoading?: boolean;
}

export default function CourseTable({
  courses,
  onDelete,
  isLoading = false,
}: Readonly<CourseTableProps>) {
  if (courses.length === 0) {
    return (
      <div
        className="p-6 rounded-lg border"
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div className="text-center py-8">
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Курсов пока нет
          </h3>
          <p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Создайте первый курс для начала работы
          </p>
          <Link
            href="/admin/courses/create"
            className="btn-discord btn-discord-primary"
          >
            + Создать курс
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-lg border"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Управление курсами
        </h2>
        <Link
          href="/admin/courses/create"
          className="btn-discord btn-discord-primary"
        >
          + Создать курс
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: "var(--color-primary-400)" }}
            >
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Название
              </th>
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Тип
              </th>
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Видео
              </th>
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Статус
              </th>
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Дата
              </th>
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <CourseTableRow
                key={course.id}
                course={course}
                onDelete={onDelete}
                isLoading={isLoading}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
