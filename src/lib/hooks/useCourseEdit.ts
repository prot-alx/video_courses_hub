import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToastContext } from "@/components/providers/ToastProvider";
import type { Course, CourseFormData, UpdateCourseInput } from "@/types";

interface AdminCourse extends Course {
  isActive: boolean;
}

interface UseCourseEditProps {
  courseId: string;
}

interface UseCourseEditReturn {
  // Data state
  course: AdminCourse | null;
  formData: CourseFormData;

  // Loading states
  loading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  updateFormData: (updates: Partial<CourseFormData>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  refetchCourse: () => Promise<void>;
}

export function useCourseEdit({
  courseId,
}: UseCourseEditProps): UseCourseEditReturn {
  const router = useRouter();
  const toast = useToastContext();

  const [course, setCourse] = useState<AdminCourse | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    shortDescription: "",
    fullDescription: "",
    price: "",
    isFree: false,
    isActive: true,
    thumbnail: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${courseId}`);
      const data = await response.json();

      if (data.success) {
        const courseData = data.data;
        setCourse(courseData);
        setFormData({
          title: courseData.title,
          shortDescription: courseData.shortDescription || "",
          fullDescription: courseData.fullDescription || "",
          price: courseData.price?.toString() || "",
          isFree: courseData.isFree,
          isActive: courseData.isActive,
          thumbnail: courseData.thumbnail || "",
        });
        setError(null);
      } else {
        setError(data.error || "Курс не найден");
      }
    } catch (err) {
      setError("Ошибка загрузки курса");
      console.error("Ошибка загрузки курса:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

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
      const updateData: UpdateCourseInput & { isActive: boolean } = {
        title: formData.title.trim(),
        shortDescription: formData.shortDescription.trim() || null,
        fullDescription: formData.fullDescription.trim() || null,
        price: formData.isFree ? null : Number(formData.price),
        isFree: formData.isFree,
        isActive: formData.isActive,
        thumbnail: formData.thumbnail.trim() || null,
      };

      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          "Курс обновлён!",
          `Курс "${result.data.title}" успешно обновлён`
        );
        router.push("/admin");
      } else {
        setError(result.error || "Ошибка обновления курса");
      }
    } catch (err) {
      console.error("Ошибка обновления курса:", err);
      setError("Ошибка сети. Попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Data state
    course,
    formData,

    // Loading states
    loading,
    isSubmitting,
    error,

    // Actions
    updateFormData,
    handleSubmit,
    refetchCourse: fetchCourse,
  };
}
