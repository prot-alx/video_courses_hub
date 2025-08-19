import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-discord-bg-primary">
      <h1 className="text-6xl font-bold text-discord-text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-discord-text-primary mb-2">
        Страница не найдена
      </h2>
      <p className="text-discord-text-secondary mb-8">
        Извините, запрашиваемая страница не существует.
      </p>
      <Link href="/" className="btn-primary">
        На главную
      </Link>
    </div>
  );
}
