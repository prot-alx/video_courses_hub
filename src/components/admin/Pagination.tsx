interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  loading = false,
}: Readonly<PaginationProps>) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="rounded-lg shadow p-4" style={{ backgroundColor: "var(--color-primary-300)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="btn-discord btn-discord-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Предыдущая
          </button>
          
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Страница {currentPage} из {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className="btn-discord btn-discord-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Следующая →
          </button>
        </div>

        {/* Быстрая навигация по страницам */}
        <div className="hidden md:flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber: number;
            
            if (totalPages <= 5) {
              // Если страниц мало, показываем все
              pageNumber = i + 1;
            } else {
              // Логика для показа страниц вокруг текущей
              const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              pageNumber = start + i;
            }
            
            const isCurrentPage = pageNumber === currentPage;
            
            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                disabled={loading}
                className={`btn-discord ${
                  isCurrentPage
                    ? "btn-discord-primary"
                    : "btn-discord-secondary"
                } disabled:opacity-50`}
              >
                {pageNumber}
              </button>
            );
          })}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <span className="px-2" style={{ color: "var(--color-text-secondary)" }}>...</span>
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={loading}
                className="btn-discord btn-discord-secondary disabled:opacity-50"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Дополнительная информация */}
      <div className="mt-2 text-center">
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Всего записей: {totalItems}
        </span>
      </div>
    </div>
  );
}