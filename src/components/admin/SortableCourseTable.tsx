// components/admin/SortableCourseTable.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CourseActions from "./CourseActions";
import type { Course } from "@/types";

// Расширяем базовый Course для админских полей
interface AdminCourse extends Course {
  isActive: boolean;
  videosCount: number;
  createdAt: string;
  orderIndex: number; // Добавляем orderIndex
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
  const [sortedCourses, setSortedCourses] = useState<AdminCourse[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Обновляем список при изменении пропса
  useEffect(() => {
    setSortedCourses([...courses].sort((a, b) => a.orderIndex - b.orderIndex));
  }, [courses]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newCourses = [...sortedCourses];
    const draggedCourse = newCourses[draggedIndex];

    // Удаляем из старой позиции
    newCourses.splice(draggedIndex, 1);
    // Вставляем в новую позицию
    newCourses.splice(dropIndex, 0, draggedCourse);

    setSortedCourses(newCourses);
    setDraggedIndex(null);
  };

  const saveOrder = async () => {
    setSaving(true);

    try {
      const courseIds = sortedCourses.map((course) => course.id);

      const response = await fetch("/api/admin/courses/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseIds }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Порядок курсов сохранен!");
      } else {
        alert(result.error || "Ошибка сохранения порядка");
      }
    } catch (error) {
      console.error("Ошибка сохранения порядка:", error);
      alert("Ошибка сохранения порядка");
    } finally {
      setSaving(false);
    }
  };

  // Проверяем, изменился ли порядок
  const hasOrderChanged = sortedCourses.some(
    (course, index) => course.orderIndex !== index
  );

  // Вспомогательные функции
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru");
  };

  const truncateText = (text: string | null, maxLength: number = 50) => {
    if (!text) return "Без описания";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

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

      {hasOrderChanged && (
        <div
          className="p-3 rounded mb-4 flex items-center justify-between"
          style={{
            background: "var(--color-warning)",
            color: "var(--color-primary-300)",
          }}
        >
          <span className="text-sm font-medium">📋 Порядок курсов изменен</span>
          <button
            onClick={saveOrder}
            disabled={saving}
            className="text-sm px-3 py-1 rounded"
            style={{
              background: "var(--color-primary-300)",
              color: "var(--color-text-primary)",
            }}
          >
            {saving ? "Сохранение..." : "Сохранить порядок"}
          </button>
        </div>
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
              <tr
                key={course.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`border-b cursor-move transition-all hover:bg-primary-400 ${
                  draggedIndex === index ? "opacity-50 scale-95" : ""
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
