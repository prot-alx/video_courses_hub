"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "Ошибка конфигурации сервера. Попробуйте позже.";
      case "AccessDenied":
        return "Доступ запрещен. Проверьте права доступа.";
      case "Verification":
        return "Ошибка верификации. Попробуйте войти снова.";
      default:
        return "Произошла ошибка при входе. Попробуйте снова.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Ошибка входа
          </h2>
          <p className="mt-2 text-sm text-gray-600">{getErrorMessage(error)}</p>
          {error && (
            <p className="mt-2 text-xs text-gray-400">Код ошибки: {error}</p>
          )}
        </div>
        <div className="text-center">
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </Link>
        </div>
      </div>
    </div>
  );
}
