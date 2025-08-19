interface VideoDescriptionProps {
  description: string;
  courseTitle?: string;
  courseId?: string;
}

export default function VideoDescription({
  description,
  courseTitle,
  courseId,
}: Readonly<VideoDescriptionProps>) {
  if (!description && !courseTitle) {
    return null;
  }

  return (
    <div
      className="p-6 rounded-lg border"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      {description && (
        <>
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: "var(--color-text-primary)" }}
          >
            Описание
          </h3>
          <div
            className="leading-relaxed mb-4"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {description.split("\n").map((paragraph, index) => (
              <p key={index} className={index > 0 ? "mt-4" : ""}>
                {paragraph}
              </p>
            ))}
          </div>
        </>
      )}

      {courseTitle && courseId && (
        <div
          className="pt-4 border-t"
          style={{ borderColor: "var(--color-primary-400)" }}
        >
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Это видео входит в курс:{" "}
            <a
              href={`/courses/${courseId}`}
              className="font-medium hover:underline"
              style={{ color: "var(--color-text-link)" }}
            >
              {courseTitle}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
