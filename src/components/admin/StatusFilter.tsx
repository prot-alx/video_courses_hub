interface FilterOption {
  key: "all" | "new" | "approved" | "rejected";
  label: string;
  count?: number;
}

interface StatusFilterProps {
  activeFilter: "all" | "new" | "approved" | "rejected";
  onFilterChange: (filter: "all" | "new" | "approved" | "rejected") => void;
  counts?: {
    all: number;
    new: number;
    approved: number;
    rejected: number;
  };
}

export default function StatusFilter({
  activeFilter,
  onFilterChange,
  counts,
}: Readonly<StatusFilterProps>) {
  const filters: FilterOption[] = [
    { key: "all", label: "Все", count: counts?.all },
    { key: "new", label: "Новые", count: counts?.new },
    { key: "approved", label: "Одобренные", count: counts?.approved },
    { key: "rejected", label: "Отклоненные", count: counts?.rejected },
  ];

  return (
    <div className="flex gap-3 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`btn-discord relative ${
            activeFilter === filter.key
              ? "btn-discord-primary"
              : "btn-discord-secondary"
          }`}
        >
          {filter.label}
          {filter.count !== undefined && filter.count > 0 && (
            <span
              className="ml-2 px-2 py-1 text-xs rounded-full"
              style={{
                background:
                  activeFilter === filter.key
                    ? "rgba(255, 255, 255, 0.2)"
                    : "var(--color-primary-400)",
                color:
                  activeFilter === filter.key
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
              }}
            >
              {filter.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
