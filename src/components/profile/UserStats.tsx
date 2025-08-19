// components/profile/UserStats.tsx
"use client";
import { useState, useEffect } from "react";

interface UserStatsData {
  purchasedCourses: number;
  memberSince: string;
}

export default function UserStats() {
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/profile/stats");
      if (!response.ok) throw new Error("Ошибка загрузки статистики");

      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Ошибка загрузки статистики:", error);
      // В случае ошибки показываем заглушку
      setStats({ purchasedCourses: 0, memberSince: "—" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between">
          <span style={{ color: "var(--color-text-secondary)" }}>
            Курсов куплено:
          </span>
          <span style={{ color: "var(--color-text-primary)" }}>...</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: "var(--color-text-secondary)" }}>
            На платформе с:
          </span>
          <span style={{ color: "var(--color-text-primary)" }}>...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span style={{ color: "var(--color-text-secondary)" }}>
          Курсов куплено:
        </span>
        <span style={{ color: "var(--color-text-primary)" }}>
          {stats?.purchasedCourses || 0}
        </span>
      </div>
      <div className="flex justify-between">
        <span style={{ color: "var(--color-text-secondary)" }}>
          На платформе с:
        </span>
        <span style={{ color: "var(--color-text-primary)" }}>
          {stats?.memberSince || "—"}
        </span>
      </div>
    </div>
  );
}
