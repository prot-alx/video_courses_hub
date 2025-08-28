import { useContactForm } from "@/lib/hooks/useContactForm";

export default function ContactForm() {
  const {
    formData,
    isSubmitting,
    validationErrors,
    handleSubmit,
    handleChange,
  } = useContactForm();

  const limits = {
    name: 100,
    message: 2000,
  };

  return (
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
            className="w-full input-discord"
            placeholder="Ваше имя"
            maxLength={limits.name}
          />
          <div className="flex justify-between text-xs mt-1">
            {validationErrors.name && (
              <span className="text-red-500">{validationErrors.name}</span>
            )}
            <span
              className={`ml-auto ${
                formData.name.length > limits.name * 0.9
                  ? "text-orange-500"
                  : "text-gray-400"
              }`}
            >
              {formData.name.length}/{limits.name}
            </span>
          </div>
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
            className="w-full input-discord"
            placeholder="your@email.com"
          />
          {validationErrors.email && (
            <div className="text-red-500 text-xs mt-1">
              {validationErrors.email}
            </div>
          )}
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
            className="w-full input-discord"
          >
            <option value="">Выберите тему</option>
            <option value="general">Общий вопрос</option>
            <option value="courses">Вопросы по курсам</option>
            <option value="enrollment">Поступление</option>
            <option value="technical">Техническая поддержка</option>
            <option value="partnership">Сотрудничество</option>
            <option value="other">Другое</option>
          </select>
          {validationErrors.subject && (
            <div className="text-red-500 text-xs mt-1">
              {validationErrors.subject}
            </div>
          )}
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
            className="w-full input-discord resize-vertical"
            placeholder="Опишите ваш вопрос или предложение..."
            maxLength={limits.message}
          />
          <div className="flex justify-between text-xs mt-1">
            {validationErrors.message && (
              <span className="text-red-500">{validationErrors.message}</span>
            )}
            <span
              className={`ml-auto ${
                formData.message.length > limits.message * 0.9
                  ? "text-orange-500"
                  : "text-gray-400"
              }`}
            >
              {formData.message.length}/{limits.message}
            </span>
          </div>
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
  );
}
