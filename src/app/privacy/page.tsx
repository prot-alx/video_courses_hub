"use client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto px-6 py-8">
        <h1
          className="text-4xl font-bold mb-8 text-center"
          style={{ color: "var(--color-text-primary)" }}
        >
          Политика конфиденциальности
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
                Мы серьезно относимся к защите ваших персональных данных. В
                данной политике конфиденциальности объясняется, как мы собираем,
                используем и защищаем вашу информацию.
              </p>
              <p
                className="text-sm mt-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
              </p>
            </div>
          </section>

          {/* Сбор информации */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              1. Информация, которую мы собираем
            </h2>
            <div
              className="space-y-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              <div>
                <h3 className="text-lg font-medium mb-2">
                  1.1 Информация, которую вы предоставляете
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Имя и адрес электронной почты (через Google OAuth)</li>
                  <li>Контактные данные (телефон, Telegram)</li>
                  <li>Сообщения через форму обратной связи</li>
                  <li>Отзывы и оценки курсов</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">
                  1.2 Автоматически собираемая информация
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP-адрес и данные о браузере</li>
                  <li>Информация о посещенных страницах</li>
                  <li>Время и дата доступа к сервису</li>
                  <li>Данные о просмотренных курсах и видео</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Использование информации */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              2. Как мы используем информацию
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
                <li>• Предоставление доступа к образовательным материалам</li>
                <li>• Обработка запросов на доступ к курсам</li>
                <li>• Связь с пользователями и техническая поддержка</li>
                <li>• Улучшение качества услуг и пользовательского опыта</li>
                <li>• Обеспечение безопасности платформы</li>
                <li>• Отправка уведомлений о новостях и обновлениях</li>
              </ul>
            </div>
          </section>

          {/* Google OAuth */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              3. Авторизация через Google
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
                Мы используем Google OAuth для безопасной авторизации
                пользователей. При входе через Google мы получаем:
              </p>
              <ul
                className="list-disc list-inside space-y-1 ml-4 mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                <li>Ваше имя</li>
                <li>Адрес электронной почты</li>
                <li>Уникальный идентификатор Google</li>
              </ul>
              <p style={{ color: "var(--color-text-primary)" }}>
                Мы не имеем доступа к вашему паролю Google и другим данным
                вашего аккаунта Google.
              </p>
            </div>
          </section>

          {/* Передача данных */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              4. Передача данных третьим лицам
            </h2>
            <div
              className="space-y-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              <p>
                Мы не продаем, не обмениваем и не передаем ваши персональные
                данные третьим лицам, за исключением следующих случаев:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>С вашего явного согласия</li>
                <li>
                  Поставщикам услуг, которые помогают нам в работе платформы
                  (хостинг, email-сервисы)
                </li>
                <li>При требовании закона или защиты наших прав</li>
              </ul>
            </div>
          </section>

          {/* Сторонние сервисы */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              5. Сторонние сервисы
            </h2>
            <div
              className="space-y-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              <div>
                <h3 className="text-lg font-medium mb-2">5.1 Google OAuth</h3>
                <p className="mb-2">
                  Для авторизации мы используем Google OAuth. Политика
                  конфиденциальности Google:{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    https://policies.google.com/privacy
                  </a>
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">5.2 Email-сервис</h3>
                <p>
                  Для отправки электронных писем мы используем сервис Resend.
                  {" "}
                  <a
                    href="https://resend.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    https://resend.com
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Защита данных */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              6. Защита данных
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
                Мы применяем различные меры безопасности для защиты ваших
                данных:
              </p>
              <ul
                className="list-disc list-inside space-y-1 ml-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                <li>Шифрование данных при передаче (HTTPS/SSL)</li>
                <li>Безопасное хранение данных в базе данных</li>
                <li>Ограничение доступа к персональным данным</li>
                <li>Регулярное обновление системы безопасности</li>
                <li>Мониторинг и логирование доступа к данным</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              7. Файлы cookie и сессии
            </h2>
            <div
              className="space-y-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              <p>Мы используем файлы cookie и сессии для:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Поддержания авторизованной сессии пользователя</li>
                <li>Сохранения предпочтений пользователя</li>
                <li>Обеспечения безопасности</li>
                <li>Анализа использования платформы</li>
              </ul>
              <p>
                Вы можете настроить свой браузер для отклонения файлов cookie,
                однако это может ограничить функциональность сайта.
              </p>
            </div>
          </section>

          {/* Ваши права */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              8. Ваши права
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
                Вы имеете право:
              </p>
              <ul
                className="list-disc list-inside space-y-1 ml-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                <li>Запросить доступ к вашим персональным данным</li>
                <li>Потребовать исправления неточных данных</li>
                <li>Запросить удаление ваших данных</li>
                <li>Ограничить обработку ваших данных</li>
                <li>Получить копию ваших данных</li>
                <li>Отозвать согласие на обработку данных</li>
              </ul>
            </div>
          </section>

          {/* Хранение данных */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              9. Сроки хранения данных
            </h2>
            <p style={{ color: "var(--color-text-primary)" }}>
              Мы храним ваши персональные данные только до тех пор, пока это
              необходимо для предоставления услуг или выполнения законных
              обязательств. При удалении аккаунта ваши данные будут удалены в
              течение 30 дней, за исключением данных, которые мы обязаны хранить
              по закону.
            </p>
          </section>

          {/* Изменения политики */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              10. Изменения политики конфиденциальности
            </h2>
            <p style={{ color: "var(--color-text-primary)" }}>
              Мы можем обновлять данную политику конфиденциальности время от
              времени. О существенных изменениях мы уведомим вас по электронной
              почте или через уведомления на платформе.
            </p>
          </section>

          {/* Контактная информация */}
          <section className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              11. Контактная информация
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
                Если у вас есть вопросы о данной политике конфиденциальности или
                обработке ваших данных, свяжитесь с нами:
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
                Используя нашу платформу, вы подтверждаете, что прочитали и
                согласились с данной политикой конфиденциальности.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
