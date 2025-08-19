// lib/hooks/useDiskSpace.ts
import { useState, useEffect } from "react";

interface DiskInfo {
  total: string;
  used: string;
  available: string;
  usePercentage: string;
}

export function useDiskSpace() {
  const [diskInfo, setDiskInfo] = useState<DiskInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiskInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/upload/video");
      const result = await response.json();

      if (result.success) {
        setDiskInfo(result.data);
      } else {
        setError(result.error || "Ошибка получения информации о диске");
      }
    } catch (err) {
      setError("Ошибка сети");
      console.error("Ошибка получения информации о диске:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiskInfo();
  }, []);

  const getStorageWarning = (): string | null => {
    if (!diskInfo?.usePercentage || diskInfo.usePercentage === "N/A") {
      return null;
    }

    const usage = parseInt(diskInfo.usePercentage.replace("%", ""));

    if (usage >= 90) {
      return "critical"; // Критически мало места
    } else if (usage >= 80) {
      return "warning"; // Предупреждение
    }

    return null;
  };

  const refresh = () => {
    fetchDiskInfo();
  };

  return {
    diskInfo,
    loading,
    error,
    refresh,
    warning: getStorageWarning(),
  };
}
