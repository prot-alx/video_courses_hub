import StatusBadge from "./StatusBadge";
import RequestActions from "./RequestActions";

interface Request {
  id: string;
  user: {
    name: string;
    email: string;
    phone?: string | null;
    telegram?: string | null;
    preferredContact: "email" | "phone" | "telegram";
  };
  course: { 
    id: string;           // ← Добавили courseId
    title: string; 
    price: number; 
  };
  status: "new" | "approved" | "rejected" | "cancelled";
  contactMethod: "email" | "phone" | "telegram";
  createdAt: string;
  processedAt?: string;
}

interface RequestTableRowProps {
  request: Request;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isLoading?: boolean;
}

function handleContactClick(contactType: string, contactValue: string) {
  switch (contactType) {
    case "email":
      window.open(`mailto:${contactValue}`, "_blank");
      break;
    case "phone":
      window.open(`tel:${contactValue}`, "_blank");
      break;
    case "telegram":
      // Убираем @ если есть, и добавляем https://t.me/
      const telegramUsername = contactValue.replace("@", "");
      window.open(`https://t.me/${telegramUsername}`, "_blank");
      break;
  }
}

function getPreferredContactElement(request: Request) {
  const { user } = request;

  switch (user.preferredContact) {
    case "email":
      return (
        <button
          onClick={() => handleContactClick("email", user.email)}
          className="text-blue-600 hover:text-blue-800 underline transition-colors"
          title="Написать email"
        >
          ✉️ {user.email}
        </button>
      );
    case "phone":
      return user.phone ? (
        <button
          onClick={() => handleContactClick("phone", user.phone!)}
          className="text-blue-600 hover:text-blue-800 underline transition-colors"
          title="Позвонить"
        >
          📞 {user.phone}
        </button>
      ) : (
        <span style={{ color: "var(--color-text-secondary)" }}>
          📞 Телефон не указан
        </span>
      );
    case "telegram":
      return user.telegram ? (
        <button
          onClick={() => handleContactClick("telegram", user.telegram!)}
          className="text-blue-600 hover:text-blue-800 underline transition-colors"
          title="Написать в Telegram"
        >
          💬 {user.telegram}
        </button>
      ) : (
        <span style={{ color: "var(--color-text-secondary)" }}>
          💬 Telegram не указан
        </span>
      );
    default:
      return (
        <span style={{ color: "var(--color-text-secondary)" }}>
          Неизвестный способ связи
        </span>
      );
  }
}

export default function RequestTableRow({
  request,
  onApprove,
  onReject,
  isLoading = false,
}: Readonly<RequestTableRowProps>) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <tr
      className="border-b hover:bg-primary-400 transition-colors"
      style={{ borderColor: "var(--color-primary-400)" }}
    >
      {/* Пользователь */}
      <td className="py-3 px-4">
        <div>
          <div
            className="font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            {request.user.name}
          </div>
          <div
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {request.user.email}
          </div>
        </div>
      </td>

      {/* Курс - теперь с кликабельной ссылкой */}
      <td className="py-3 px-4">
        <div>
          <a
            href={`/courses/${request.course.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:text-blue-800 underline transition-colors"
            title="Открыть курс (как пользователь)"
          >
            {request.course.title} 🔗
          </a>
          <div
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {request.course.price.toLocaleString()}₽
          </div>
        </div>
      </td>

      {/* Контакт - теперь кликабельный */}
      <td className="py-3 px-4">
        <div className="space-y-1">
          {/* Предпочитаемый способ связи - кликабельный */}
          <div className="font-medium">
            {getPreferredContactElement(request)}
          </div>

          {/* Метка способа связи */}
          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Предпочитает: {request.user.preferredContact}
          </div>
        </div>
      </td>

      {/* Статус */}
      <td className="py-3 px-4">
        <StatusBadge status={request.status} />
      </td>

      {/* Дата заявки */}
      <td
        className="py-3 px-4 text-sm"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {formatDate(request.createdAt)}
      </td>

      {/* Действия */}
      <td className="py-3 px-4">
        <RequestActions
          requestId={request.id}
          status={request.status}
          onApprove={onApprove}
          onReject={onReject}
          isLoading={isLoading}
        />
      </td>
    </tr>
  );
}
