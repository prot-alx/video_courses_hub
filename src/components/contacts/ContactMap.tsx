export default function ContactMap() {
  return (
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
  );
}
