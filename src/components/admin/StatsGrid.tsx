import StatCard from "./StatCard";

interface Stats {
  totalCourses: number;
  activeCourses: number;
  freeCourses: number;
  pendingRequests: number;
}

interface StatsGridProps {
  stats: Stats;
  isLoading?: boolean;
}

export default function StatsGrid({
  stats,
  isLoading = false,
}: Readonly<StatsGridProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard
        value={stats.totalCourses}
        label="Всего курсов"
        color="primary"
        isLoading={isLoading}
      />

      <StatCard
        value={stats.activeCourses}
        label="Активных"
        color="success"
        isLoading={isLoading}
      />

      <StatCard
        value={stats.freeCourses}
        label="Бесплатных"
        color="warning"
        isLoading={isLoading}
      />

      <StatCard
        value={stats.pendingRequests}
        label="Новых заявок"
        color="danger"
        isLoading={isLoading}
      />
    </div>
  );
}
