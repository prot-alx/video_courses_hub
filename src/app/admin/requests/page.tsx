"use client";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToastContext } from "@/components/providers/ToastProvider";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import StatusFilter from "@/components/admin/StatusFilter";
import RequestTable from "@/components/admin/RequestTable";
import {
  ApiResponse,
  CourseRequest,
  FilterType,
  RequestsApiResponse,
  RequestStats,
  RequestStatus,
} from "@/types";

export default function AdminRequestsPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const toast = useToastContext();
  const [filter, setFilter] = useState<FilterType>("all");
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [stats, setStats] = useState<RequestStats>({
    all: 0,
    new: 0,
    approved: 0,
    rejected: 0,
  });
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async (statusFilter?: string, page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (statusFilter && statusFilter !== "all") {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/admin/requests?${params}`);
      const data: ApiResponse<RequestsApiResponse> = await response.json();

      if (data.success && data.data) {
        const requestsData = data.data;

        // Трансформируем данные, убеждаясь, что они соответствуют нашим типам
        const transformedRequests: CourseRequest[] = requestsData.requests.map(
          (apiRequest) => ({
            id: apiRequest.id,
            userId: apiRequest.userId,
            courseId: apiRequest.courseId,
            user: {
              name: apiRequest.user.name || "Без имени",
              displayName: apiRequest.user.displayName,
              email: apiRequest.user.email,
              phone: apiRequest.user.phone,
              telegram: apiRequest.user.telegram,
              preferredContact: apiRequest.user.preferredContact,
            },
            course: {
              id: apiRequest.course.id,
              title: apiRequest.course.title,
              price: apiRequest.course.price || 0,
            },
            status: apiRequest.status,
            contactMethod: apiRequest.contactMethod,
            createdAt: apiRequest.createdAt,
            processedAt: apiRequest.processedAt,
          })
        );

        setRequests(transformedRequests);
        setStats({
          all: requestsData.stats.total,
          new: requestsData.stats.new,
          approved: requestsData.stats.approved,
          rejected: requestsData.stats.rejected,
        });
        setPagination(requestsData.pagination);
        setCurrentPage(page);
        setError(null);
      } else {
        setError(data.error || "Ошибка загрузки заявок");
      }
    } catch (err) {
      setError("Ошибка сети при загрузке заявок");
      console.error("Ошибка загрузки заявок:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      setCurrentPage(1);
      fetchRequests(filter, 1);
    }
  }, [isAuthenticated, isAdmin, filter]);

  const handleApprove = async (requestId: string) => {
    if (processingId) return;

    setProcessingId(requestId);
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "approved" satisfies RequestStatus,
        }),
      });

      const data: ApiResponse<unknown> = await response.json();

      if (data.success) {
        toast.success("Заявка одобрена!", "Пользователю выдан доступ к курсу");
        await fetchRequests(filter, currentPage); // Остаемся на текущей странице
      } else {
        toast.error(
          "Ошибка одобрения",
          data.error || "Ошибка при одобрении заявки"
        );
      }
    } catch (error) {
      toast.error("Сетевая ошибка", "Ошибка сети при одобрении заявки");
      console.error("Ошибка одобрения заявки:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (processingId) return;

    setProcessingId(requestId);
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected" satisfies RequestStatus,
        }),
      });

      const data: ApiResponse<unknown> = await response.json();

      if (data.success) {
        toast.success("Заявка отклонена");
        await fetchRequests(filter, currentPage); // Остаемся на текущей странице
      } else {
        toast.error(
          "Ошибка отклонения",
          data.error || "Ошибка при отклонении заявки"
        );
      }
    } catch (error) {
      toast.error("Сетевая ошибка", "Ошибка сети при отклонении заявки");
      console.error("Ошибка отклонения заявки:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Фильтрация заявок на клиенте (дополнительно к серверной фильтрации)
  const filteredRequests = requests.filter(
    (req) => filter === "all" || req.status === filter
  );

  const getEmptyMessage = () => {
    if (filter === "all") return "Заявок пока нет";
    const filterLabels = {
      new: "новых",
      approved: "одобренных",
      rejected: "отклоненных",
    } as const;
    return `Нет ${filterLabels[filter]} заявок`;
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
          <p className="text-gray-600 mb-6">Требуются права администратора</p>
          <a
            href="/admin"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            В админку
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      <AdminHeader title="Заявки на покупку" onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNavigation />

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50">
            <div className="flex justify-between items-center">
              <p className="text-red-800 text-sm">❌ {error}</p>
              <button
                onClick={() => fetchRequests(filter, currentPage)}
                className="text-sm text-red-600 hover:text-red-500 underline"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div
            className="p-4 rounded-lg border"
            style={{
              background: "var(--color-primary-300)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--color-accent)" }}
            >
              {stats.all}
            </div>
            <div
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Всего заявок
            </div>
          </div>

          <div
            className="p-4 rounded-lg border"
            style={{
              background: "var(--color-primary-300)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--color-warning)" }}
            >
              {stats.new}
            </div>
            <div
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Новых
            </div>
          </div>

          <div
            className="p-4 rounded-lg border"
            style={{
              background: "var(--color-primary-300)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--color-success)" }}
            >
              {stats.approved}
            </div>
            <div
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Одобренных
            </div>
          </div>

          <div
            className="p-4 rounded-lg border"
            style={{
              background: "var(--color-primary-300)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--color-danger)" }}
            >
              {stats.rejected}
            </div>
            <div
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Отклоненных
            </div>
          </div>
        </div>

        <StatusFilter
          activeFilter={filter}
          onFilterChange={setFilter}
          counts={stats}
        />

        <RequestTable
          requests={filteredRequests}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={processingId !== null}
          emptyMessage={getEmptyMessage()}
        />

        {/* Пагинация */}
        {stats.all > 10 && pagination && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => fetchRequests(filter, currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="btn-discord btn-discord-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Предыдущая
            </button>
            
            <div className="flex items-center gap-1">
              {(() => {
                const totalPages = pagination.totalPages;
                const current = currentPage;
                const pages: number[] = [];
                
                const start = Math.max(1, current - 2);
                const end = Math.min(totalPages, current + 2);
                
                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }
                
                return pages.map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => fetchRequests(filter, pageNum)}
                    className={`px-3 py-1 text-sm rounded border ${
                      pageNum === currentPage
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ));
              })()}
            </div>
            
            <button
              onClick={() => fetchRequests(filter, currentPage + 1)}
              disabled={!pagination.hasNext}
              className="btn-discord btn-discord-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Следующая →
            </button>
            
            <span className="text-sm ml-4" style={{ color: "var(--color-text-secondary)" }}>
              Страница {pagination.page} из {pagination.totalPages} 
              ({pagination.total} заявок)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
