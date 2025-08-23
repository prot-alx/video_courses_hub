"use client";
import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import { useAuth } from "@/lib/hooks/useAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { useToast } from "@/stores/notifications";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  user: {
    name: string | null;
    displayName: string | null;
    email: string;
  };
}

interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function AdminReviewsPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = statusFilter === "all" 
        ? "/api/admin/reviews" 
        : `/api/admin/reviews?status=${statusFilter}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data);
        setStats(data.stats);
      } else {
        showErrorToast(data.error || "Ошибка загрузки отзывов");
      }
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error);
      showErrorToast("Ошибка загрузки отзывов");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, showErrorToast]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchReviews();
    }
  }, [isAuthenticated, isAdmin, statusFilter, fetchReviews]);

  const moderateReview = async (reviewId: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(data.message);
        await fetchReviews(); // Перезагружаем список
      } else {
        showErrorToast(data.error || "Ошибка модерации");
      }
    } catch (error) {
      console.error("Ошибка модерации:", error);
      showErrorToast("Ошибка модерации");
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот отзыв?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(data.message);
        await fetchReviews(); // Перезагружаем список
      } else {
        showErrorToast(data.error || "Ошибка удаления");
      }
    } catch (error) {
      console.error("Ошибка удаления:", error);
      showErrorToast("Ошибка удаления");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{
          color: i < rating ? "#fbbf24" : "#6b7280",
        }}
      >
        {i < rating ? "★" : "☆"}
      </span>
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "approved":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
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

  // Проверка доступа
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Доступ запрещен
          </h2>
          <p className="text-gray-600 mb-4">
            У вас нет прав для доступа к этой странице
          </p>
          <button
            onClick={handleSignOut}
            className="btn-discord btn-discord-primary"
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      <AdminHeader title="Модерация отзывов" onSignOut={handleSignOut} />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNavigation />

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          className="p-4 rounded-lg text-center"
          style={{
            background: "var(--color-primary-300)",
            borderColor: "var(--color-primary-400)",
          }}
        >
          <div className="text-2xl font-bold" style={{ color: "#f59e0b" }}>
            {stats.pending}
          </div>
          <div className="text-sm" style={{ color: "var(--color-text-primary)" }}>
            На модерации
          </div>
        </div>
        <div
          className="p-4 rounded-lg text-center"
          style={{
            background: "var(--color-primary-300)",
            borderColor: "var(--color-primary-400)",
          }}
        >
          <div className="text-2xl font-bold" style={{ color: "#10b981" }}>
            {stats.approved}
          </div>
          <div className="text-sm" style={{ color: "var(--color-text-primary)" }}>
            Одобрено
          </div>
        </div>
        <div
          className="p-4 rounded-lg text-center"
          style={{
            background: "var(--color-primary-300)",
            borderColor: "var(--color-primary-400)",
          }}
        >
          <div className="text-2xl font-bold" style={{ color: "#ef4444" }}>
            {stats.rejected}
          </div>
          <div className="text-sm" style={{ color: "var(--color-text-primary)" }}>
            Отклонено
          </div>
        </div>
        <div
          className="p-4 rounded-lg text-center"
          style={{
            background: "var(--color-primary-300)",
            borderColor: "var(--color-primary-400)",
          }}
        >
          <div className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            {stats.total}
          </div>
          <div className="text-sm" style={{ color: "var(--color-text-primary)" }}>
            Всего
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "Все" },
            { key: "pending", label: "На модерации" },
            { key: "approved", label: "Одобренные" },
            { key: "rejected", label: "Отклоненные" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`btn-discord ${
                statusFilter === filter.key ? "btn-discord-primary" : "btn-discord-secondary"
              } text-sm`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Список отзывов */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="p-8 rounded-lg text-center"
          style={{
            background: "var(--color-primary-200)",
            borderColor: "var(--color-primary-400)",
          }}
        >
          <p style={{ color: "var(--color-text-secondary)" }}>
            Отзывов не найдено
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-lg border"
              style={{
                background: "var(--color-primary-100)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
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
                  <div className="text-sm" style={{ color: "var(--color-primary-400)" }}>
                    Имя: {review.user.displayName || review.user.name || "Не указано"}
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-primary-400)" }}>
                    Email: {review.user.email}
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-primary-400)" }}>
                    Дата: {formatDate(review.createdAt)}
                  </div>
                </div>
              </div>

              {review.comment && (
                <div className="mb-4">
                  <p style={{ color: "var(--color-primary-400)" }}>
                    {review.comment}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {review.status === "pending" && (
                  <>
                    <button
                      onClick={() => moderateReview(review.id, "approved")}
                      className="btn-discord text-sm"
                      style={{ background: "#10b981", borderColor: "#059669" }}
                    >
                      ✓ Одобрить
                    </button>
                    <button
                      onClick={() => moderateReview(review.id, "rejected")}
                      className="btn-discord text-sm"
                      style={{ background: "#ef4444", borderColor: "#dc2626" }}
                    >
                      ✗ Отклонить
                    </button>
                  </>
                )}
                {review.status === "rejected" && (
                  <button
                    onClick={() => moderateReview(review.id, "approved")}
                    className="btn-discord text-sm"
                    style={{ background: "#10b981", borderColor: "#059669" }}
                  >
                    ✓ Одобрить
                  </button>
                )}
                {review.status === "approved" && (
                  <button
                    onClick={() => moderateReview(review.id, "rejected")}
                    className="btn-discord text-sm"
                    style={{ background: "#ef4444", borderColor: "#dc2626" }}
                  >
                    ✗ Отклонить
                  </button>
                )}
                <button
                  onClick={() => deleteReview(review.id)}
                  className="btn-discord btn-discord-secondary text-sm"
                >
                  🗑 Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}