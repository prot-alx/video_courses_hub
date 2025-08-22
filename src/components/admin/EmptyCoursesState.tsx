import Link from "next/link";

export default function EmptyCoursesState() {
  return (
    <div
      className="p-6 rounded-lg border"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <div className="text-center py-8">
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Курсов пока нет
        </h3>
        <p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>
          Создайте первый курс для начала работы
        </p>
        <Link
          href="/admin/courses/create"
          className="btn-discord btn-discord-primary"
        >
          + Создать курс
        </Link>
      </div>
    </div>
  );
}
