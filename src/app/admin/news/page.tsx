"use client";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useAuth } from "@/lib/hooks/useAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import Pagination from "@/components/admin/Pagination";
import AdminTable from "@/components/admin/AdminTable";
import Link from "next/link";
import { useToastContext } from "@/components/providers/ToastProvider";
import type { ApiResponse, News } from "@/types";

interface NewsResponse {
  news: News[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
}

export default function AdminNewsPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToastContext();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const fetchNews = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/news?page=${page}&limit=10`);
      const data: ApiResponse<NewsResponse> = await response.json();

      if (data.success && data.data) {
        setNews(data.data.news);
        setCurrentPage(data.data.pagination.currentPage);
        setTotalPages(data.data.pagination.totalPages);
        setTotalCount(data.data.pagination.totalCount);
      } else {
        toast.error("Ошибка загрузки новостей");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      toast.error("Ошибка загрузки новостей");
    } finally {
      setLoading(false);
    }
  };

  const toggleNewsStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data: ApiResponse<News> = await response.json();

      if (data.success && data.data) {
        setNews((prev) =>
          prev.map((item) => (item.id === id ? data.data! : item))
        );
        toast.success(
          `Новость ${!currentStatus ? "активирована" : "деактивирована"}`
        );
      } else {
        toast.error("Ошибка обновления статуса");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      toast.error("Ошибка обновления статуса");
    }
  };

  const deleteNews = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту новость?")) return;

    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: "DELETE",
      });

      const data: ApiResponse<null> = await response.json();

      if (data.success) {
        setNews((prev) => prev.filter((item) => item.id !== id));
        setTotalCount((prev) => prev - 1);
        toast.success("Новость удалена");
      } else {
        toast.error("Ошибка удаления новости");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      toast.error("Ошибка удаления новости");
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchNews(currentPage);
    }
  }, [currentPage, isAuthenticated, isAdmin]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        title="Управление новостями"
        onSignOut={handleSignOut}
        showBackToSite={true}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNavigation />

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span
              className="ml-3"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Загрузка новостей...
            </span>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Всего новостей: {totalCount}
                </p>
              </div>
              <Link
                href="/admin/news/create"
                className="btn-discord btn-discord-primary"
              >
                + Создать новость
              </Link>
            </div>

            {news.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📰</div>
                <p
                  className="mb-4"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Новостей пока нет
                </p>
                <Link
                  href="/admin/news/create"
                  className="btn-discord btn-discord-primary"
                >
                  Создать первую новость
                </Link>
              </div>
            ) : (
              <>
                <AdminTable
                  columns={[
                    { key: "title", title: "Заголовок" },
                    { key: "author", title: "Автор", className: "hidden md:table-cell" },
                    { key: "date", title: "Дата создания", className: "hidden lg:table-cell" },
                    { key: "status", title: "Статус", align: "center" },
                    { key: "actions", title: "Действия", align: "center" },
                  ]}
                  data={news}
                  renderRow={(item) => (
                    <tr
                      key={item.id}
                      className="border-b transition-colors"
                      style={{ borderColor: "var(--color-primary-400)" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-primary-400)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <h3
                            className="font-medium truncate max-w-xs"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {item.title}
                          </h3>
                          <p
                            className="text-sm truncate max-w-xs mt-1"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {item.shortDescription}
                          </p>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 text-sm hidden md:table-cell"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {item.author.displayName || item.author.name}
                      </td>
                      <td
                        className="px-4 py-3 text-sm hidden lg:table-cell"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            toggleNewsStatus(item.id, item.isActive)
                          }
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: item.isActive 
                              ? "var(--color-success)" 
                              : "var(--color-primary-400)",
                            color: "var(--color-text-primary)"
                          }}
                        >
                          {item.isActive ? "Активна" : "Скрыта"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <Link
                            href={`/admin/news/${item.id}/edit`}
                            className="btn-discord btn-discord-secondary text-xs px-2 py-1"
                          >
                            ✏️ Изменить
                          </Link>
                          <button
                            onClick={() => deleteNews(item.id)}
                            className="text-xs px-2 py-1 rounded transition-colors"
                            style={{
                              backgroundColor: "var(--color-danger)",
                              color: "var(--color-text-primary)"
                            }}
                          >
                            🗑️ Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  emptyMessage="Новостей пока нет"
                  loading={loading}
                />

                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalCount}
                      onPageChange={setCurrentPage}
                      loading={loading}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
