"use client";
import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import { useAuth } from "@/lib/hooks/useAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import Pagination from "@/components/admin/Pagination";
import AdminTable from "@/components/admin/AdminTable";
import { useToast } from "@/stores/notifications";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  status: "pending" | "approved" | "rejected" | "deleted";
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
  deleted: number;
  total: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function AdminReviewsPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    deleted: 0,
    total: 0,
  });
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const fetchReviews = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });

        if (statusFilter !== "all") {
          params.set("status", statusFilter);
        }

        const response = await fetch(`/api/admin/reviews?${params}`);
        const data = await response.json();

        if (data.success) {
          setReviews(data.data);
          setStats(data.stats);
          setPagination(data.pagination);
          setCurrentPage(page);
        } else {
          showErrorToast(data.error || "Ошибка загрузки отзывов");
        }
      } catch (error) {
        console.error("Ошибка загрузки отзывов:", error);
        showErrorToast("Ошибка загрузки отзывов");
      } finally {
        setIsLoading(false);
      }
    },
    [statusFilter, showErrorToast]
  );

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      setCurrentPage(1);
      fetchReviews(1);
    }
  }, [isAuthenticated, isAdmin, statusFilter, fetchReviews]);

  const moderateReview = async (
    reviewId: string,
    status: "approved" | "rejected" | "pending" | "deleted"
  ) => {
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
        await fetchReviews(currentPage); // Остаемся на текущей странице
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
        await fetchReviews(currentPage); // Остаемся на текущей странице
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
          color: i < rating ? "var(--color-warning)" : "var(--color-text-secondary)",
        }}
      >
        {i < rating ? "★" : "☆"}
      </span>
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "var(--color-warning)";
      case "approved":
        return "var(--color-success)";
      case "rejected":
        return "var(--color-danger)";
      case "deleted":
        return "var(--color-text-secondary)";
      default:
        return "var(--color-text-secondary)";
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
      case "deleted":
        return "Удален";
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div
            className="p-4 rounded-lg text-center"
            style={{
              background: "var(--color-primary-300)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <div className="text-2xl font-bold" style={{ color: "var(--color-warning)" }}>
              {stats.pending}
            </div>
            <div
              className="text-sm"
              style={{ color: "var(--color-text-primary)" }}
            >
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
            <div className="text-2xl font-bold" style={{ color: "var(--color-success)" }}>
              {stats.approved}
            </div>
            <div
              className="text-sm"
              style={{ color: "var(--color-text-primary)" }}
            >
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
            <div className="text-2xl font-bold" style={{ color: "var(--color-danger)" }}>
              {stats.rejected}
            </div>
            <div
              className="text-sm"
              style={{ color: "var(--color-text-primary)" }}
            >
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
            <div className="text-2xl font-bold" style={{ color: "var(--color-text-secondary)" }}>
              {stats.deleted}
            </div>
            <div
              className="text-sm"
              style={{ color: "var(--color-text-primary)" }}
            >
              Удалено
            </div>
          </div>
          <div
            className="p-4 rounded-lg text-center"
            style={{
              background: "var(--color-primary-300)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {stats.total}
            </div>
            <div
              className="text-sm"
              style={{ color: "var(--color-text-primary)" }}
            >
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
              { key: "deleted", label: "Удаленные" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={`btn-discord ${
                  statusFilter === filter.key
                    ? "btn-discord-primary"
                    : "btn-discord-secondary"
                } text-sm`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Список отзывов */}
        <AdminTable
          columns={[
            { key: "rating", title: "Рейтинг", width: "120px" },
            { key: "user", title: "Пользователь" },
            { key: "comment", title: "Комментарий" },
            { key: "date", title: "Дата" },
            { key: "status", title: "Статус", align: "center" },
            { key: "actions", title: "Действия", align: "center" },
          ]}
          data={reviews}
          renderRow={(review) => (
            <tr
              key={review.id}
              className="border-b transition-colors"
              style={{ borderColor: "var(--color-primary-400)" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-primary-400)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex">{renderStars(review.rating)}</div>
                  <span
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {review.rating}/5
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div>
                  <div
                    className="font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {review.user.displayName || review.user.name || "Не указано"}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {review.user.email}
                  </div>
                </div>
              </td>
              <td
                className="px-4 py-3 max-w-xs"
                style={{ color: "var(--color-text-primary)" }}
              >
                {review.comment ? (
                  <p className="truncate" title={review.comment}>
                    {review.comment}
                  </p>
                ) : (
                  <span style={{ color: "var(--color-text-secondary)" }}>-</span>
                )}
              </td>
              <td
                className="px-4 py-3 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {formatDate(review.createdAt)}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className="text-sm px-2 py-1 rounded"
                  style={{
                    background: getStatusColor(review.status),
                    color: "var(--color-text-primary)",
                  }}
                >
                  {getStatusText(review.status)}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-center">
                  {review.status === "pending" && (
                    <>
                      <button
                        onClick={() => moderateReview(review.id, "approved")}
                        className="btn-discord text-xs px-2 py-1"
                        style={{
                          background: "var(--color-success)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        ✓ Одобрить
                      </button>
                      <button
                        onClick={() => moderateReview(review.id, "rejected")}
                        className="btn-discord text-xs px-2 py-1"
                        style={{
                          background: "var(--color-danger)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        ✗ Отклонить
                      </button>
                    </>
                  )}
                  {review.status === "rejected" && (
                    <button
                      onClick={() => moderateReview(review.id, "approved")}
                      className="btn-discord text-xs px-2 py-1"
                      style={{ 
                        background: "var(--color-success)", 
                        color: "var(--color-text-primary)" 
                      }}
                    >
                      ✓ Одобрить
                    </button>
                  )}
                  {review.status === "approved" && (
                    <button
                      onClick={() => moderateReview(review.id, "rejected")}
                      className="btn-discord text-xs px-2 py-1"
                      style={{ 
                        background: "var(--color-danger)", 
                        color: "var(--color-text-primary)" 
                      }}
                    >
                      ✗ Отклонить
                    </button>
                  )}
                  {review.status === "deleted" && (
                    <>
                      <button
                        onClick={() => moderateReview(review.id, "approved")}
                        className="btn-discord text-xs px-2 py-1"
                        style={{ 
                          background: "var(--color-success)", 
                          color: "var(--color-text-primary)" 
                        }}
                      >
                        ✓ Восстановить
                      </button>
                      <button
                        onClick={() => moderateReview(review.id, "pending")}
                        className="btn-discord text-xs px-2 py-1"
                        style={{ 
                          background: "var(--color-warning)", 
                          color: "var(--color-primary-300)" 
                        }}
                      >
                        ↻ Модерация
                      </button>
                    </>
                  )}
                  {review.status !== "deleted" && (
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="btn-discord btn-discord-secondary text-xs px-2 py-1"
                    >
                      🗑 Удалить
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )}
          emptyMessage="Отзывов не найдено"
          loading={isLoading}
        />

        {/* Пагинация */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              onPageChange={fetchReviews}
              loading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
