// components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer
      className="border-t py-8"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p style={{ color: "var(--color-text-secondary)" }}>
          © 2025 Образовательная школа. Качественное образование для всех.
        </p>
      </div>
    </footer>
  );
}
