import RequestTableRow from "./RequestTableRow";
import AdminTable, { AdminTableColumn } from "./AdminTable";
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
  const columns: AdminTableColumn[] = [
    { key: "user", title: "Пользователь" },
    { key: "course", title: "Курс" },
    { key: "contact", title: "Контакт" },
    { key: "status", title: "Статус" },
    { key: "date", title: "Дата заявки" },
    { key: "actions", title: "Действия" },
  ];

  return (
    <AdminTable
      columns={columns}
      data={requests}
      renderRow={(request) => (
        <RequestTableRow
          key={request.id}
          request={request}
          onApprove={onApprove}
          onReject={onReject}
          isLoading={isLoading}
        />
      )}
      emptyMessage={emptyMessage}
      loading={isLoading}
    />
  );
}
