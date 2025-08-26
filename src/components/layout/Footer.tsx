import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="border-t py-8"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-4">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link
              href="/terms"
              className="hover:underline transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Условия использования
            </Link>
            <Link
              href="/privacy"
              className="hover:underline transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Политика конфиденциальности
            </Link>
            <Link
              href="/contacts"
              className="hover:underline transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Контакты
            </Link>
            <Link
              href="/about"
              className="hover:underline transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
            >
              О нас
            </Link>
          </div>
        </div>
        <div className="text-center">
          <p style={{ color: "var(--color-text-secondary)" }}>
            © 2025 Образовательная школа. Качественное образование для всех.
          </p>
        </div>
      </div>
    </footer>
  );
}
