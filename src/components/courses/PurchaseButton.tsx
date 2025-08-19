interface PurchaseButtonProps {
  courseId: string;
  isFree: boolean;
  hasAccess: boolean;
  isAuthenticated: boolean;
  requestStatus?: "none" | "pending" | "approved" | "rejected";
  isLoading?: boolean;
  onPurchase: (courseId: string) => void;
  onCancelRequest: (courseId: string) => void;
  onSignIn: () => void;
}

export default function PurchaseButton({
  courseId,
  isFree,
  hasAccess,
  isAuthenticated,
  requestStatus = "none",
  isLoading = false,
  onPurchase,
  onCancelRequest,
  onSignIn,
}: Readonly<PurchaseButtonProps>) {
  // Если курс бесплатный или пользователь имеет доступ
  if (isFree || hasAccess) {
    return (
      <button className="btn-discord btn-discord-primary" disabled={isLoading}>
        {isFree ? "Смотреть бесплатно" : "Открыть курс"}
      </button>
    );
  }

  // Если пользователь не авторизован
  if (!isAuthenticated) {
    return (
      <button onClick={onSignIn} className="btn-discord btn-discord-secondary">
        Войдите для покупки
      </button>
    );
  }

  // Логика для авторизованного пользователя с платным курсом
  switch (requestStatus) {
    case "pending":
      return (
        <button
          onClick={() => onCancelRequest(courseId)}
          className="btn-discord btn-discord-secondary"
          disabled={isLoading}
        >
          {isLoading ? "Отменяем..." : "Отменить заявку"}
        </button>
      );

    case "approved":
      return (
        <div className="text-center">
          <div
            className="px-4 py-2 rounded mb-2"
            style={{
              background: "var(--color-success)",
              color: "var(--color-text-primary)",
            }}
          >
            ✅ Заявка одобрена! Доступ открыт
          </div>
        </div>
      );

    case "rejected":
      return (
        <div className="space-y-2">
          <div
            className="px-4 py-2 rounded text-center"
            style={{
              background: "var(--color-danger)",
              color: "var(--color-text-primary)",
            }}
          >
            ❌ Заявка отклонена
          </div>
          <button
            onClick={() => onPurchase(courseId)}
            className="btn-discord btn-discord-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? "Отправляем..." : "Подать заявку снова"}
          </button>
        </div>
      );

    default: // 'none'
      return (
        <button
          onClick={() => onPurchase(courseId)}
          className="btn-discord btn-discord-primary"
          disabled={isLoading}
        >
          {isLoading ? "Отправляем заявку..." : "Купить курс"}
        </button>
      );
  }
}
