import CourseActions from "./CourseActions";
import { formatDate, truncateText } from "@/lib/utils/courseHelpers";
import type { Course } from "@/types";

interface AdminCourse extends Course {
  isActive: boolean;
  videosCount: number;
  createdAt: string;
  orderIndex: number;
}

interface SortableCourseTableRowProps {
  course: AdminCourse;
  index: number;
  isDragged: boolean;
  onDelete: (courseId: string) => void;
  isLoading: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export default function SortableCourseTableRow({
  course,
  index,
  isDragged,
  onDelete,
  isLoading,
  onDragStart,
  onDragOver,
  onDrop,
}: Readonly<SortableCourseTableRowProps>) {
  return (
    <tr
      key={course.id}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={`border-b cursor-move transition-all hover:bg-primary-400 ${
        isDragged ? "opacity-50 scale-95" : ""
      }`}
      style={{ borderColor: "var(--color-primary-400)" }}
    >
      {/* Колонка с номером и drag handle */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="text-gray-400">☰</div>
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium"
            style={{
              background: "var(--color-primary-400)",
              color: "var(--color-text-primary)",
            }}
          >
            {index + 1}
          </div>
        </div>
      </td>

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
