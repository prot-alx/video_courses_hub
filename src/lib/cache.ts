// Простой in-memory кэш для оптимизации API запросов
interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number; // время жизни в миллисекундах
}

class MemoryCache {
  private readonly cache = new Map<string, CacheEntry>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Проверяем, не истекло ли время жизни
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Очистка истекших записей
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton экземпляр кэша
export const apiCache = new MemoryCache();

// Утилита для кэшированного fetch
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  cacheKey?: string,
  ttl: number = 5 * 60 * 1000 // 5 минут по умолчанию
): Promise<T> {
  const key = cacheKey || url;

  // Пытаемся получить из кэша
  const cached = apiCache.get<T>(key);
  if (cached) {
    return cached;
  }

  // Если в кэше нет, делаем запрос
  const response = await fetch(url, options);
  const data = await response.json();

  // Кэшируем только успешные ответы
  if (response.ok) {
    apiCache.set(key, data, ttl);
  }

  return data;
}

// Очистка кэша каждые 10 минут
if (typeof window !== "undefined") {
  setInterval(() => {
    apiCache.cleanup();
  }, 10 * 60 * 1000);
}
