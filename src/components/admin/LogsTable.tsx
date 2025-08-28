"use client";
import { useState } from "react";
import Pagination from "./Pagination";

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

interface LogsTableProps {
  logsData: LogsData | null;
  isLoading: boolean;
  onSearch: (query: string) => void;
  onActionFilter: (action: string) => void;
  onDateFilter: (from: string, to: string) => void;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
  currentFilters: {
    search: string;
    action: string;
    dateFrom: string;
    dateTo: string;
  };
}

export default function LogsTable({
  logsData,
  isLoading,
  onSearch,
  onActionFilter,
  onDateFilter,
  onPageChange,
  onClearFilters,
  currentFilters,
}: LogsTableProps) {
  const [searchInput, setSearchInput] = useState(currentFilters.search);
  const [dateFromInput, setDateFromInput] = useState(currentFilters.dateFrom);
  const [dateToInput, setDateToInput] = useState(currentFilters.dateTo);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDateFilter(dateFromInput, dateToInput);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const hasActiveFilters = 
    currentFilters.search || 
    currentFilters.action || 
    currentFilters.dateFrom || 
    currentFilters.dateTo;

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="rounded-lg shadow p-6" style={{ backgroundColor: "var(--color-primary-300)" }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Фильтры</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Поиск */}
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
              Поиск по действию или деталям
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Введите текст для поиска..."
                className="flex-1 input-discord"
              />
              <button
                type="submit"
                className="btn-discord btn-discord-primary"
              >
                🔍
              </button>
            </div>
          </form>

          {/* Фильтр по действию */}
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
              Действие
            </label>
            <select
              value={currentFilters.action}
              onChange={(e) => onActionFilter(e.target.value)}
              className="w-full input-discord"
            >
              <option value="">Все действия</option>
              {logsData?.filters.actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          {/* Фильтр по датам */}
          <form onSubmit={handleDateSubmit} className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
              Период
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={dateFromInput}
                onChange={(e) => setDateFromInput(e.target.value)}
                placeholder="От"
                className="w-full input-discord"
              />
              <input
                type="date"
                value={dateToInput}
                onChange={(e) => setDateToInput(e.target.value)}
                placeholder="До"
                className="w-full input-discord"
              />
              <button
                type="submit"
                className="w-full btn-discord btn-discord-success"
              >
                Применить даты
              </button>
            </div>
          </form>
        </div>

        {/* Очистить фильтры */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={onClearFilters}
              className="btn-discord btn-discord-secondary"
            >
              🗑️ Очистить фильтры
            </button>
          </div>
        )}
      </div>

      {/* Статистика */}
      {logsData?.pagination && (
        <div className="rounded-lg shadow p-4" style={{ backgroundColor: "var(--color-primary-300)" }}>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Показано {logsData.logs.length} из {logsData.pagination.totalItems} записей
            {hasActiveFilters && " (с учетом фильтров)"}
          </p>
        </div>
      )}

      {/* Таблица логов */}
      <div className="rounded-lg shadow overflow-hidden" style={{ backgroundColor: "var(--color-primary-300)" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "var(--color-primary-400)" }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-primary)" }}>
                  Дата и время
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-primary)" }}>
                  Действие
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-primary)" }}>
                  Детали
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: "var(--color-primary-300)" }}>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="ml-2" style={{ color: "var(--color-text-secondary)" }}>Загрузка логов...</span>
                    </div>
                  </td>
                </tr>
              ) : !logsData?.logs || logsData.logs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center" style={{ color: "var(--color-text-secondary)" }}>
                    {hasActiveFilters 
                      ? "Логи не найдены с заданными фильтрами"
                      : "Логи отсутствуют"
                    }
                  </td>
                </tr>
              ) : (
                logsData.logs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="border-b transition-colors"
                    style={{ 
                      borderColor: "var(--color-primary-400)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-primary-400)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--color-text-primary)" }}>
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-text-primary)" }}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--color-text-primary)" }}>
                      {log.details ? (
                        <div className="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl">
                          <p className="break-words">{log.details}</p>
                        </div>
                      ) : (
                        <span className="italic" style={{ color: "var(--color-text-secondary)" }}>Нет деталей</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагинация */}
      {logsData?.pagination && (
        <Pagination
          currentPage={logsData.pagination.current}
          totalPages={logsData.pagination.total}
          totalItems={logsData.pagination.totalItems}
          onPageChange={onPageChange}
          loading={isLoading}
        />
      )}
    </div>
  );
}