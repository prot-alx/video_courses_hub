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
      <div className="space-y-4">
        <div>
          <div style={{ color: "var(--color-text-secondary)" }} className="text-sm mb-1">
            Курсов куплено:
          </div>
          <div style={{ color: "var(--color-text-primary)" }} className="text-lg font-semibold">
            ...
          </div>
        </div>
        <div>
          <div style={{ color: "var(--color-text-secondary)" }} className="text-sm mb-1">
            На платформе с:
          </div>
          <div style={{ color: "var(--color-text-primary)" }} className="text-lg font-semibold">
            ...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div style={{ color: "var(--color-text-secondary)" }} className="text-sm mb-1">
          Курсов куплено:
        </div>
        <div style={{ color: "var(--color-text-primary)" }} className="text-lg font-semibold">
          {stats?.purchasedCourses || 0}
        </div>
      </div>
      <div>
        <div style={{ color: "var(--color-text-secondary)" }} className="text-sm mb-1">
          На платформе с:
        </div>
        <div style={{ color: "var(--color-text-primary)" }} className="text-lg font-semibold break-words">
          {stats?.memberSince || "—"}
        </div>
      </div>
    </div>
  );
}
