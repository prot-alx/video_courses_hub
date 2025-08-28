import { ReactNode } from "react";

export interface AdminTableColumn {
  key: string;
  title: string;
  align?: "left" | "center" | "right";
  width?: string;
  className?: string;
}

export interface AdminTableProps<T = unknown> {
  columns: AdminTableColumn[];
  data: T[];
  renderRow: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

export default function AdminTable<T = unknown>({
  columns,
  data,
  renderRow,
  emptyMessage = "Данных пока нет",
  loading = false,
  className = "",
}: Readonly<AdminTableProps<T>>) {
  if (loading) {
    return (
      <div
        className={`rounded-lg shadow-sm border p-8 ${className}`}
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span
            className="ml-3"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Загрузка...
          </span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className={`rounded-lg shadow-sm border p-8 ${className}`}
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div
          className="text-center"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {emptyMessage}
        </div>
      </div>
    );
  }

  const getAlignClass = (align?: string) => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  return (
    <div
      className={`rounded-lg shadow-sm border overflow-hidden ${className}`}
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className="border-b"
            style={{
              background: "var(--color-primary-400)",
              borderColor: "var(--color-primary-500)",
            }}
          >
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 font-medium ${getAlignClass(
                    column.align
                  )} ${column.className || ""}`}
                  style={{
                    color: "var(--color-text-primary)",
                    width: column.width,
                  }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className="divide-y"
            style={{ borderColor: "var(--color-primary-400)" }}
          >
            {data.map((item, index) => renderRow(item, index))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
