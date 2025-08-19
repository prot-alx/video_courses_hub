interface UserRoleBadgeProps {
  role: "USER" | "ADMIN";
  size?: "sm" | "md";
}

export default function UserRoleBadge({
  role,
  size = "sm",
}: Readonly<UserRoleBadgeProps>) {
  const getRoleConfig = () => {
    switch (role) {
      case "ADMIN":
        return {
          label: "Администратор",
          bgColor: "var(--color-danger)",
          textColor: "var(--color-text-primary)",
        };
      case "USER":
        return {
          label: "Пользователь",
          bgColor: "var(--color-success)",
          textColor: "var(--color-text-primary)",
        };
      default:
        return {
          label: role,
          bgColor: "var(--color-primary-400)",
          textColor: "var(--color-text-secondary)",
        };
    }
  };

  const config = getRoleConfig();
  const sizeClass = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-1 text-xs";

  return (
    <span
      className={`${sizeClass} rounded-full font-medium`}
      style={{
        background: config.bgColor,
        color: config.textColor,
      }}
    >
      {config.label}
    </span>
  );
}
