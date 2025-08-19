interface NotificationTipProps {
  title: string;
  message: string;
  type?: "info" | "warning" | "success";
  icon?: string;
}

export default function NotificationTip({
  title,
  message,
  type = "info",
  icon = "💡",
}: Readonly<NotificationTipProps>) {
  const getBackgroundColor = () => {
    switch (type) {
      case "warning":
        return "var(--color-warning)";
      case "success":
        return "var(--color-success)";
      default:
        return "var(--color-accent)";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "warning":
        return "var(--color-primary-300)";
      default:
        return "var(--color-text-primary)";
    }
  };

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        background: getBackgroundColor(),
        borderColor: getBackgroundColor(),
        color: getTextColor(),
      }}
    >
      <h4 className="font-semibold mb-2">
        {icon} {title}
      </h4>
      <p className="text-sm">{message}</p>
    </div>
  );
}
