import { User } from "@/types";
import UserTableRow from "./UserTableRow";

interface UsersTableProps {
  users: User[];
  onGrantAccess: (userId: string) => void;
  onRevokeAccess: (userId: string) => void;
}

export default function UsersTable({
  users,
  onGrantAccess,
  onRevokeAccess,
}: Readonly<UsersTableProps>) {
  return (
    <div
      className="p-6 rounded-lg border"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <h2
        className="text-xl font-semibold mb-4"
        style={{ color: "var(--color-text-primary)" }}
      >
        Список пользователей
      </h2>

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
                Контакты
              </th>
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Роль
              </th>
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Курсы
              </th>
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Заявки
              </th>
              <th
                className="text-left py-3 px-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Регистрация
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onGrantAccess={onGrantAccess}
                onRevokeAccess={onRevokeAccess}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
