"use client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto px-6 py-8">
        <h1
          className="text-4xl font-bold mb-8 text-center"
          style={{ color: "var(--color-text-primary)" }}
        >
          О нашей школе
        </h1>

        {/* История школы */}
        <section className="mb-12">
          <h2
            className="text-2xl font-semibold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            📖 Наша история
          </h2>
          <div
            className="p-6 rounded-lg border"
            style={{
              background: "var(--color-primary-100)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <p
              className="text-lg leading-relaxed mb-4"
              style={{ color: "var(--color-primary-400)" }}
            >
              Наша образовательная школа была основана с целью предоставить
              качественное и доступное образование для всех желающих. Мы
              объединяем традиционные методы обучения с современными
              технологиями.
            </p>
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--color-primary-400)" }}
            >
              За годы работы мы помогли сотням учеников достичь своих целей и
              освоить новые навыки. Наша команда опытных педагогов постоянно
              совершенствует методики преподавания.
            </p>
          </div>
        </section>

        {/* Миссия и ценности */}
        <section className="mb-12">
          <h2
            className="text-2xl font-semibold mb-6"
            style={{ color: "var(--color-text-primary)" }}
          >
            🎯 Наша миссия и ценности
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div
              className="p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-100)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: "var(--color-primary-400)" }}
              >
                🚀 Миссия
              </h3>
              <p style={{ color: "var(--color-primary-400)" }}>
                Предоставлять качественное образование, развивать потенциал
                каждого ученика и помогать достигать личных и профессиональных
                целей.
              </p>
            </div>
            <div
              className="p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-100)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: "var(--color-primary-400)" }}
              >
                💎 Ценности
              </h3>
              <ul
                className="space-y-2"
                style={{ color: "var(--color-primary-400)" }}
              >
                <li>• Качество образования</li>
                <li>• Индивидуальный подход</li>
                <li>• Инновационные методы</li>
                <li>• Поддержка учеников</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Достижения */}
        <section className="mb-12">
          <h2
            className="text-2xl font-semibold mb-6"
            style={{ color: "var(--color-text-primary)" }}
          >
            🏆 Наши достижения
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div
              className="text-center p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-300)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <div className="text-4xl mb-2">500+</div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                Выпускников
              </div>
            </div>
            <div
              className="text-center p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-300)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <div className="text-4xl mb-2">50+</div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                Курсов
              </div>
            </div>
            <div
              className="text-center p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-300)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <div className="text-4xl mb-2">95%</div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                Довольных учеников
              </div>
            </div>
          </div>
        </section>

        {/* Форматы обучения */}
        <section className="mb-12">
          <h2
            className="text-2xl font-semibold mb-6"
            style={{ color: "var(--color-text-primary)" }}
          >
            📚 Форматы обучения
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div
              className="p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-100)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <h3
                className="text-xl font-semibold mb-3 flex items-center gap-2"
                style={{ color: "var(--color-primary-400)" }}
              >
                🏫 Очные занятия
              </h3>
              <p className="mb-3" style={{ color: "var(--color-primary-400)" }}>
                Традиционные занятия в классе с преподавателем и другими
                учениками.
              </p>
              <ul
                className="space-y-1 text-sm"
                style={{ color: "var(--color-primary-400)" }}
              >
                <li>• Живое общение с преподавателем</li>
                <li>• Работа в группе</li>
                <li>• Практические занятия</li>
                <li>• Немедленная обратная связь</li>
              </ul>
            </div>
            <div
              className="p-6 rounded-lg border"
              style={{
                background: "var(--color-primary-100)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <h3
                className="text-xl font-semibold mb-3 flex items-center gap-2"
                style={{ color: "var(--color-primary-400)" }}
              >
                💻 Онлайн обучение
              </h3>
              <p className="mb-3" style={{ color: "var(--color-primary-400)" }}>
                Гибкое дистанционное обучение через нашу платформу.
              </p>
              <ul
                className="space-y-1 text-sm"
                style={{ color: "var(--color-primary-400)" }}
              >
                <li>• Обучение в удобное время</li>
                <li>• Доступ к записям уроков</li>
                <li>• Интерактивные материалы</li>
                <li>• Поддержка наставников</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div
            className="p-8 rounded-lg border"
            style={{
              background: "var(--color-primary-200)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Готовы присоединиться к нам?
            </h2>
            <p
              className="text-lg mb-6"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Начните своё образовательное путешествие уже сегодня
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" className="btn-discord btn-discord-primary">
                📚 Посмотреть курсы
              </Link>
              <Link
                href="/contacts"
                className="btn-discord btn-discord-secondary"
              >
                📞 Связаться с нами
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
