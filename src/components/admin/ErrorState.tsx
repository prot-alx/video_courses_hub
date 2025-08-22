import Link from "next/link";

interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: Readonly<ErrorStateProps>) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Курс не найден
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/admin" className="btn-discord btn-discord-primary">
            Вернуться к курсам
          </Link>
        </div>
      </div>
    </div>
  );
}
