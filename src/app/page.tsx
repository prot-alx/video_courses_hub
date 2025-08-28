"use client";
import { useAuth } from "@/lib/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <div
    className="p-6 rounded-lg border text-center"
    style={{
      background: "var(--color-primary-100)",
      borderColor: "var(--color-primary-400)",
    }}
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3
      className="text-lg font-semibold mb-2"
      style={{ color: "var(--color-primary-400)" }}
    >
      {title}
    </h3>
    <p style={{ color: "var(--color-primary-400)" }}>{description}</p>
  </div>
);

export default function LandingPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section
          className="py-20 px-6"
          style={{ background: "var(--color-primary-200)" }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{ color: "var(--color-text-primary)" }}
            >
              Образовательная школа
            </h1>
            <p
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Современное образование для детей и взрослых. Очные и онлайн
              программы от опытных педагогов.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="btn-discord btn-discord-primary text-lg px-8 py-3"
              >
                📚 Смотреть курсы
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/auth/signin"
                  className="btn-discord btn-discord-secondary text-lg px-8 py-3"
                >
                  🚀 Начать обучение
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-12"
            style={{ color: "var(--color-text-primary)" }}
          >
            Почему выбирают нашу школу
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎓"
              title="Опытные педагоги"
              description="Квалифицированные преподаватели с многолетним опытом работы"
            />
            <FeatureCard
              icon="🔄"
              title="Гибкие форматы"
              description="Очные и онлайн занятия, индивидуальный подход к каждому ученику"
            />
            <FeatureCard
              icon="📈"
              title="Результат"
              description="Проверенные методики обучения с гарантированным результатом"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className="text-3xl font-bold mb-6"
              style={{ color: "var(--color-text-primary)" }}
            >
              {isAuthenticated ? "Продолжайте обучение!" : "Готовы начать?"}
            </h2>
            <p
              className="text-lg mb-8"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {isAuthenticated
                ? "Выберите новый курс или продолжите изучение текущих материалов"
                : "Присоединяйтесь к нашей школе и откройте новые возможности для развития"}
            </p>
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/courses?filter=my"
                  className="btn-discord btn-discord-primary"
                >
                  📚 Мои курсы
                </Link>
                <Link
                  href="/profile"
                  className="btn-discord btn-discord-secondary"
                >
                  👤 Профиль
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/auth/signin"
                  className="btn-discord btn-discord-primary"
                >
                  🚀 Войти через Google
                </a>
                <Link
                  href="/courses"
                  className="btn-discord btn-discord-secondary"
                >
                  📖 Посмотреть курсы
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
