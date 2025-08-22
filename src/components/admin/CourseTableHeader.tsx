import Link from "next/link";

export default function CourseTableHeader() {
  const headers = [
    "#",
    "Название",
    "Тип",
    "Видео",
    "Статус",
    "Дата",
    "Действия",
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Управление курсами
        </h2>
        <Link
          href="/admin/courses/create"
          className="btn-discord btn-discord-primary"
        >
          + Создать курс
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: "var(--color-primary-400)" }}
            >
              {headers.map((header) => (
                <th
                  key={header}
                  className="text-left py-3 px-4"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{/* Table rows will be rendered here */}</tbody>
        </table>
      </div>
    </>
  );
}
