interface OrderChangeNotificationProps {
  saving: boolean;
  onSaveOrder: () => void;
}

export default function OrderChangeNotification({
  saving,
  onSaveOrder,
}: Readonly<OrderChangeNotificationProps>) {
  return (
    <div
      className="p-3 rounded mb-4 flex items-center justify-between"
      style={{
        background: "var(--color-warning)",
        color: "var(--color-primary-300)",
      }}
    >
      <span className="text-sm font-medium">📋 Порядок изменен</span>
      <button
        onClick={onSaveOrder}
        disabled={saving}
        className="text-sm px-3 py-1 rounded"
        style={{
          background: "var(--color-primary-300)",
          color: "var(--color-text-primary)",
        }}
      >
        {saving ? "Сохранение..." : "Сохранить порядок"}
      </button>
    </div>
  );
}
