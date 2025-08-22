"use client";
import FileDropZone from "./FileDropZone";
import VideoFilePreview from "./VideoFilePreview";
import VideoMetadataForm from "./VideoMetadataForm";
import { useVideoUpload } from "@/lib/hooks/useVideoUpload";

interface VideoUploadFormProps {
  courseId: string;
  onVideoAdded?: () => void;
}

export default function VideoUploadForm({
  courseId,
  onVideoAdded,
}: Readonly<VideoUploadFormProps>) {
  const {
    uploading,
    uploadProgress,
    uploadedFile,
    videoMetadata,
    fileInputRef,
    handleFileUpload,
    handleCreateVideo,
    handleCancel,
    updateVideoMetadata,
  } = useVideoUpload({ courseId, onVideoAdded });

  return (
    <div
      className="p-6 rounded-lg border"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--color-text-primary)" }}
      >
        ➕ Добавить новое видео
      </h2>

      {!uploadedFile ? (
        /* Шаг 1: Загрузка файла */
        <FileDropZone
          onFileSelect={handleFileUpload}
          uploading={uploading}
          uploadProgress={uploadProgress}
          fileInputRef={fileInputRef}
        />
      ) : (
        /* Шаг 2: Настройка метаданных */
        <div>
          <VideoFilePreview file={uploadedFile} />

          <VideoMetadataForm
            metadata={videoMetadata}
            onMetadataChange={updateVideoMetadata}
            onSubmit={handleCreateVideo}
            onCancel={handleCancel}
            canSubmit={!!videoMetadata.displayName.trim()}
          />
        </div>
      )}
    </div>
  );
}
