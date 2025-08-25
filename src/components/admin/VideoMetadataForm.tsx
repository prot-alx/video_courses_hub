import type { VideoMetadata } from "@/lib/hooks/useVideoUpload";

interface VideoMetadataFormProps {
  metadata: VideoMetadata;
  onMetadataChange: (updates: Partial<VideoMetadata>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  canSubmit: boolean;
}

export default function VideoMetadataForm({
  metadata,
  onMetadataChange,
  onSubmit,
  onCancel,
  canSubmit,
}: Readonly<VideoMetadataFormProps>) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Название видео *
        </label>
        <input
          type="text"
          value={metadata.displayName}
          onChange={(e) => onMetadataChange({ displayName: e.target.value })}
          className="input-discord w-full"
          placeholder="Введите название видео"
          maxLength={100}
          required
        />
        <p
          className="text-xs mt-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Это название будет отображаться пользователям (
          {metadata.displayName.length}/100)
        </p>
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Описание видео
        </label>
        <textarea
          value={metadata.description}
          onChange={(e) => onMetadataChange({ description: e.target.value })}
          className="input-discord w-full min-h-[100px] resize-y"
          placeholder="Введите описание видео (необязательно)"
          maxLength={2000}
          rows={4}
        />
        <p
          className="text-xs mt-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Краткое описание содержания видео ({metadata.description.length}/2000)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Порядковый номер
          </label>
          <input
            type="number"
            value={metadata.orderIndex}
            onChange={(e) =>
              onMetadataChange({
                orderIndex: parseInt(e.target.value) || 0,
              })
            }
            className="input-discord w-full"
            min="0"
          />
          <p
            className="text-xs mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Определяет порядок в списке видео
          </p>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="isFree"
            checked={metadata.isFree}
            onChange={(e) => onMetadataChange({ isFree: e.target.checked })}
            className="checkbox-discord"
          />
          <label
            htmlFor="isFree"
            className="text-sm"
            style={{ color: "var(--color-text-primary)" }}
          >
            Бесплатное видео
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-discord btn-discord-primary"
        >
          Создать видео
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-discord btn-discord-secondary"
        >
          Отменить
        </button>
      </div>
    </form>
  );
}
