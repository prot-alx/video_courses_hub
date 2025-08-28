import { AdminUserView } from "@/types";
import UserTableRow from "./UserTableRow";
import AdminTable, { AdminTableColumn } from "./AdminTable";
import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface UsersTableProps {
  users: AdminUserView[];
  onGrantAccess: (userId: string) => void;
  onRevokeAccess: (userId: string) => void;
}

export default function UsersTable({
  users,
  onGrantAccess,
  onRevokeAccess,
}: Readonly<UsersTableProps>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<AdminUserView[]>(users);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const columns: AdminTableColumn[] = [
    { key: "user", title: "Пользователь" },
    { key: "contacts", title: "Контакты" },
    { key: "role", title: "Роль" },
    { key: "courses", title: "Курсы", align: "center" },
    { key: "requests", title: "Заявки", align: "center" },
    { key: "registration", title: "Регистрация" },
  ];

  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => {
        const searchLower = debouncedSearchTerm.toLowerCase();
        return (
          user.name?.toLowerCase().includes(searchLower) ||
          user.displayName?.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.phone?.includes(debouncedSearchTerm) ||
          user.telegram?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredUsers(filtered);
    }
  }, [users, debouncedSearchTerm]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Список пользователей
        </h2>

        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по имени, email, телефону..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 pr-10 input-discord"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5"
              style={{ color: "var(--color-text-secondary)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {searchTerm && (
        <div className="mb-4">
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Найдено пользователей: {filteredUsers.length} из {users.length}
          </p>
        </div>
      )}

      <AdminTable
        columns={columns}
        data={filteredUsers}
        renderRow={(user) => (
          <UserTableRow
            key={user.id}
            user={user}
            onGrantAccess={onGrantAccess}
            onRevokeAccess={onRevokeAccess}
          />
        )}
        emptyMessage={
          debouncedSearchTerm
            ? `По запросу "${debouncedSearchTerm}" ничего не найдено`
            : "Пользователей пока нет"
        }
      />
    </div>
  );
}
