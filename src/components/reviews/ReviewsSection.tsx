"use client";
import { useState } from "react";
import ReviewForm from "./ReviewForm";
import ReviewsList from "./ReviewsList";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/stores/notifications";
import { useReviewsStore } from "@/stores/reviews";

export default function ReviewsSection() {
  const { user } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const { isLoading, submitReview } = useReviewsStore();
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSubmitReview = async (rating: number, comment: string) => {
    try {
      const message = await submitReview(rating, comment);
      showSuccessToast(message);
      setIsFormVisible(false);
    } catch (error) {
      showErrorToast(error as string);
    }
  };

  return (
    <div className="space-y-8">
      {/* Форма добавления отзыва */}
      {user && (
        <div
          className="p-6 rounded-lg border"
          style={{
            background: "var(--color-primary-200)",
            borderColor: "var(--color-primary-400)",
          }}
        >
          {!isFormVisible ? (
            <button
              onClick={() => setIsFormVisible(true)}
              className="btn-discord btn-discord-primary"
            >
              Оставить отзыв
            </button>
          ) : (
            <div>
              <ReviewForm onSubmit={handleSubmitReview} isLoading={isLoading} />
              <button
                onClick={() => setIsFormVisible(false)}
                className="btn-discord btn-discord-secondary mt-2 text-sm"
              >
                Отменить
              </button>
            </div>
          )}
        </div>
      )}

      {/* Список всех отзывов */}
      <ReviewsList />
    </div>
  );
}
