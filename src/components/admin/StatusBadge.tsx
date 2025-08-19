interface StatusBadgeProps {
  status: "new" | "approved" | "rejected" | "cancelled";
  size?: "sm" | "md";
}

export default function StatusBadge({
  status,
  size = "sm",
}: Readonly<StatusBadgeProps>) {
  const getStatusConfig = () => {
    switch (status) {
      case "new":
        return {
          label: "Новая",
          bgColor: "var(--color-warning)",
          textColor: "var(--color-primary-300)",
        };
      case "approved":
        return {
          label: "Одобрена",
          bgColor: "var(--color-success)",
          textColor: "var(--color-text-primary)",
        };
      case "rejected":
        return {
          label: "Отклонена",
          bgColor: "var(--color-danger)",
          textColor: "var(--color-text-primary)",
        };
      case "cancelled":
        return {
          label: "Отменена",
          bgColor: "var(--color-primary-400)",
          textColor: "var(--color-text-secondary)",
        };
      default:
        return {
          label: status,
          bgColor: "var(--color-primary-400)",
          textColor: "var(--color-text-secondary)",
        };
    }
  };

  const config = getStatusConfig();
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
