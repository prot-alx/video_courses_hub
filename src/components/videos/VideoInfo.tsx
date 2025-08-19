interface VideoInfoProps {
  title: string;
  duration: number;
  isFree: boolean;
  createdAt?: string;
}

export default function VideoInfo({
  title,
  duration,
  isFree,
  createdAt,
}: Readonly<VideoInfoProps>) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ru", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <h2
          className="text-2xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h2>

        {isFree && (
          <span
            className="px-2 py-1 text-xs rounded-full font-medium"
            style={{
              background: "var(--color-success)",
              color: "var(--color-text-primary)",
            }}
          >
            Бесплатно
          </span>
        )}
      </div>

      <div
        className="text-sm text-right"
        style={{ color: "var(--color-text-secondary)" }}
      >
        <div>{formatDuration(duration)}</div>
        {createdAt && <div>{formatDate(createdAt)}</div>}
      </div>
    </div>
  );
}
