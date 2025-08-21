// components/admin/CourseTableRow.tsx (обновленная версия с централизованными типами)
import CourseActions from "./CourseActions";
import type { Course } from "@/types";

interface AdminCourse extends Course {
  isActive: boolean;
  videosCount: number;
  createdAt: string;
}

interface CourseTableRowProps {
  course: AdminCourse;
  onDelete: (courseId: string) => void;
  isLoading?: boolean;
}

export default function CourseTableRow({
  course,
  onDelete,
  isLoading = false,
}: Readonly<CourseTableRowProps>) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru");
  };

  const truncateText = (text: string | null, maxLength: number = 50) => {
    if (!text) return "Без описания";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <tr
      className="border-b hover:bg-primary-400 transition-colors"
      style={{ borderColor: "var(--color-primary-400)" }}
    >
      {/* Название и описание */}
      <td className="py-3 px-4">
        <div>
          <div
            className="font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            {course.title}
          </div>
          <div
            className="text-sm truncate max-w-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {truncateText(course.description)}
          </div>
        </div>
      </td>

      {/* Тип курса */}
      <td className="py-3 px-4">
        {course.isFree ? (
          <span
            className="px-2 py-1 text-xs rounded-full"
            style={{
              background: "var(--color-success)",
              color: "var(--color-text-primary)",
            }}
          >
            Бесплатный
          </span>
        ) : (
          <span
            className="px-2 py-1 text-xs rounded-full"
            style={{
              background: "var(--color-warning)",
              color: "var(--color-primary-300)",
            }}
          >
            {course.price}₽
          </span>
        )}
      </td>

      {/* Количество видео */}
      <td
        className="py-3 px-4"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {course.videosCount}
      </td>

      {/* Статус */}
      <td className="py-3 px-4">
        {course.isActive ? (
          <span
            className="px-2 py-1 text-xs rounded-full"
            style={{
              background: "var(--color-success)",
              color: "var(--color-text-primary)",
            }}
          >
            Активен
          </span>
        ) : (
          <span
            className="px-2 py-1 text-xs rounded-full"
            style={{
              background: "var(--color-primary-400)",
              color: "var(--color-text-secondary)",
            }}
          >
            Неактивен
          </span>
        )}
      </td>

      {/* Дата создания */}
      <td
        className="py-3 px-4 text-sm"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {formatDate(course.createdAt)}
      </td>

      {/* Действия */}
      <td className="py-3 px-4">
        <CourseActions
          courseId={course.id}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      </td>
    </tr>
  );
}
