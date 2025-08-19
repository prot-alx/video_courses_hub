// components/layout/Header.tsx
"use client";
import { signIn, signOut } from "next-auth/react";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";

export default function Header() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  const handleSignIn = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Показываем лоадер пока загружается сессия
  if (isLoading) {
    return (
      <header
        className="border-b px-6 py-4"
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1
              className="text-xl font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              📚 VideoCourses
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className="border-b px-6 py-4"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            📚 VideoCourses
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                Привет, {user?.name || user?.email?.split("@")[0]}!
                {isAdmin && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Админ
                  </span>
                )}
              </span>

              {/* КНОПКА НАСТРОЕК */}
              <Link
                href="/profile"
                className="btn-discord btn-discord-secondary"
              >
                Профиль
              </Link>

              {isAdmin && (
                <a href="/admin" className="btn-discord btn-discord-secondary">
                  Админка
                </a>
              )}
              <button
                onClick={handleSignOut}
                className="btn-discord btn-discord-secondary"
              >
                Выйти
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="btn-discord btn-discord-primary"
            >
              Войти через Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
