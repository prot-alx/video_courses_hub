"use client";
import { useState, useEffect } from "react";
import ReviewForm from "./ReviewForm";
import ReviewsList from "./ReviewsList";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/stores/notifications";
import { useReviewsStore } from "@/stores/reviews";

export default function ReviewsSection() {
  const { user } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const { userReviews, isLoading, submitReview, deleteReview, fetchUserReviews, hasPendingReviews } = useReviewsStore();
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserReviews();
    }
  }, [user, fetchUserReviews]);

  const handleSubmitReview = async (rating: number, comment: string) => {
    try {
      const message = await submitReview(rating, comment);
      showSuccessToast(message);
      setIsFormVisible(false);
    } catch (error) {
      showErrorToast(error as string);
    }
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "На модерации";
      case "approved":
        return "Одобрен";
      case "rejected":
        return "Отклонен";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "var(--color-warning)";
      case "approved":
        return "var(--color-success)";
      case "rejected":
        return "#ef4444";
      default:
        return "var(--color-text-secondary)";
    }
  };

  return (
    <div className="space-y-8">
      {/* Форма отзыва пользователя */}
      {user && (
        <div
          className="p-6 rounded-lg border"
          style={{
            background: "var(--color-primary-200)",
            borderColor: "var(--color-primary-400)",
          }}
        >
          <h3
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            Ваш отзыв
          </h3>

          {userReviews.length > 0 ? (
            <div className="space-y-4">
              {/* Существующие отзывы */}
              {userReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded border"
                  style={{
                    background: "var(--color-primary-100)",
                    borderColor: "var(--color-primary-400)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className="text-lg"
                            style={{
                              color: i < review.rating ? "#fbbf24" : "#6b7280",
                            }}
                          >
                            {i < review.rating ? "★" : "☆"}
                          </span>
                        ))}
                      </div>
                      <span
                        className="text-sm px-2 py-1 rounded"
                        style={{
                          background: getStatusColor(review.status),
                          color: "white",
                        }}
                      >
                        {getStatusText(review.status)}
                      </span>
                    </div>
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {new Date(review.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  
                  {review.comment && (
                    <p
                      className="mb-3"
                      style={{ color: "var(--color-primary-400)" }}
                    >
                      {review.comment}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="btn-discord btn-discord-secondary text-sm"
                      style={{ background: "#ef4444", borderColor: "#dc2626" }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Кнопка добавления нового отзыва */}
              {!hasPendingReviews() && !isFormVisible && (
                <button
                  onClick={() => setIsFormVisible(true)}
                  className="btn-discord btn-discord-primary"
                >
                  Добавить еще отзыв
                </button>
              )}
              
              {hasPendingReviews() && !isFormVisible && (
                <div
                  className="p-3 rounded border text-sm"
                  style={{
                    background: "var(--color-primary-200)",
                    borderColor: "var(--color-primary-400)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  У вас есть отзыв на модерации. Дождитесь его рассмотрения перед добавлением нового.
                </div>
              )}

              {/* Форма нового отзыва */}
              {isFormVisible && (
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
          ) : (
            // Первый отзыв
            <>
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
            </>
          )}
        </div>
      )}

      {/* Список одобренных отзывов */}
      <ReviewsList />
    </div>
  );
}