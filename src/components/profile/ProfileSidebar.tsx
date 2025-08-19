// components/profile/ProfileSidebar.tsx
import Link from "next/link";
import UserStats from "./UserStats";

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
        <UserStats />
      </div>
    </div>
  );
}
