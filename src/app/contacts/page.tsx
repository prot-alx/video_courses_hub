// app/contacts/page.tsx - страница "Контакты"
"use client";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToastContext } from "@/components/providers/ToastProvider";

// Компонент контактной информации
const ContactInfo = ({
  icon,
  title,
  content,
}: {
  icon: string;
  title: string;
  content: string;
}) => (
  <div
    className="p-6 rounded-lg border text-center"
    style={{
      background: "var(--color-primary-100)",
      borderColor: "var(--color-primary-400)",
    }}
  >
    <div className="text-4xl mb-3">{icon}</div>
    <h3
      className="text-lg font-semibold mb-2"
      style={{ color: "var(--color-primary-400)" }}
    >
      {title}
    </h3>
    <p
      className="whitespace-pre-line"
      style={{ color: "var(--color-primary-400)" }}
    >
      {content}
    </p>
  </div>
);

export default function ContactsPage() {
  const toast = useToastContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Ошибка", "Пожалуйста, заполните все обязательные поля");
      return;
    }

    setIsSubmitting(true);

    try {
      // Здесь должен быть реальный API для отправки сообщения
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Имитация запроса

      toast.success(
        "Сообщение отправлено!",
        "Спасибо за обращение! Мы свяжемся с вами в ближайшее время."
      );

      // Очищаем форму
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.log(error);
      toast.error(
        "Ошибка",
        "Не удалось отправить сообщение. Попробуйте позже."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold mb-6"
            style={{ color: "var(--color-text-primary)" }}
          >
            Свяжитесь с нами
          </h1>
          <p
            className="text-lg max-w-3xl mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Мы всегда рады помочь! Свяжитесь с нами любым удобным способом или
            оставьте сообщение через форму обратной связи.
          </p>
        </div>

        {/* Контактная информация */}
        <section className="mb-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ContactInfo
              icon="📍"
              title="Адрес"
              content={`ул. Образовательная, 123\nМосква, Россия\n119000`}
            />
            <ContactInfo
              icon="📞"
              title="Телефон"
              content={`+7 (495) 123-45-67\n+7 (800) 123-45-67\n(звонок бесплатный)`}
            />
            <ContactInfo
              icon="✉️"
              title="Email"
              content={`info@school.ru\nsupport@school.ru\nadmission@school.ru`}
            />
            <ContactInfo
              icon="🕒"
              title="Время работы"
              content={`Пн-Пт: 9:00 - 20:00\nСб: 10:00 - 18:00\nВс: 12:00 - 16:00`}
            />
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Форма обратной связи */}
          <section>
            <h2
              className="text-2xl font-semibold mb-6"
              style={{ color: "var(--color-text-primary)" }}
            >
              📝 Форма обратной связи
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Имя *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    background: "var(--color-primary-100)",
                    borderColor: "var(--color-primary-400)",
                    color: "var(--color-primary-400)",
                  }}
                  placeholder="Ваше имя"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    background: "var(--color-primary-100)",
                    borderColor: "var(--color-primary-400)",
                    color: "var(--color-primary-400)",
                  }}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Тема
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    background: "var(--color-primary-100)",
                    borderColor: "var(--color-primary-400)",
                    color: "var(--color-primary-400)",
                  }}
                >
                  <option value="">Выберите тему</option>
                  <option value="general">Общий вопрос</option>
                  <option value="courses">Вопросы по курсам</option>
                  <option value="enrollment">Поступление</option>
                  <option value="technical">Техническая поддержка</option>
                  <option value="partnership">Сотрудничество</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Сообщение *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  style={{
                    background: "var(--color-primary-100)",
                    borderColor: "var(--color-primary-400)",
                    color: "var(--color-primary-400)",
                  }}
                  placeholder="Опишите ваш вопрос или предложение..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-discord btn-discord-primary w-full"
              >
                {isSubmitting ? "📤 Отправка..." : "📤 Отправить сообщение"}
              </button>
            </form>
          </section>

          {/* Дополнительная информация */}
          <section>
            <h2
              className="text-2xl font-semibold mb-6"
              style={{ color: "var(--color-text-primary)" }}
            >
              📋 Часто задаваемые вопросы
            </h2>
            <div className="space-y-4">
              <div
                className="p-4 rounded-lg border"
                style={{
                  background: "var(--color-primary-100)",
                  borderColor: "var(--color-primary-400)",
                }}
              >
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--color-primary-400)" }}
                >
                  Как записаться на курс?
                </h3>
                <p style={{ color: "var(--color-primary-400)" }}>
                  Вы можете выбрать курс на странице Курсы и оставить заявку. Мы
                  свяжемся с вами для подтверждения записи.
                </p>
              </div>

              <div
                className="p-4 rounded-lg border"
                style={{
                  background: "var(--color-primary-100)",
                  borderColor: "var(--color-primary-400)",
                }}
              >
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--color-primary-400)" }}
                >
                  Есть ли скидки для студентов?
                </h3>
                <p style={{ color: "var(--color-primary-400)" }}>
                  Да, мы предоставляем скидки для студентов и школьников.
                  Подробности можно уточнить по телефону или email.
                </p>
              </div>

              <div
                className="p-4 rounded-lg border"
                style={{
                  background: "var(--color-primary-100)",
                  borderColor: "var(--color-primary-400)",
                }}
              >
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--color-primary-400)" }}
                >
                  Можно ли перенести занятие?
                </h3>
                <p style={{ color: "var(--color-primary-400)" }}>
                  Да, при необходимости занятие можно перенести. Просьба
                  предупреждать о переносе за 24 часа.
                </p>
              </div>

              <div
                className="p-4 rounded-lg border"
                style={{
                  background: "var(--color-primary-100)",
                  borderColor: "var(--color-primary-400)",
                }}
              >
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--color-primary-400)" }}
                >
                  Какие способы оплаты принимаются?
                </h3>
                <p style={{ color: "var(--color-primary-400)" }}>
                  Мы принимаем наличные, банковские карты, переводы и
                  онлайн-платежи. Возможна рассрочка платежа.
                </p>
              </div>
            </div>

            {/* Социальные сети */}
            <div className="mt-8">
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                📱 Мы в социальных сетях
              </h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:opacity-80 transition-opacity"
                  style={{
                    background: "var(--color-primary-100)",
                    borderColor: "var(--color-primary-400)",
                    color: "var(--color-primary-400)",
                  }}
                >
                  📘 VK
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:opacity-80 transition-opacity"
                  style={{
                    background: "var(--color-primary-100)",
                    borderColor: "var(--color-primary-400)",
                    color: "var(--color-primary-400)",
                  }}
                >
                  📱 Telegram
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:opacity-80 transition-opacity"
                  style={{
                    background: "var(--color-primary-100)",
                    borderColor: "var(--color-primary-400)",
                    color: "var(--color-primary-400)",
                  }}
                >
                  📸 Instagram
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Карта (заглушка) */}
        <section className="mt-12">
          <h2
            className="text-2xl font-semibold mb-6 text-center"
            style={{ color: "var(--color-text-primary)" }}
          >
            🗺️ Как нас найти
          </h2>
          <div
            className="w-full h-64 rounded-lg border flex items-center justify-center"
            style={{
              background: "var(--color-primary-100)",
              borderColor: "var(--color-primary-400)",
            }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <p style={{ color: "var(--color-primary-400)" }}>
                Здесь будет интерактивная карта
              </p>
              <p
                className="text-sm mt-2"
                style={{ color: "var(--color-primary-400)" }}
              >
                ул. Образовательная, 123, Москва
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
