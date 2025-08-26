"use client";
import { useState } from "react";
import { useToastContext } from "@/components/providers/ToastProvider";
import type { ApiResponse } from "@/types";
import { UpdateVideoSchema } from "@/lib/validations";
import { useFormValidation } from "@/lib/hooks/useFormValidation";

interface AdminVideo {
  id: string;
  title: string;
  displayName: string;
  description?: string | null;
  isFree: boolean;
  orderIndex: number;
  filename: string;
  duration: number | null;
  createdAt: string;
}

interface VideoEditFormProps {
  video: AdminVideo;
  onSave: () => void;
  onCancel: () => void;
}

export default function VideoEditForm({
  video,
  onSave,
  onCancel,
}: Readonly<VideoEditFormProps>) {
  const toast = useToastContext();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: video.displayName || video.title,
    description: video.description || "",
    isFree: video.isFree,
  });

  const { validate, validationErrors, getFieldError } = useFormValidation(
    UpdateVideoSchema,
    {
      showToastOnError: true,
      toastErrorTitle: "Ошибка валидации видео",
    }
  );

  const handleSave = async () => {
    const validationData = {
      displayName: formData.displayName,
      description: formData.description || null,
      isFree: formData.isFree,
    };

    if (!validate(validationData)) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/videos?id=${video.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: formData.displayName.trim(),
          title: formData.displayName.trim(),
          description: formData.description.trim() || null,
          isFree: formData.isFree,
        }),
      });

      const result: ApiResponse<AdminVideo> = await response.json();

      if (result.success) {
        toast.success("Видео обновлено!", "Изменения успешно сохранены");
        onSave();
      } else {
        toast.error(
          "Ошибка обновления",
          result.error || "Ошибка обновления видео"
        );
      }
    } catch (error) {
      console.error("Ошибка обновления видео:", error);
      toast.error("Сетевая ошибка", "Ошибка обновления видео");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="p-6 rounded-lg border mb-4"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--color-text-primary)" }}
      >
        ✏️ Редактирование видео
      </h3>

      <div className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Название видео *
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, displayName: e.target.value }))
            }
            className={`input-discord w-full ${
              getFieldError("displayName") ? "border-red-500" : ""
            }`}
            placeholder="Введите название видео"
            maxLength={100}
            disabled={saving}
            style={{
              background: "var(--color-primary-100)",
              borderColor: getFieldError("displayName")
                ? "#ef4444"
                : "var(--color-primary-400)",
              color: "var(--color-primary-400)",
              borderWidth: "1px",
              borderRadius: "var(--radius-sm)",
              padding: "var(--spacing-2) var(--spacing-3)",
            }}
          />
          <div className="flex justify-between items-center mt-1">
            {getFieldError("displayName") ? (
              <p className="text-xs text-red-500">
                {getFieldError("displayName")}
              </p>
            ) : (
              <p
                className="text-xs"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Это название будет отображаться пользователям
              </p>
            )}
            <span
              className={`text-xs ${
                formData.displayName.length > 90
                  ? "text-orange-500"
                  : formData.displayName.length > 100
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {formData.displayName.length}/100
            </span>
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Описание видео
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className={`input-discord w-full min-h-[100px] resize-y ${
              getFieldError("description") ? "border-red-500" : ""
            }`}
            placeholder="Введите описание видео (необязательно)"
            maxLength={2000}
            rows={4}
            disabled={saving}
            style={{
              background: "var(--color-primary-100)",
              borderColor: getFieldError("description")
                ? "#ef4444"
                : "var(--color-primary-400)",
              color: "var(--color-primary-400)",
              borderWidth: "1px",
              borderRadius: "var(--radius-sm)",
              padding: "var(--spacing-2) var(--spacing-3)",
            }}
          />
          <div className="flex justify-between items-center mt-1">
            {getFieldError("description") ? (
              <p className="text-xs text-red-500">
                {getFieldError("description")}
              </p>
            ) : (
              <p
                className="text-xs"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Краткое описание содержания видео
              </p>
            )}
            <span
              className={`text-xs ${
                formData.description.length > 1800
                  ? "text-orange-500"
                  : formData.description.length > 2000
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {formData.description.length}/2000
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="editIsFree"
            checked={formData.isFree}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isFree: e.target.checked }))
            }
            className="checkbox-discord"
            disabled={saving}
          />
          <label
            htmlFor="editIsFree"
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Бесплатное видео
          </label>
        </div>

        <div
          className="text-xs p-2 rounded"
          style={{
            background: "var(--color-primary-300)",
            color: "var(--color-text-secondary)",
          }}
        >
          📄 Файл: {video.filename} • Добавлено:{" "}
          {new Date(video.createdAt).toLocaleDateString("ru")}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !formData.displayName.trim()}
            className="btn-discord btn-discord-primary"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="btn-discord btn-discord-secondary"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
