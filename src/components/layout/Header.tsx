// components/layout/Header.tsx
"use client";
import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1
                className="text-xl font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                🎓 Образовательная школа
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
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
      <div className="max-w-7xl mx-auto">
        {/* Desktop Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <h1
                className="text-xl font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                🎓 Образовательная школа
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                href="/"
                className={`text-sm font-medium hover:opacity-80 transition-opacity ${
                  pathname === "/" ? "font-semibold" : ""
                }`}
                style={{
                  color:
                    pathname === "/"
                      ? "var(--color-primary-400)"
                      : "var(--color-text-primary)",
                }}
              >
                Главная
              </Link>
              <Link
                href="/courses"
                className={`text-sm font-medium hover:opacity-80 transition-opacity ${
                  pathname === "/courses" ? "font-semibold" : ""
                }`}
                style={{
                  color:
                    pathname === "/courses"
                      ? "var(--color-primary-400)"
                      : "var(--color-text-primary)",
                }}
              >
                Курсы
              </Link>
              <Link
                href="/about"
                className={`text-sm font-medium hover:opacity-80 transition-opacity ${
                  pathname === "/about" ? "font-semibold" : ""
                }`}
                style={{
                  color:
                    pathname === "/about"
                      ? "var(--color-primary-400)"
                      : "var(--color-text-primary)",
                }}
              >
                О школе
              </Link>
              <Link
                href="/teachers"
                className={`text-sm font-medium hover:opacity-80 transition-opacity ${
                  pathname === "/teachers" ? "font-semibold" : ""
                }`}
                style={{
                  color:
                    pathname === "/teachers"
                      ? "var(--color-primary-400)"
                      : "var(--color-text-primary)",
                }}
              >
                Педагоги
              </Link>
              <Link
                href="/contacts"
                className={`text-sm font-medium hover:opacity-80 transition-opacity ${
                  pathname === "/contacts" ? "font-semibold" : ""
                }`}
                style={{
                  color:
                    pathname === "/contacts"
                      ? "var(--color-primary-400)"
                      : "var(--color-text-primary)",
                }}
              >
                Контакты
              </Link>
            </nav>
          </div>

          {/* Desktop Auth + Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span
                    className="hidden lg:block text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Привет, {user?.name || user?.email?.split("@")[0]}!
                    {isAdmin && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Админ
                      </span>
                    )}
                  </span>

                  <Link
                    href="/profile"
                    className="btn-discord btn-discord-secondary text-xs px-3 py-1"
                  >
                    👤
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="btn-discord btn-discord-secondary text-xs px-3 py-1"
                    >
                      ⚙️
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="btn-discord btn-discord-secondary text-xs px-3 py-1"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="btn-discord btn-discord-primary text-sm px-4 py-2"
                >
                  Войти
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md"
              style={{ color: "var(--color-text-primary)" }}
              aria-label="Открыть меню"
            >
              {isMobileMenuOpen ? (
                <span className="text-xl">✕</span>
              ) : (
                <span className="text-xl">☰</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden mt-4 pb-4 border-t"
            style={{ borderColor: "var(--color-primary-400)" }}
          >
            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-3 mt-4">
              <Link
                href="/"
                onClick={toggleMobileMenu}
                className={`text-base font-medium hover:opacity-80 transition-opacity ${
                  pathname === "/" ? "font-semibold" : ""
                }`}
                style={{
                  color:
                    pathname === "/"
                      ? "var(--color-primary-400)"
                      : "var(--color-text-primary)",
                }}
              >
                🏠 Главная
              </Link>
              <Link
                href="/courses"
                onClick={toggleMobileMenu}
                className={`text-base font-medium hover:opacity-80 transition-opacity ${
                  pathname === "/courses" ? "font-semibold" : ""
                }`}
                style={{
                  color:
                    pathname === "/courses"
                      ? "var(--color-primary-400)"
                      : "var(--color-text-primary)",
                }}
              >
                📚 Курсы
              </Link>
              <Link
                href="/about"
                onClick={toggleMobileMenu}
                className={`text-base font-medium hover:opacity-80 transition-opacity ${
                  pathname === "/about" ? "font-semibold" : ""
                }`}
                style={{
                  color:
                    pathname === "/about"
                      ? "var(--color-primary-400)"
                      : "var(--color-text-primary)",
                }}
              >
                🏫 О школе
              </Link>
              <Link
                href="/teachers"
                onClick={toggleMobileMenu}
                className={`text-base font-medium hover:opacity-80 transition-opacity ${
                  pathname === "/teachers" ? "font-semibold" : ""
                }`}
                style={{
                  color:
                    pathname === "/teachers"
                      ? "var(--color-primary-400)"
                      : "var(--color-text-primary)",
                }}
              >
                👨‍🏫 Педагоги
              </Link>
              <Link
                href="/contacts"
                onClick={toggleMobileMenu}
                className={`text-base font-medium hover:opacity-80 transition-opacity ${
                  pathname === "/contacts" ? "font-semibold" : ""
                }`}
                style={{
                  color:
                    pathname === "/contacts"
                      ? "var(--color-primary-400)"
                      : "var(--color-text-primary)",
                }}
              >
                📞 Контакты
              </Link>
            </nav>

            {/* Mobile Auth */}
            <div
              className="mt-6 pt-4 border-t"
              style={{ borderColor: "var(--color-primary-400)" }}
            >
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <div
                    className="text-sm font-medium mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    👋 {user?.name || user?.email?.split("@")[0]}
                    {isAdmin && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Админ
                      </span>
                    )}
                  </div>

                  <Link
                    href="/profile"
                    onClick={toggleMobileMenu}
                    className="text-left btn-discord btn-discord-secondary"
                  >
                    👤 Профиль
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={toggleMobileMenu}
                      className="text-left btn-discord btn-discord-secondary"
                    >
                      ⚙️ Админка
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleSignOut();
                      toggleMobileMenu();
                    }}
                    className="text-left btn-discord btn-discord-secondary"
                  >
                    🚪 Выйти
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleSignIn();
                    toggleMobileMenu();
                  }}
                  className="w-full btn-discord btn-discord-primary"
                >
                  🚀 Войти через Google
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
