"use client";
import { useEffect } from "react";
import { useDragAndDrop } from "@/lib/hooks/useDragAndDrop";
import { useCourseOrder } from "@/lib/hooks/useCourseOrder";
import EmptyCoursesState from "./EmptyCoursesState";
import OrderChangeNotification from "./OrderChangeNotification";
import SortableCourseTableRow from "./SortableCourseTableRow";
import type { Course } from "@/types";
import Link from "next/link";

// Расширяем базовый Course для админских полей
interface AdminCourse extends Course {
  isActive: boolean;
  videosCount: number;
  createdAt: string;
  orderIndex: number;
}

interface SortableCourseTableProps {
  courses: AdminCourse[];
  onDelete: (courseId: string) => void;
  isLoading?: boolean;
}

export default function SortableCourseTable({
  courses,
  onDelete,
  isLoading = false,
}: Readonly<SortableCourseTableProps>) {
  const sortedInitialCourses = [...courses].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  const {
    draggedIndex,
    items: sortedCourses,
    setItems: setSortedCourses,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useDragAndDrop<AdminCourse>(sortedInitialCourses);

  const { saving, saveOrder, hasOrderChanged } = useCourseOrder();

  // Обновляем список при изменении пропса
  useEffect(() => {
    const newSortedCourses = [...courses].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
    setSortedCourses(newSortedCourses);
  }, [courses, setSortedCourses]);

  const handleSaveOrder = async () => {
    const courseIds = sortedCourses.map((course) => course.id);
    await saveOrder(courseIds);
  };

  const orderChanged = hasOrderChanged(sortedCourses);

  if (courses.length === 0) {
    return <EmptyCoursesState />;
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

      {orderChanged && (
        <OrderChangeNotification
          saving={saving}
          onSaveOrder={handleSaveOrder}
        />
      )}

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
                #
              </th>
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
            {sortedCourses.map((course, index) => (
              <SortableCourseTableRow
                key={course.id}
                course={course}
                index={index}
                isDragged={draggedIndex === index}
                onDelete={onDelete}
                isLoading={isLoading}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
