"use client";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToastContext } from "@/components/providers/ToastProvider";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import UserStatsCards from "@/components/admin/UserStatsCards";
import UsersTable from "@/components/admin/UsersTable";
import type { AdminUserView, UserStats, ApiResponse } from "@/types";

function calculateStats(users: AdminUserView[]): UserStats {
  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.role === "USER").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    withActiveRequests: 0, // TODO: Implement proper activeRequests counting
    newUsersThisWeek: 0, // TODO: Calculate based on createdAt
  };
}

export default function AdminUsersPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const toast = useToastContext();
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    withActiveRequests: 0,
    newUsersThisWeek: 0,
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data: ApiResponse<AdminUserView[]> = await response.json();

      if (data.success && data.data) {
        // Нормализуем данные пользователей
        const normalizedUsers: AdminUserView[] = data.data.map((apiUser) => ({
          id: apiUser.id,
          name: apiUser.name || "Без имени",
          displayName: apiUser.displayName,
          email: apiUser.email,
          role: apiUser.role,
          phone: apiUser.phone,
          telegram: apiUser.telegram,
          preferredContact: apiUser.preferredContact,
          createdAt: apiUser.createdAt,
          coursesCount: 0, // TODO: вычислять реально
          pendingRequestsCount: 0, // TODO: вычислять реально
          lastActivity: undefined,
        }));

        setUsers(normalizedUsers);
        setStats(calculateStats(normalizedUsers));
        const apiData = data as {
          pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
          };
        };
        setPagination(apiData.pagination || null);
        setCurrentPage(page);
        setError(null);
      } else {
        setError(data.error || "Ошибка загрузки пользователей");
      }
    } catch (err) {
      setError("Ошибка сети при загрузке пользователей");
      console.error("Ошибка загрузки пользователей:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch("/api/admin/requests?status=new");
      const data: ApiResponse<{ stats: { new: number } }> =
        await response.json();
      if (data.success && data.data) {
        setPendingRequestsCount(data.data.stats.new || 0);
      }
    } catch (err) {
      console.error("Ошибка загрузки заявок:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers(1);
      fetchPendingRequests();
    }
  }, [isAuthenticated, isAdmin]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleGrantAccess = async (userId: string) => {
    // TODO: Реализовать модальное окно для выбора курса
    console.log(`Grant access to user ${userId}`);
    toast.info(
      "Функция в разработке",
      "Функция выдачи доступа будет реализована в следующих итерациях"
    );
  };

  const handleRevokeAccess = async (userId: string) => {
    // TODO: Реализовать модальное окно для отзыва доступа
    console.log(`Revoke access from user ${userId}`);
    toast.info(
      "Функция в разработке",
      "Функция отзыва доступа будет реализована в следующих итерациях"
    );
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
      <AdminHeader
        title="Управление пользователями"
        onSignOut={handleSignOut}
        showBackToSite={true}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNavigation />

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50">
            <div className="flex justify-between items-center">
              <p className="text-red-800 text-sm">❌ {error}</p>
              <button
                onClick={() => fetchUsers(currentPage)}
                className="text-sm text-red-600 hover:text-red-500 underline"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span
              className="ml-3"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Загрузка пользователей...
            </span>
          </div>
        ) : (
          <>
            <UserStatsCards stats={stats} />
            <UsersTable
              users={users}
              onGrantAccess={handleGrantAccess}
              onRevokeAccess={handleRevokeAccess}
            />

            {/* Пагинация */}
            {stats.totalUsers > 10 && pagination && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => fetchUsers(currentPage - 1)}
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

                    return pages.map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => fetchUsers(pageNum)}
                        className={`px-3 py-1 text-sm rounded border ${
                          pageNum === currentPage
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ));
                  })()}
                </div>

                <button
                  onClick={() => fetchUsers(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="btn-discord btn-discord-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Следующая →
                </button>

                <span
                  className="text-sm ml-4"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Страница {pagination.page} из {pagination.totalPages}(
                  {pagination.total} пользователей)
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
