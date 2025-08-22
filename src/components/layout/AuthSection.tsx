import Link from "next/link";

interface AuthSectionProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: "USER" | "ADMIN";
  } | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  variant?: "desktop" | "mobile";
  onMenuClose?: () => void;
}

export default function AuthSection({
  user,
  isAuthenticated,
  isAdmin,
  onSignIn,
  onSignOut,
  variant = "desktop",
  onMenuClose,
}: Readonly<AuthSectionProps>) {
  const handleSignOut = async () => {
    await onSignOut();
    if (onMenuClose) onMenuClose();
  };

  const handleSignIn = async () => {
    await onSignIn();
    if (onMenuClose) onMenuClose();
  };

  if (variant === "mobile") {
    return (
      <div
        className="mt-6 pt-4 border-t"
        style={{ borderColor: "var(--color-primary-400)" }}
      >
        {isAuthenticated ? (
          <div className="flex flex-col gap-3">
            <div
              className="text-sm font-medium mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              👋 {user?.name || user?.email?.split("@")[0]}
              {isAdmin && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Админ
                </span>
              )}
            </div>

            <Link
              href="/profile"
              onClick={onMenuClose}
              className="text-left btn-discord btn-discord-secondary"
            >
              👤 Профиль
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={onMenuClose}
                className="text-left btn-discord btn-discord-secondary"
              >
                ⚙️ Админка
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="text-left btn-discord btn-discord-secondary"
            >
              🚪 Выйти
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            className="w-full btn-discord btn-discord-primary"
          >
            🚀 Войти через Google
          </button>
        )}
      </div>
    );
  }

  // Desktop variant
  return (
    <div className="hidden md:flex items-center gap-4">
      {isAuthenticated ? (
        <>
          <span
            className="hidden lg:block text-sm font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            Привет, {user?.name || user?.email?.split("@")[0]}!
            {isAdmin && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Админ
              </span>
            )}
          </span>

          <Link
            href="/profile"
            className="btn-discord btn-discord-secondary text-xs px-3 py-1"
          >
            👤
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="btn-discord btn-discord-secondary text-xs px-3 py-1"
            >
              ⚙️
            </Link>
          )}
          <button
            onClick={onSignOut}
            className="btn-discord btn-discord-secondary text-xs px-3 py-1"
          >
            Выйти
          </button>
        </>
      ) : (
        <button
          onClick={onSignIn}
          className="btn-discord btn-discord-primary text-sm px-4 py-2"
        >
          Войти
        </button>
      )}
    </div>
  );
}
