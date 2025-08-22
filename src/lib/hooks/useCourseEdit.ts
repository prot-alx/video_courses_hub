import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToastContext } from "@/components/providers/ToastProvider";
import type { Course, UpdateCourseInput } from "@/types";

interface AdminCourse extends Course {
  isActive: boolean;
}

interface CourseFormData {
  title: string;
  description: string;
  price: string;
  isFree: boolean;
  isActive: boolean;
  thumbnail: string;
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
    description: "",
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
          description: courseData.description || "",
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

    if (!formData.isFree && (!formData.price || Number(formData.price) <= 0)) {
      setError("Для платного курса укажите корректную цену");
      setIsSubmitting(false);
      return;
    }

    try {
      const updateData: UpdateCourseInput & { isActive: boolean } = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
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
