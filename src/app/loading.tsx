export default function LoadingPage() {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
          style={{ borderColor: "var(--color-accent)" }}
        ></div>
        <p style={{ color: "var(--color-text-secondary)" }}>Загрузка...</p>
      </div>
    </div>
  );
}
