import Link from "next/link";

interface VideoManagementSectionProps {
  courseId: string;
}

export default function VideoManagementSection({
  courseId,
}: Readonly<VideoManagementSectionProps>) {
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
        🎥 Управление видео
      </h3>
      <p className="text-sm mb-3" style={{ color: "var(--color-primary-400)" }}>
        Добавляйте и редактируйте видео этого курса
      </p>
      <Link
        href={`/admin/courses/${courseId}/videos`}
        className="btn-discord btn-discord-secondary text-sm"
      >
        Управление видео
      </Link>
    </div>
  );
}
