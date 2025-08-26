"use client";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { ReviewSchema } from "@/lib/validations";
import { FormErrorBoundary } from "@/components/errors/ErrorBoundary";
import { useToastContext } from "@/components/providers/ToastProvider";

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  initialData?: {
    rating: number;
    comment: string;
  };
  isLoading?: boolean;
}

function ReviewFormContent({
  onSubmit,
  initialData,
  isLoading = false,
}: Readonly<ReviewFormProps>) {
  const { isAuthenticated } = useAuth();
  const toast = useToastContext();
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || "");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация с Zod
    const validation = ReviewSchema.safeParse({ rating, comment });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as string] = error.message;
        }
      });
      setValidationErrors(errors);
      toast.error(
        "Ошибка валидации",
        "Проверьте правильность заполнения формы"
      );
      return;
    }

    setValidationErrors({});

    try {
      await onSubmit(validation.data.rating, validation.data.comment || "");
    } catch (error) {
      console.log(error);
      toast.error("Ошибка", "Не удалось отправить отзыв. Попробуйте позже.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className="p-6 rounded-lg border text-center"
        style={{
          background: "var(--color-primary-100)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <p style={{ color: "var(--color-text-secondary)" }}>
          Войдите в систему, чтобы оставить отзыв
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Оценка *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="text-3xl transition-all hover:scale-110"
              style={{
                color:
                  star <= (hoveredRating || rating) ? "#fbbf24" : "#6b7280",
              }}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              {star <= (hoveredRating || rating) ? "★" : "☆"}
            </button>
          ))}
        </div>
        <p
          className="text-sm mt-1"
          style={{
            color: validationErrors.rating
              ? "var(--color-danger)"
              : "var(--color-text-secondary)",
          }}
        >
          {validationErrors.rating ? (
            validationErrors.rating
          ) : (
            <>
              {rating === 0 && "Выберите оценку"}
              {rating === 1 && "Ужасно"}
              {rating === 2 && "Плохо"}
              {rating === 3 && "Нормально"}
              {rating === 4 && "Хорошо"}
              {rating === 5 && "Отлично"}
            </>
          )}
        </p>
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Комментарий
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full p-3 rounded border resize-none"
          style={{
            background: "var(--color-primary-300)",
            borderColor: "var(--color-primary-400)",
            color: "var(--color-text-primary)",
          }}
          placeholder="Расскажите о своем опыте обучения..."
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-1">
          {validationErrors.comment && (
            <p className="text-sm" style={{ color: "var(--color-danger)" }}>
              {validationErrors.comment}
            </p>
          )}
          <p
            className="text-sm ml-auto"
            style={{
              color:
                comment.length > 450
                  ? "var(--color-warning)"
                  : "var(--color-text-secondary)",
            }}
          >
            {comment.length}/500
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={
          rating === 0 || isLoading || Object.keys(validationErrors).length > 0
        }
        className="btn-discord btn-discord-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Отправка..." : "Отправить отзыв"}
      </button>
    </form>
  );
}

export default function ReviewForm(props: Readonly<ReviewFormProps>) {
  return (
    <FormErrorBoundary>
      <ReviewFormContent {...props} />
    </FormErrorBoundary>
  );
}
