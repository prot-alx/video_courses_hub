import Link from "next/link";

interface ProfileHeaderProps {
  backUrl?: string;
  backLabel?: string;
}

export default function ProfileHeader({
  backUrl = "/",
  backLabel = "На главную",
}: Readonly<ProfileHeaderProps>) {
  return (
    <header
      className="border-b px-6 py-4"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <Link href={backUrl} className="btn-discord btn-discord-secondary">
          ← {backLabel}
        </Link>
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          👤 Профиль
        </h1>
      </div>
    </header>
  );
}
