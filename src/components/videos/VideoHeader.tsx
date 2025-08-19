import Link from "next/link";

interface VideoHeaderProps {
  videoTitle: string;
  courseId: string;
  courseTitle: string;
}

export default function VideoHeader({
  videoTitle,
  courseId,
  courseTitle,
}: Readonly<VideoHeaderProps>) {
  return (
    <header
      className="border-b px-6 py-4"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <Link
          href={`/courses/${courseId}`}
          className="btn-discord btn-discord-secondary"
        >
          ← Назад к курсу
        </Link>
        <div>
          <h1
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {videoTitle}
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            из курса {courseTitle}
          </p>
        </div>
      </div>
    </header>
  );
}
