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

function getPreferredContactElement(user: User) {
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
      ) : null;
    case "telegram":
      return user.telegram ? (
        <button
          onClick={() => handleContactClick("telegram", user.telegram!)}
          className="text-blue-600 hover:text-blue-800 underline transition-colors"
          title="Написать в Telegram"
        >
          💬 {user.telegram}
        </button>
      ) : null;
    default:
      return null;
  }
}

export default function UserTableRow({
  user,
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
          {/* Основной способ связи - кликабельный */}
          <div className="font-medium">{getPreferredContactElement(user)}</div>

          {/* Дополнительные контакты - некликабельные */}
          {user.phone && user.preferredContact !== "phone" && (
            <div style={{ color: "var(--color-text-secondary)" }}>
              📞 {user.phone}
            </div>
          )}
          {user.telegram && user.preferredContact !== "telegram" && (
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
