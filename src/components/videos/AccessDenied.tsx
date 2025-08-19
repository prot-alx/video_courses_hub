import Link from "next/link";

interface AccessDeniedProps {
  courseId: string;
  courseTitle: string;
  isAuthenticated: boolean;
  requestStatus?: "none" | "pending" | "approved" | "rejected";
  isLoading?: boolean;
  onPurchase: () => void;
  onCancelRequest: () => void;
  onSignIn: () => void;
}

export default function AccessDenied({
  courseId,
  courseTitle,
  isAuthenticated,
  requestStatus = "none",
  isLoading = false,
  onPurchase,
  onCancelRequest,
  onSignIn,
}: Readonly<AccessDeniedProps>) {
  const getActionButton = () => {
    if (!isAuthenticated) {
      return (
        <button
          onClick={onSignIn}
          className="btn-discord btn-discord-primary w-full"
        >
          Войти для покупки курса
        </button>
      );
    }

    switch (requestStatus) {
      case "pending":
        return (
          <button
            onClick={onCancelRequest}
            className="btn-discord btn-discord-secondary w-full"
            disabled={isLoading}
          >
            {isLoading ? "Отменяем заявку..." : "Отменить заявку"}
          </button>
        );

      case "approved":
        return (
          <div
            className="text-center p-4 rounded"
            style={{
              background: "var(--color-success)",
              color: "var(--color-text-primary)",
            }}
          >
            ✅ Заявка одобрена! Обновите страницу для просмотра
          </div>
        );

      case "rejected":
        return (
          <div className="space-y-3">
            <div
              className="text-center p-2 rounded"
              style={{
                background: "var(--color-danger)",
                color: "var(--color-text-primary)",
              }}
            >
              ❌ Заявка отклонена
            </div>
            <button
              onClick={onPurchase}
              className="btn-discord btn-discord-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? "Отправляем заявку..." : "Подать заявку снова"}
            </button>
          </div>
        );

      default: // 'none'
        return (
          <button
            onClick={onPurchase}
            className="btn-discord btn-discord-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? "Отправляем заявку..." : "Купить курс"}
          </button>
        );
    }
  };

  return (
    <div className="text-center py-16">
      <div
        className="p-8 rounded-lg border max-w-md mx-auto"
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div className="text-6xl mb-4">🔒</div>

        <h2
          className="text-xl font-bold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Доступ ограничен
        </h2>

        <p className="mb-6" style={{ color: "var(--color-text-secondary)" }}>
          Для просмотра этого видео необходимо приобрести курс {courseTitle}.
        </p>

        <div className="space-y-3">
          {getActionButton()}

          <Link
            href={`/courses/${courseId}`}
            className="btn-discord btn-discord-secondary w-full block text-center"
          >
            Подробнее о курсе
          </Link>
        </div>
      </div>
    </div>
  );
}
