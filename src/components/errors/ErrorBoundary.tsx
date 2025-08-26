"use client";
import React from "react";
import { logError } from "@/lib/errors";

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Логируем ошибку
    logError(error, "ErrorBoundary");

    // Дополнительная информация об ошибке
    logError(
      {
        ...error,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
      "ErrorBoundary"
    );

    // Вызываем callback если передан
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error!}
          reset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

// Компонент по умолчанию для отображения ошибок
function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      className="min-h-[400px] flex items-center justify-center p-6"
      style={{ background: "var(--color-primary-100)" }}
    >
      <div
        className="max-w-md w-full text-center p-6 rounded-lg border"
        style={{
          background: "var(--color-primary-200)",
          borderColor: "var(--color-danger)",
        }}
      >
        <div className="mb-4">
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            ⚠️ Что-то пошло не так
          </h2>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Произошла неожиданная ошибка. Попробуйте обновить страницу или
            обратитесь в поддержку.
          </p>

          {process.env.NODE_ENV === "development" && (
            <details className="text-left mb-4">
              <summary className="cursor-pointer text-xs opacity-70 mb-2">
                Детали ошибки (только в режиме разработки)
              </summary>
              <pre
                className="text-xs p-2 rounded overflow-auto max-h-32"
                style={{
                  background: "var(--color-primary-300)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {error.message}
                {"\n"}
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 text-sm rounded-md transition-colors"
            style={{
              background: "var(--color-accent)",
              color: "white",
            }}
          >
            🔄 Попробовать снова
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm rounded-md transition-colors border"
            style={{
              background: "transparent",
              color: "var(--color-text-primary)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            🔄 Обновить страницу
          </button>
        </div>
      </div>
    </div>
  );
}

// Специализированный Error Boundary для форм
export function FormErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div
          className="p-4 rounded-md border mb-4"
          style={{
            background: "var(--color-primary-100)",
            borderColor: "var(--color-danger)",
          }}
        >
          <h3
            className="font-medium text-sm mb-2"
            style={{ color: "var(--color-danger)" }}
          >
            ⚠️ Ошибка формы
          </h3>
          <p
            className="text-sm mb-3"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Не удалось отобразить форму. Попробуйте обновить страницу.
          </p>
          <button
            onClick={reset}
            className="text-sm px-3 py-1 rounded-md"
            style={{
              background: "var(--color-danger)",
              color: "white",
            }}
          >
            Попробовать снова
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Error Boundary для видео плеера
export function VideoErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div
          className="aspect-video flex items-center justify-center rounded-lg border"
          style={{
            background: "var(--color-primary-200)",
            borderColor: "var(--color-primary-400)",
          }}
        >
          <div className="text-center p-6">
            <h3
              className="font-medium mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              📹 Ошибка воспроизведения
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Не удалось загрузить видео. Проверьте подключение к интернету.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 text-sm rounded-md"
              style={{
                background: "var(--color-accent)",
                color: "white",
              }}
            >
              🔄 Перезагрузить видео
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// HOC для оборачивания компонентов в Error Boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
