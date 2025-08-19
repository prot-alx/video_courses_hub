// components/admin/VideoEditModal.tsx
"use client";

import { useState, useEffect } from "react";

interface Video {
  id: string;
  title: string;
  filename: string;
  orderIndex: number;
  isFree: boolean;
  duration: number | null;
}

interface VideoEditModalProps {
  video: Video | null;
  onClose: () => void;
  onSave: () => void;
}

export default function VideoEditModal({
  video,
  onClose,
  onSave,
}: Readonly<VideoEditModalProps>) {
  const [editData, setEditData] = useState({
    title: "",
    orderIndex: 0,
    isFree: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (video) {
      setEditData({
        title: video.title,
        orderIndex: video.orderIndex,
        isFree: video.isFree,
      });
    }
  }, [video]);

  const handleSave = async () => {
    if (!video || !editData.title.trim()) {
      alert("Заполните все обязательные поля");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/videos?id=${video.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      const result = await response.json();

      if (result.success) {
        alert("Видео обновлено!");
        onSave();
        onClose();
      } else {
        alert(result.error || "Ошибка обновления видео");
      }
    } catch (error) {
      console.error("Ошибка обновления видео:", error);
      alert("Ошибка обновления видео");
    } finally {
      setSaving(false);
    }
  };

  if (!video) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Редактировать видео
          </h3>
          <button
            onClick={onClose}
            className="text-xl hover:opacity-70"
            style={{ color: "var(--color-text-secondary)" }}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="input-discord w-full" />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editIsFree"
              checked={editData.isFree}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  isFree: e.target.checked,
                }))
              }
              className="checkbox-discord"
            />
            <label
              htmlFor="editIsFree"
              className="text-sm"
              style={{ color: "var(--color-text-primary)" }}
            >
              Бесплатное видео
            </label>
          </div>

          <div
            className="text-xs p-3 rounded border"
            style={{
              background: "var(--color-primary-100)",
              borderColor: "var(--color-primary-400)",
              color: "var(--color-text-secondary)",
            }}
          >
            <div>📁 Файл: {video.filename}</div>
            {video.duration && (
              <div>⏱️ Длительность: {Math.floor(video.duration / 60)}м</div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving || !editData.title.trim()}
            className="btn-discord btn-discord-primary flex-1"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
          <button
            onClick={onClose}
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
