import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCoursesStore } from "@/stores/courses";
import { useToast } from "@/stores/notifications";

interface CourseFormData {
  title: string;
  description: string;
  price: string;
  isFree: boolean;
  isActive: boolean;
  thumbnail: string;
}

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
    description: "",
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

    if (!formData.isFree && (!formData.price || Number(formData.price) <= 0)) {
      setError("Для платного курса укажите корректную цену");
      setIsSubmitting(false);
      return;
    }

    try {
      // Подготавливаем данные для отправки
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
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
