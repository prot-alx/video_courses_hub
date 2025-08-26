"use client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto px-6 py-8">
        <h1
          className="text-4xl font-bold mb-8 text-center"
          style={{ color: "var(--color-text-primary)" }}
        >
          Условия использования
        </h1>

        <div
          className="prose max-w-none"
          style={{ color: "var(--color-text-primary)" }}
        >
          {/* Введение */}
          <section className="mb-8">
            <div
              className="p-6 rounded-lg border mb-6"
              style={{
                background: "var(--color-primary-100)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <p
                className="text-lg"
                style={{ color: "var(--color-primary-400)" }}
              >
                Добро пожаловать на нашу образовательную платформу! Используя
                наши услуги, вы соглашаетесь с настоящими условиями
                использования.
              </p>
              <p
                className="text-sm mt-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
              </p>
            </div>
          </section>

          {/* Определения */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              1. Определения
            </h2>
            <div
              className="p-4 rounded-lg border"
              style={{
                background: "var(--color-primary-50)",
                borderColor: "var(--color-primary-300)",
              }}
            >
              <ul
                className="space-y-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                <li>
                  <strong>Платформа</strong> — наш веб-сайт и сервис для
                  онлайн-обучения
                </li>
                <li>
                  <strong>Пользователь</strong> — лицо, использующее наши услуги
                </li>
                <li>
                  <strong>Контент</strong> — все материалы, размещенные на
                  платформе
                </li>
                <li>
                  <strong>Курсы</strong> — образовательные программы,
                  предоставляемые через платформу
                </li>
              </ul>
            </div>
          </section>

          {/* Использование сервиса */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              2. Использование сервиса
            </h2>
            <div
              className="space-y-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              <div>
                <h3 className="text-lg font-medium mb-2">
                  2.1 Права пользователя
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Доступ к бесплатным образовательным материалам</li>
                  <li>
                    Запрос доступа к платным курсам в соответствии с условиями
                  </li>
                  <li>Использование платформы для обучения</li>
                  <li>Обращение в службу поддержки</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">
                  2.2 Обязанности пользователя
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Предоставлять достоверную информацию при регистрации</li>
                  <li>
                    Не нарушать авторские права и интеллектуальную собственность
                  </li>
                  <li>Не распространять содержимое курсов третьим лицам</li>
                  <li>Соблюдать правила поведения на платформе</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Интеллектуальная собственность */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              3. Интеллектуальная собственность
            </h2>
            <div
              className="p-4 rounded-lg border"
              style={{
                background: "var(--color-primary-50)",
                borderColor: "var(--color-primary-300)",
              }}
            >
              <p
                className="mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                Все материалы на платформе (видео, тексты, изображения, код)
                защищены авторским правом и принадлежат нашей организации или
                используются с разрешения правообладателей.
              </p>
              <p style={{ color: "var(--color-text-primary)" }}>
                Запрещается копирование, распространение, воспроизведение или
                любое другое использование материалов без письменного
                разрешения.
              </p>
            </div>
          </section>

          {/* Ответственность */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              4. Ответственность
            </h2>
            <div
              className="space-y-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              <div>
                <h3 className="text-lg font-medium mb-2">
                  4.1 Наша ответственность
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Обеспечение качества образовательного контента</li>
                  <li>Техническая поддержка платформы</li>
                  <li>Защита персональных данных пользователей</li>
                  <li>Своевременное реагирование на обращения</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">
                  4.2 Ограничения ответственности
                </h3>
                <p>
                  Мы не несем ответственности за временные технические сбои,
                  перерывы в работе сервиса, а также за любые косвенные убытки,
                  связанные с использованием платформы.
                </p>
              </div>
            </div>
          </section>

          {/* Конфиденциальность */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              5. Конфиденциальность
            </h2>
            <div
              className="p-4 rounded-lg border"
              style={{
                background: "var(--color-primary-50)",
                borderColor: "var(--color-primary-300)",
              }}
            >
              <p
                className="mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                Мы серьезно относимся к защите ваших персональных данных.
                Подробную информацию о сборе, использовании и защите данных вы
                можете найти в нашей{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Политике конфиденциальности
                </a>
                .
              </p>
            </div>
          </section>

          {/* Изменения условий */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              6. Изменения условий
            </h2>
            <p style={{ color: "var(--color-text-primary)" }}>
              Мы оставляем за собой право изменять настоящие условия
              использования. О существенных изменениях мы уведомим пользователей
              заблаговременно через электронную почту или уведомления на
              платформе.
            </p>
          </section>

          {/* Контактная информация */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              7. Контактная информация
            </h2>
            <div
              className="p-4 rounded-lg border"
              style={{
                background: "var(--color-primary-50)",
                borderColor: "var(--color-primary-300)",
              }}
            >
              <p
                className="mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Если у вас есть вопросы по настоящим условиям использования,
                свяжитесь с нами:
              </p>
              <ul
                className="space-y-1"
                style={{ color: "var(--color-text-primary)" }}
              >
                <li>• Через форму обратной связи на сайте</li>
                <li>• На странице контактов</li>
                <li>• Через службу поддержки</li>
              </ul>
            </div>
          </section>

          {/* Заключение */}
          <section>
            <div
              className="p-6 rounded-lg border text-center"
              style={{
                background: "var(--color-primary-100)",
                borderColor: "var(--color-primary-400)",
              }}
            >
              <p
                className="text-lg font-medium"
                style={{ color: "var(--color-primary-400)" }}
              >
                Используя нашу платформу, вы подтверждаете, что прочитали,
                поняли и согласились с настоящими условиями использования.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
