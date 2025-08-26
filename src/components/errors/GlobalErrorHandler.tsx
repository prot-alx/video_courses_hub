"use client";
import { ErrorBoundary } from "./ErrorBoundary";
import { logError } from "@/lib/errors";

interface Props {
  children: React.ReactNode;
}

export function GlobalErrorHandler({ children }: Readonly<Props>) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Глобальное логирование ошибок
        logError(error, "GlobalErrorHandler");

        // В продакшене здесь можно отправлять ошибки в систему мониторинга
        if (process.env.NODE_ENV === "production") {
          // Например, отправка в Sentry:
          // Sentry.captureException(error, { contexts: { react: errorInfo } });
          // Или в собственную систему аналитики:
          // analytics.track("Error", {
          //   error: error.message,
          //   stack: error.stack,
          //   component: errorInfo.componentStack
          // });
        }
      }}
      fallback={({ error, reset }) => (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div
            className="max-w-lg w-full text-center p-8 rounded-lg border"
            style={{
              background: "var(--color-primary-100)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <div className="mb-6">
              <h1
                className="text-2xl font-bold mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                🚨 Критическая ошибка
              </h1>
              <p
                className="text-base mb-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Приложение столкнулось с критической ошибкой и не может
                продолжить работу.
              </p>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Мы автоматически получили отчет об ошибке и работаем над ее
                исправлением.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full px-4 py-3 text-base font-medium rounded-md transition-colors"
                style={{
                  background: "var(--color-accent)",
                  color: "white",
                }}
              >
                🔄 Попробовать восстановить
              </button>

              <button
                onClick={() => {
                  // Очищаем localStorage на случай поврежденных данных
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch (e) {
                    // Игнорируем ошибки очистки storage
                  }
                  window.location.href = "/";
                }}
                className="w-full px-4 py-3 text-base rounded-md border transition-colors"
                style={{
                  background: "transparent",
                  color: "var(--color-text-primary)",
                  borderColor: "var(--color-primary-400)",
                }}
              >
                🏠 Вернуться на главную
              </button>

              <a
                href="/contacts"
                className="block w-full px-4 py-3 text-base rounded-md border transition-colors text-center"
                style={{
                  background: "transparent",
                  color: "var(--color-text-secondary)",
                  borderColor: "var(--color-primary-400)",
                  textDecoration: "none",
                }}
              >
                📞 Связаться с поддержкой
              </a>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm opacity-70 mb-2">
                  Детали ошибки (режим разработки)
                </summary>
                <pre
                  className="text-xs p-3 rounded overflow-auto max-h-40 border"
                  style={{
                    background: "var(--color-primary-200)",
                    color: "var(--color-text-secondary)",
                    borderColor: "var(--color-primary-400)",
                  }}
                >
                  {error.message}
                  {"\n\n"}
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
