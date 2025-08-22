import type { UploadedFile } from "@/lib/hooks/useVideoUpload";

interface VideoFilePreviewProps {
  file: UploadedFile;
}

export default function VideoFilePreview({
  file,
}: Readonly<VideoFilePreviewProps>) {
  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Неизвестно";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}м ${secs}с`;
  };

  return (
    <div
      className="p-4 rounded border mb-4"
      style={{
        background: "var(--color-primary-200)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">✅</div>
        <div>
          <h4
            className="font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            {file.originalName}
          </h4>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {formatFileSize(file.size)} • {file.type}
            {file.duration && <span> • {formatDuration(file.duration)}</span>}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Файл на сервере: {file.filename}
          </p>
        </div>
      </div>
    </div>
  );
}
