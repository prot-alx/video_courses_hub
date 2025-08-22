export default function NextStepsInfo() {
  return (
    <div
      className="mt-6 p-4 rounded-lg border"
      style={{
        background: "var(--color-primary-100)",
        borderColor: "var(--color-accent)",
      }}
    >
      <h3
        className="font-semibold mb-2"
        style={{ color: "var(--color-primary-300)" }}
      >
        💡 Что дальше?
      </h3>
      <p className="text-sm" style={{ color: "var(--color-primary-400)" }}>
        После создания курса вы сможете добавить к нему видео, управлять
        доступом пользователей и редактировать информацию.
      </p>
    </div>
  );
}
