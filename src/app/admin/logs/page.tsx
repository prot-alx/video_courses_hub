"use client";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToastContext } from "@/components/providers/ToastProvider";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import LogsTable from "@/components/admin/LogsTable";
import type { ApiResponse } from "@/types";

interface SimpleLog {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
}

interface LogsPagination {
  current: number;
  total: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface LogsFilters {
  actions: string[];
}

interface LogsData {
  logs: SimpleLog[];
  pagination: LogsPagination;
  filters: LogsFilters;
}

export default function AdminLogsPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const toast = useToastContext();
  const [logsData, setLogsData] = useState<LogsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояние фильтров
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAction, setSelectedAction] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", "20");
      
      if (selectedAction) params.append("action", selectedAction);
      if (searchQuery) params.append("search", searchQuery);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const response = await fetch(`/api/admin/logs?${params.toString()}`);
      const data: ApiResponse<LogsData> = await response.json();

      if (data.success && data.data) {
        setLogsData(data.data);
        setError(null);
      } else {
        const errorMsg = data.error || "Ошибка загрузки логов";
        setError(errorMsg);
        toast.error("Ошибка", errorMsg);
      }
    } catch (err) {
      const errorMsg = "Ошибка сети при загрузке логов";
      setError(errorMsg);
      toast.error("Сетевая ошибка", errorMsg);
      console.error("Ошибка загрузки логов:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin, currentPage, selectedAction, searchQuery, dateFrom, dateTo]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleActionFilter = (action: string) => {
    setSelectedAction(action);
    setCurrentPage(1);
  };

  const handleDateFilter = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSelectedAction("");
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Требуется авторизация
          </h2>
          <p className="text-gray-600 mb-6">
            Войдите в систему для доступа к админке
          </p>
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Войти
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Доступ запрещен
          </h2>
          <p className="text-gray-600 mb-6">У вас нет прав администратора</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            На главную
          </Link>
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
        title="Логи системы" 
        onSignOut={handleSignOut} 
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNavigation />

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50">
            <div className="flex justify-between items-center">
              <p className="text-red-800 text-sm">❌ {error}</p>
              <button
                onClick={fetchLogs}
                className="text-sm text-red-600 hover:text-red-500 underline"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        )}

        <LogsTable
          logsData={logsData}
          isLoading={isLoading}
          onSearch={handleSearch}
          onActionFilter={handleActionFilter}
          onDateFilter={handleDateFilter}
          onPageChange={handlePageChange}
          onClearFilters={clearFilters}
          currentFilters={{
            search: searchQuery,
            action: selectedAction,
            dateFrom,
            dateTo,
          }}
        />
      </div>
    </div>
  );
}