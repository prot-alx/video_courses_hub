import Link from "next/link";

interface AuthFooterProps {
  showBackToHome?: boolean;
  backToHomeUrl?: string;
}

export default function AuthFooter({
  showBackToHome = true,
  backToHomeUrl = "/",
}: Readonly<AuthFooterProps>) {
  return (
    <>
      {/* Back to Home Link */}
      {showBackToHome && (
        <div
          className="text-center pt-4 border-t"
          style={{ borderColor: "var(--color-primary-400)" }}
        >
          <Link
            href={backToHomeUrl}
            className="text-sm hover:underline"
            style={{ color: "var(--color-text-link)" }}
          >
            ← Вернуться на главную
          </Link>
        </div>
      )}

      {/* Terms and Privacy */}
      <div
        className="text-center text-xs mt-6"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Входя в систему, вы соглашаетесь с{" "}
        <Link
          href="/terms"
          className="hover:underline"
          style={{ color: "var(--color-text-link)" }}
        >
          условиями использования
        </Link>{" "}
        и{" "}
        <Link
          href="/privacy"
          className="hover:underline"
          style={{ color: "var(--color-text-link)" }}
        >
          политикой конфиденциальности
        </Link>
      </div>
    </>
  );
}
