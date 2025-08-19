interface RequestActionsProps {
  requestId: string;
  status: "new" | "approved" | "rejected" | "cancelled";
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isLoading?: boolean;
}

export default function RequestActions({
  requestId,
  status,
  onApprove,
  onReject,
  isLoading = false,
}: Readonly<RequestActionsProps>) {
  // Если заявка новая - показываем кнопки действий
  if (status === "new") {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(requestId)}
          disabled={isLoading}
          className="text-sm px-3 py-1 rounded hover:opacity-80 transition-opacity disabled:opacity-50"
          style={{
            background: "var(--color-success)",
            color: "var(--color-text-primary)",
          }}
        >
          {isLoading ? "Обрабатываем..." : "Одобрить"}
        </button>
        <button
          onClick={() => onReject(requestId)}
          disabled={isLoading}
          className="text-sm px-3 py-1 rounded hover:opacity-80 transition-opacity disabled:opacity-50"
          style={{
            background: "var(--color-danger)",
            color: "var(--color-text-primary)",
          }}
        >
          {isLoading ? "Обрабатываем..." : "Отклонить"}
        </button>
      </div>
    );
  }

  // Для обработанных заявок показываем дату обработки
  const getProcessedText = () => {
    switch (status) {
      case "approved":
        return "Одобрена";
      case "rejected":
        return "Отклонена";
      case "cancelled":
        return "Отменена пользователем";
      default:
        return "Обработана";
    }
  };

  return (
    <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
      {getProcessedText()}
    </div>
  );
}
