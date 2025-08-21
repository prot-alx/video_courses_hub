// Rate limiting utility
import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (в продакшене лучше использовать Redis)
const store: RateLimitStore = {};

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 10 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // время окна в миллисекундах
  maxRequests: number; // максимум запросов за окно
  message?: string;
}

export function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = "Too many requests" } = config;

  return async (request: NextRequest) => {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const key = `${ip}:${request.nextUrl.pathname}`;
    const now = Date.now();

    // Получаем или создаем запись для этого IP + path
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return null; // Не превышен лимит
    }

    // Увеличиваем счетчик
    store[key].count++;

    if (store[key].count > maxRequests) {
      return NextResponse.json(
        {
          success: false,
          error: message,
          retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (store[key].resetTime - now) / 1000
            ).toString(),
          },
        }
      );
    }

    return null; // Не превышен лимит
  };
}

// Предустановленные конфигурации
export const rateLimitConfigs = {
  // Строгий лимит для аутентификации (login/signup)
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 попыток за 15 минут

  // Мягкий лимит для session проверок
  session: { windowMs: 60 * 1000, maxRequests: 200 }, // 200 запросов в минуту

  // Средний лимит для API
  api: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 запросов в минуту

  // Лимит для загрузки файлов
  upload: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 загрузок в минуту

  // Общий лимит
  general: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 запросов в минуту
};
