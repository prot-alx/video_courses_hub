import { User } from "@/types/admin";
import UserRoleBadge from "./UserRowBagde";

interface UserTableRowProps {
  user: User;
  onGrantAccess: (userId: string) => void;
  onRevokeAccess: (userId: string) => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ru", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function UserTableRow({
  user,
  onGrantAccess,
  onRevokeAccess,
}: Readonly<UserTableRowProps>) {
  return (
    <tr
      className="border-b hover:bg-primary-400 transition-colors"
      style={{ borderColor: "var(--color-primary-400)" }}
    >
      <td className="py-3 px-4">
        <div>
          <div
            className="font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            {user.name}
          </div>
          <div
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {user.email}
          </div>
        </div>
      </td>

      <td className="py-3 px-4">
        <div className="text-sm space-y-1">
          {user.phone && (
            <div style={{ color: "var(--color-text-secondary)" }}>
              📞 {user.phone}
            </div>
          )}
          {user.telegram && (
            <div style={{ color: "var(--color-text-secondary)" }}>
              💬 {user.telegram}
            </div>
          )}
          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Предпочитает: {user.preferredContact}
          </div>
        </div>
      </td>

      <td className="py-3 px-4">
        <UserRoleBadge role={user.role} />
      </td>

      <td
        className="py-3 px-4 text-center"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {user.coursesCount}
      </td>

      <td className="py-3 px-4 text-center">
        {user.activeRequests > 0 ? (
          <span
            className="px-2 py-1 text-xs rounded-full font-medium"
            style={{
              background: "var(--color-warning)",
              color: "var(--color-primary-300)",
            }}
          >
            {user.activeRequests}
          </span>
        ) : (
          <span style={{ color: "var(--color-text-secondary)" }}>-</span>
        )}
      </td>

      <td
        className="py-3 px-4 text-sm"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {formatDate(user.createdAt)}
      </td>
    </tr>
  );
}
