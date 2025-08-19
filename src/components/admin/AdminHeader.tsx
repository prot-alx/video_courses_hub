import Link from "next/link";

interface AdminHeaderProps {
  title?: string;
  onSignOut?: () => void;
  showBackToSite?: boolean;
  siteUrl?: string;
}

export default function AdminHeader({
  title = "Панель администратора",
  onSignOut,
  showBackToSite = true,
  siteUrl = "/",
}: Readonly<AdminHeaderProps>) {
  return (
    <header
      className="border-b px-6 py-4"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            🛠️ {title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {showBackToSite && (
            <Link href={siteUrl} className="btn-discord btn-discord-secondary">
              На сайт
            </Link>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="btn-discord btn-discord-secondary"
            >
              Выйти
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
