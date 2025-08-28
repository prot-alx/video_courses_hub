import { useState, useMemo, useCallback, useEffect } from "react";
import type { CourseMainFilter, CourseSubFilter, Course } from "@/types";

interface CourseFilterProps {
  mainFilter: CourseMainFilter;
  onMainFilterChange: (filter: CourseMainFilter) => void;
  subFilter: CourseSubFilter;
  onSubFilterChange: (filter: CourseSubFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  courses: Course[];
}

// Простой дебаунс без библиотек
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function CourseFilter({
  mainFilter,
  onMainFilterChange,
  subFilter,
  onSubFilterChange,
  searchQuery,
  onSearchChange,
  courses,
}: Readonly<CourseFilterProps>) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  
  // Дебаунс для поиска
  const debouncedSearch = useDebounce(localSearchQuery, 300);

  // Применяем дебаунс к поиску
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch]);

  // Синхронизируем внешний searchQuery с локальным только при изменении извне
  useEffect(() => {
    if (searchQuery !== localSearchQuery && searchQuery !== debouncedSearch) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  const handleLocalSearchChange = useCallback((value: string) => {
    setLocalSearchQuery(value);
  }, []);

  const mainFilters: Array<{
    id: CourseMainFilter;
    label: string;
    description: string;
  }> = [
    {
      id: "my",
      label: "Мои курсы",
      description: "Курсы с доступом",
    },
    {
      id: "all",
      label: "Все курсы",
      description: "Показать все курсы",
    },
  ];

  const subFilters: Array<{
    id: CourseSubFilter;
    label: string;
  }> = [
    {
      id: "all",
      label: "Все",
    },
    {
      id: "free",
      label: "Бесплатные",
    },
    {
      id: "paid",
      label: "Платные",
    },
  ];

  // Автозаполнение для поиска
  const searchSuggestions = useMemo(() => {
    if (!localSearchQuery || localSearchQuery.length < 2) return [];
    
    return courses
      .filter(course => 
        course.title.toLowerCase().includes(localSearchQuery.toLowerCase())
      )
      .slice(0, 5)
      .map(course => course.title);
  }, [courses, localSearchQuery]);

  return (
    <div className="mb-8 space-y-6">
      {/* Основные фильтры */}
      <div className="flex flex-wrap justify-center gap-4">
        {mainFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onMainFilterChange(filter.id)}
            className={`w-60 px-4 py-3 rounded-lg border transition-all duration-200 ${
              mainFilter === filter.id
                ? "border-accent bg-accent text-primary-300"
                : "border-primary-400 hover:border-accent"
            }`}
            style={{
              background:
                mainFilter === filter.id
                  ? "var(--color-accent)"
                  : "var(--color-primary-300)",
              borderColor:
                mainFilter === filter.id
                  ? "var(--color-accent)"
                  : "var(--color-primary-400)",
              color:
                mainFilter === filter.id
                  ? "var(--color-primary-300)"
                  : "var(--color-text-primary)",
            }}
          >
            <div className="text-sm font-medium">{filter.label}</div>
            <div
              className="text-xs mt-1"
              style={{
                color:
                  mainFilter === filter.id
                    ? "var(--color-primary-300)"
                    : "var(--color-text-secondary)",
              }}
            >
              {filter.description}
            </div>
          </button>
        ))}
      </div>

      {/* Подфильтры и поиск */}
      <div className="flex flex-wrap justify-center gap-4 items-center">
        {/* Подфильтры по типу курса */}
        <div className="flex gap-2 px-4 py-2 rounded-lg border border-primary-400">
          {subFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onSubFilterChange(filter.id)}
              className={`px-3 py-1 rounded text-sm transition-all ${
                subFilter === filter.id
                  ? "bg-accent text-primary-300"
                  : "hover:bg-primary-400"
              }`}
              style={{
                background:
                  subFilter === filter.id
                    ? "var(--color-accent)"
                    : "transparent",
                color:
                  subFilter === filter.id
                    ? "var(--color-primary-300)"
                    : "var(--color-text-primary)",
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Поиск с автозаполнением и дебаунсом */}
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск курсов..."
            value={localSearchQuery}
            onChange={(e) => handleLocalSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="px-4 py-2 rounded-lg border border-primary-400 bg-primary-300 text-text-primary placeholder-text-secondary w-64 focus:border-accent focus:outline-none"
            style={{
              background: "var(--color-primary-300)",
              borderColor: "var(--color-primary-400)",
              color: "var(--color-text-primary)",
            }}
          />
          
          {/* Выпадающий список автозаполнения */}
          {isSearchFocused && searchSuggestions.length > 0 && (
            <div 
              className="absolute top-full left-0 right-0 mt-1 border border-primary-400 rounded-lg bg-primary-300 shadow-lg z-10 max-h-40 overflow-y-auto"
              style={{
                background: "var(--color-primary-300)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleLocalSearchChange(suggestion);
                    setIsSearchFocused(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-primary-400 transition-colors"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Кнопка очистки поиска */}
        {localSearchQuery && (
          <button
            onClick={() => handleLocalSearchChange("")}
            className="px-3 py-2 rounded-lg border border-primary-400 hover:border-accent transition-colors text-sm"
            style={{
              borderColor: "var(--color-primary-400)",
              color: "var(--color-text-secondary)",
            }}
          >
            Очистить
          </button>
        )}
      </div>
    </div>
  );
}