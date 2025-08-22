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

export default function ContactInfoGrid() {
  return (
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
  );
}
