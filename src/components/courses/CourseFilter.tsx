interface CourseFilterProps {
  activeFilter: "all" | "free" | "paid";
  onFilterChange: (filter: "all" | "free" | "paid") => void;
}

export default function CourseFilter({
  activeFilter,
  onFilterChange,
}: Readonly<CourseFilterProps>) {
  const filters = [
    { key: "all" as const, label: "Все курсы" },
    { key: "free" as const, label: "Бесплатные" },
    { key: "paid" as const, label: "Платные" },
  ];

  return (
    <div className="flex justify-center gap-4 mb-8">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`btn-discord ${
            activeFilter === filter.key
              ? "btn-discord-primary"
              : "btn-discord-secondary"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
