import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCoursesStore } from "@/stores/courses";
import { useToast } from "@/stores/notifications";
import { CourseFormData } from "@/types";
import { CreateCourseSchema } from "@/lib/validations";
import { useFormValidation } from "@/lib/hooks/useFormValidation";

interface UseCourseCreationReturn {
  formData: CourseFormData;
  isSubmitting: boolean;
  error: string | null;
  validationErrors: Record<string, string>;
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

  const { validate, validationErrors, clearErrors } = useFormValidation(
    CreateCourseSchema, 
    {
      showToastOnError: true,
      toastErrorTitle: "Ошибка валидации курса"
    }
  );

  const updateFormData = (updates: Partial<CourseFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    clearErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Подготавливаем данные для валидации
    const validationData = {
      title: formData.title,
      shortDescription: formData.shortDescription || null,
      fullDescription: formData.fullDescription || null,
      price: formData.isFree ? null : Number(formData.price) || null,
      isFree: formData.isFree,
      isActive: formData.isActive,
      thumbnail: formData.thumbnail || null,
    };

    if (!validate(validationData)) {
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
    validationErrors,
    updateFormData,
    handleSubmit,
  };
}
