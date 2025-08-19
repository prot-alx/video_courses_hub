// lib/utils.ts (обновленная версия без дублирования)

// Реэкспорт утилит для работы с длительностью
export {
  formatDuration,
  formatCourseDuration,
  parseDuration,
} from "./utils/duration";

// Другие утилиты для классов CSS, валидации и т.д.
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Утилита для безопасного парсинга JSON
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// Утилита для дебаунса (улучшенная типизация)
export function debounce<TArgs extends unknown[], TReturn>(
  func: (...args: TArgs) => TReturn,
  wait: number
): (...args: TArgs) => void {
  let timeout: NodeJS.Timeout;
  return (...args: TArgs) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
