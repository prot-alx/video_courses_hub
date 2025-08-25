import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCoursesStore } from "@/stores/courses";
import { useToast } from "@/stores/notifications";
import { CourseFormData } from "@/types";

interface UseCourseCreationReturn {
  formData: CourseFormData;
  isSubmitting: boolean;
  error: string | null;
  updateFormData: (updates: Partial<CourseFormData>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useCourseCreation(): UseCourseCreationReturn {
  const router = useRouter();
  const toast = useToast();
  const { addCourse } = useCoursesStore();

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    shortDescription: "",
    fullDescription: "",
    price: "",
    isFree: false,
    isActive: true,
    thumbnail: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (updates: Partial<CourseFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Валидация
    if (!formData.title.trim()) {
      setError("Введите название курса");
      setIsSubmitting(false);
      return;
    }

    // Валидация ограничений по символам
    if (formData.title.length > 200) {
      setError("Название курса не должно превышать 200 символов");
      setIsSubmitting(false);
      return;
    }

    if (formData.shortDescription.length > 300) {
      setError("Краткое описание не должно превышать 300 символов");
      setIsSubmitting(false);
      return;
    }

    if (formData.fullDescription.length > 2000) {
      setError("Подробное описание не должно превышать 2000 символов");
      setIsSubmitting(false);
      return;
    }

    if (!formData.isFree && (!formData.price || Number(formData.price) <= 0)) {
      setError("Для платного курса укажите корректную цену");
      setIsSubmitting(false);
      return;
    }

    try {
      // Подготавливаем данные для отправки
      const courseData = {
        title: formData.title.trim(),
        shortDescription: formData.shortDescription.trim() || null,
        fullDescription: formData.fullDescription.trim() || null,
        price: formData.isFree ? null : Number(formData.price),
        isFree: formData.isFree,
        isActive: formData.isActive,
        thumbnail: formData.thumbnail || null, // Имя файла или null
      };

      // Отправляем запрос на создание курса
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      const result = await response.json();

      if (result.success) {
        // Добавляем курс в store
        addCourse(result.data);

        toast.success(
          "Курс создан!",
          `Курс "${result.data.title}" успешно создан`
        );
        router.push("/admin"); // Перенаправляем в админку
      } else {
        setError(result.error || "Ошибка создания курса");
      }
    } catch (err) {
      console.error("Ошибка создания курса:", err);
      setError("Ошибка сети. Попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    error,
    updateFormData,
    handleSubmit,
  };
}
