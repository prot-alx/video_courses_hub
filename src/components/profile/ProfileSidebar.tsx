import Link from "next/link";

interface ProfileSidebarProps {
  onSignOut: () => void;
  isLoading?: boolean;
}

export default function ProfileSidebar({
  onSignOut,
  isLoading = false,
}: Readonly<ProfileSidebarProps>) {
  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Действия с аккаунтом */}
      <div
        className="p-6 rounded-lg border"
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Действия
        </h3>
        <div className="space-y-3">
          <Link
            href="/"
            className="btn-discord btn-discord-secondary w-full block text-center"
          >
            📚 Мои курсы
          </Link>

          <Link
            href="/profile/history"
            className="btn-discord btn-discord-secondary w-full block text-center"
          >
            📋 История заказов
          </Link>

          <button
            onClick={onSignOut}
            disabled={isLoading}
            className="w-full text-left px-3 py-2 text-sm rounded hover:underline disabled:opacity-50"
            style={{ color: "var(--color-danger)" }}
          >
            {isLoading ? "Выходим..." : "Выйти из аккаунта"}
          </button>
        </div>
      </div>

      {/* Статистика пользователя */}
      <div
        className="p-6 rounded-lg border"
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Ваша статистика
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span style={{ color: "var(--color-text-secondary)" }}>
              Курсов куплено:
            </span>
            <span style={{ color: "var(--color-text-primary)" }}>2</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--color-text-secondary)" }}>
              Видео просмотрено:
            </span>
            <span style={{ color: "var(--color-text-primary)" }}>15</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--color-text-secondary)" }}>
              Время обучения:
            </span>
            <span style={{ color: "var(--color-text-primary)" }}>8ч 30м</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--color-text-secondary)" }}>
              На платформе с:
            </span>
            <span style={{ color: "var(--color-text-primary)" }}>Янв 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
}
