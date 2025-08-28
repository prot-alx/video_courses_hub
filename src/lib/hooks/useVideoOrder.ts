import { useState } from "react";
import { useToastContext } from "@/components/providers/ToastProvider";

interface Video {
  id: string;
  orderIndex: number;
}

interface UseVideoOrderReturn {
  saving: boolean;
  saveOrder: (videoIds: string[]) => Promise<void>;
  hasOrderChanged: (videos: Video[]) => boolean;
  setOrderChanged: () => void;
}

export function useVideoOrder(): UseVideoOrderReturn {
  const toast = useToastContext();
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const saveOrder = async (videoIds: string[]) => {
    setSaving(true);

    try {
      const response = await fetch("/api/admin/videos/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoIds }),
      });

      const result = await response.json();

      if (result.success) {
        setHasChanges(false);
        toast.success("Порядок сохранён!", "Порядок видео в курсе обновлён");
      } else {
        toast.error(
          "Ошибка сортировки",
          result.error || "Ошибка сохранения порядка"
        );
      }
    } catch (error) {
      console.error("Ошибка сохранения порядка:", error);
      toast.error("Сетевая ошибка", "Ошибка сохранения порядка");
    } finally {
      setSaving(false);
    }
  };

  const hasOrderChanged = (videos: Video[]): boolean => {
    return hasChanges;
  };

  const setOrderChanged = () => {
    setHasChanges(true);
  };

  return {
    saving,
    saveOrder,
    hasOrderChanged,
    setOrderChanged,
  };
}