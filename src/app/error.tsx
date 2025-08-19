'use client';
import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center" style={{ background: 'var(--color-primary-200)' }}>
      <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-danger)' }}>Что-то пошло не так!</h1>
      <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>Произошла неожиданная ошибка.</p>
      <button
        onClick={reset}
        className="btn-discord btn-discord-primary"
      >
        Попробовать снова
      </button>
    </div>
  );
}