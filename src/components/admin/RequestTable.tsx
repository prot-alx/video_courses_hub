// components/admin/RequestTable.tsx (обновленная версия с централизованными типами)
import RequestTableRow from "./RequestTableRow";
import type { CourseRequest } from "@/types";

interface RequestTableProps {
  requests: CourseRequest[];
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
