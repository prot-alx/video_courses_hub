import type { CourseFilterType } from "@/types";

interface CourseFilterProps {
  activeFilter: CourseFilterType;
  onFilterChange: (filter: CourseFilterType) => void;
}

export default function CourseFilter({
  activeFilter,
  onFilterChange,
}: Readonly<CourseFilterProps>) {
  const filters: Array<{
    id: CourseFilterType;
    label: string;
    description: string;
  }> = [
    {
      id: "all",
      label: "Все курсы",
      description: "Показать все доступные курсы",
    },
    {
      id: "free",
      label: "Бесплатные",
      description: "Только бесплатные курсы",
    },
    {
      id: "paid",
      label: "Платные",
      description: "Только платные курсы",
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-6 py-3 rounded-lg border transition-all duration-200 ${
            activeFilter === filter.id
              ? "border-accent bg-accent text-primary-300"
              : "border-primary-400 hover:border-accent"
          }`}
          style={{
            background:
              activeFilter === filter.id
                ? "var(--color-accent)"
                : "var(--color-primary-300)",
            borderColor:
              activeFilter === filter.id
                ? "var(--color-accent)"
                : "var(--color-primary-400)",
            color:
              activeFilter === filter.id
                ? "var(--color-primary-300)"
                : "var(--color-text-primary)",
          }}
        >
          <div className="text-sm font-medium">{filter.label}</div>
          <div
            className="text-xs mt-1"
            style={{
              color:
                activeFilter === filter.id
                  ? "var(--color-primary-300)"
                  : "var(--color-text-secondary)",
            }}
          >
            {filter.description}
          </div>
        </button>
      ))}
    </div>
  );
}
