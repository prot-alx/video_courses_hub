interface StatCardProps {
  value: string | number;
  label: string;
  color?: "primary" | "success" | "warning" | "danger";
  isLoading?: boolean;
}

export default function StatCard({
  value,
  label,
  color = "primary",
  isLoading = false,
}: Readonly<StatCardProps>) {
  const getColor = () => {
    switch (color) {
      case "success":
        return "var(--color-success)";
      case "warning":
        return "var(--color-warning)";
      case "danger":
        return "var(--color-danger)";
      default:
        return "var(--color-accent)";
    }
  };

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      {isLoading ? (
        <div className="animate-pulse">
          <div
            className="h-8 w-16 rounded mb-2"
            style={{ background: "var(--color-primary-400)" }}
          ></div>
          <div
            className="h-4 w-24 rounded"
            style={{ background: "var(--color-primary-400)" }}
          ></div>
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold" style={{ color: getColor() }}>
            {value}
          </div>
          <div
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {label}
          </div>
        </>
      )}
    </div>
  );
}
