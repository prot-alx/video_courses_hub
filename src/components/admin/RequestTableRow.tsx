import StatusBadge from "./StatusBadge";
import RequestActions from "./RequestActions";

interface Request {
  id: string;
  user: { name: string; email: string };
  course: { title: string; price: number };
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

  const getContactMethodLabel = (method: string) => {
    switch (method) {
      case "email":
        return "Email";
      case "phone":
        return "Телефон";
      case "telegram":
        return "Telegram";
      default:
        return method;
    }
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

      {/* Курс */}
      <td className="py-3 px-4">
        <div>
          <div
            className="font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            {request.course.title}
          </div>
          <div
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {request.course.price.toLocaleString()}₽
          </div>
        </div>
      </td>

      {/* Способ связи */}
      <td className="py-3 px-4">
        <span
          className="px-2 py-1 text-xs rounded"
          style={{
            background: "var(--color-primary-400)",
            color: "var(--color-text-secondary)",
          }}
        >
          {getContactMethodLabel(request.contactMethod)}
        </span>
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
