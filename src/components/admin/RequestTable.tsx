import RequestTableRow from "./RequestTableRow";

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

interface RequestTableProps {
  requests: Request[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function RequestTable({
  requests,
  onApprove,
  onReject,
  isLoading = false,
  emptyMessage = "Заявок пока нет",
}: Readonly<RequestTableProps>) {
  if (requests.length === 0) {
    return (
      <div
        className="p-6 rounded-lg border"
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div
          className="text-center py-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-lg border"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: "var(--color-primary-400)" }}
            >
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Пользователь
              </th>
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Курс
              </th>
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Контакт
              </th>
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Статус
              </th>
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Дата заявки
              </th>
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <RequestTableRow
                key={request.id}
                request={request}
                onApprove={onApprove}
                onReject={onReject}
                isLoading={isLoading}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
