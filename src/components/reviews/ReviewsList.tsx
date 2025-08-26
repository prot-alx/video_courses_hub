"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/stores/notifications";
import { useReviewsStore } from "@/stores/reviews";

interface ReviewsListProps {
  showTitle?: boolean;
}

export default function ReviewsList({
  showTitle = true,
}: Readonly<ReviewsListProps>) {
  const { user } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const {
    reviews,
    pagination,
    averageRating,
    isLoading,
    error,
    fetchReviews,
    loadMoreReviews,
    deleteReview,
  } = useReviewsStore();

  useEffect(() => {
    fetchReviews(1, 10, user?.id);
  }, [fetchReviews, user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number, size = "text-lg") => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={size}
        style={{
          color: i < rating ? "#fbbf24" : "#6b7280",
        }}
      >
        {i < rating ? "★" : "☆"}
      </span>
    ));
  };

  const getDisplayName = (user: {
    name: string | null;
    displayName?: string | null;
    email: string;
  }) => {
    return (
      user.displayName ||
      user.name ||
      user.email.split("@")[0] ||
      "Пользователь"
    );
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот отзыв?")) {
      return;
    }

    try {
      const message = await deleteReview(reviewId);
      showSuccessToast(message);
    } catch (error) {
      showErrorToast(error as string);
    }
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
        <div className="flex items-center gap-4">
          <h3
            className="text-2xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Отзывы{" "}
            {pagination
              ? `(${pagination.approvedTotal})`
              : `(${reviews.length})`}
          </h3>
          {pagination && pagination.approvedTotal > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {renderStars(averageRating, "text-xl")}
              </div>
              <span
                className="text-lg font-semibold"
                style={{ color: "var(--color-primary-400)" }}
              >
                {averageRating.toFixed(1)}/5
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={`p-4 rounded border ${
              review.status === "pending" ? "opacity-75" : ""
            }`}
            style={{
              background:
                review.status === "pending"
                  ? "var(--color-primary-50)"
                  : "var(--color-primary-100)",
              borderColor:
                review.status === "pending"
                  ? "var(--color-warning)"
                  : "var(--color-primary-400)",
              borderWidth: review.status === "pending" ? "2px" : "1px",
            }}
          >
            {/* Заголовок с рейтингом и статусом */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">{renderStars(review.rating)}</div>
              <span
                className="text-sm"
                style={{ color: "var(--color-primary-400)" }}
              >
                {review.rating}/5
              </span>
              {review.status === "pending" && (
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    background: "var(--color-warning)",
                    color: "white",
                  }}
                >
                  На модерации
                </span>
              )}
            </div>

            {/* Автор и дата */}
            <div
              className="text-sm mb-3"
              style={{ color: "var(--color-primary-400)" }}
            >
              От: {getDisplayName(review.user)}
            </div>
            <div
              className="text-sm mb-4"
              style={{ color: "var(--color-primary-400)" }}
            >
              Дата: {formatDate(review.createdAt)}
            </div>

            {/* Комментарий */}
            {review.comment && (
              <p className="mb-3" style={{ color: "var(--color-primary-400)" }}>
                {review.comment}
              </p>
            )}

            {/* Кнопки управления для собственных отзывов */}
            {user?.id === review.userId && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="btn-discord btn-discord-secondary text-sm"
                  style={{ background: "#ef4444", borderColor: "#dc2626" }}
                >
                  Удалить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Пагинация */}
      {pagination?.hasNext && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => loadMoreReviews()}
            disabled={isLoading}
            className="btn-discord btn-discord-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Загрузка..." : "Показать еще"}
          </button>
        </div>
      )}
    </div>
  );
}
