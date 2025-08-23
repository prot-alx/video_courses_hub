"use client";
import { useEffect } from "react";
import { useReviewsStore } from "@/stores/reviews";

interface ReviewsListProps {
  showTitle?: boolean;
}

export default function ReviewsList({
  showTitle = true,
}: Readonly<ReviewsListProps>) {
  const { reviews, isLoading, error, fetchReviews } = useReviewsStore();

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className="text-lg"
        style={{
          color: i < rating ? "#fbbf24" : "#6b7280",
        }}
      >
        {i < rating ? "★" : "☆"}
      </span>
    ));
  };

  const getDisplayName = (user: { name: string | null; displayName?: string | null; email: string }) => {
    return user.displayName || user.name || user.email.split("@")[0] || "Пользователь";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-4 rounded border text-center"
        style={{
          background: "var(--color-primary-200)",
          borderColor: "var(--color-primary-400)",
          color: "var(--color-text-secondary)",
        }}
      >
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div
        className="p-6 rounded border text-center"
        style={{
          background: "var(--color-primary-200)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <p style={{ color: "var(--color-text-secondary)" }}>
          Пока нет отзывов. Станьте первым!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <h3
          className="text-2xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Отзывы ({reviews.length})
        </h3>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-4 rounded border"
            style={{
              background: "var(--color-primary-100)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            {/* Заголовок с рейтингом */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">{renderStars(review.rating)}</div>
              <span
                className="text-sm"
                style={{ color: "var(--color-primary-400)" }}
              >
                {review.rating}/5
              </span>
            </div>

            {/* Автор и дата */}
            <div className="text-sm mb-3" style={{ color: "var(--color-primary-400)" }}>
              От: {getDisplayName(review.user)}
            </div>
            <div className="text-sm mb-4" style={{ color: "var(--color-primary-400)" }}>
              Дата: {formatDate(review.createdAt)}
            </div>

            {/* Комментарий */}
            {review.comment && (
              <p
                style={{ color: "var(--color-primary-400)" }}
              >
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
