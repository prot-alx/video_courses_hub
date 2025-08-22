import { useState } from "react";
import { useToastContext } from "@/components/providers/ToastProvider";

interface Course {
  id: string;
  orderIndex: number;
}

interface UseCourseOrderReturn {
  saving: boolean;
  saveOrder: (courseIds: string[]) => Promise<void>;
  hasOrderChanged: (courses: Course[]) => boolean;
}

export function useCourseOrder(): UseCourseOrderReturn {
  const toast = useToastContext();
  const [saving, setSaving] = useState(false);

  const saveOrder = async (courseIds: string[]) => {
    setSaving(true);

    try {
      const response = await fetch("/api/admin/courses/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseIds }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Порядок сохранён!", "Порядок курсов успешно обновлён");
      } else {
        toast.error(
          "Ошибка сортировки",
          result.error || "Ошибка сохранения порядка"
        );
      }
    } catch (error) {
      console.error("Ошибка сохранения порядка:", error);
      toast.error("Сетевая ошибка", "Ошибка сохранения порядка");
    } finally {
      setSaving(false);
    }
  };

  const hasOrderChanged = (courses: Course[]): boolean => {
    return courses.some((course, index) => course.orderIndex !== index);
  };

  return {
    saving,
    saveOrder,
    hasOrderChanged,
  };
}
