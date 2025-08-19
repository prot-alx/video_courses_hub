import { UserStats } from "@/types";
import StatCard from "./StatCard";

interface UserStatsCardsProps {
  stats: UserStats;
  isLoading?: boolean;
}

// Создаем отдельную сетку, так как ваш StatsGrid требует интерфейс Stats для курсов
export default function UserStatsCards({
  stats,
  isLoading = false,
}: Readonly<UserStatsCardsProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard
        value={stats.totalUsers}
        label="Всего пользователей"
        color="primary"
        isLoading={isLoading}
      />
      <StatCard
        value={stats.activeUsers}
        label="Активных"
        color="success"
        isLoading={isLoading}
      />
      <StatCard
        value={stats.admins}
        label="Администраторов"
        color="warning"
        isLoading={isLoading}
      />
      <StatCard
        value={stats.withActiveRequests}
        label="С активными заявками"
        color="danger"
        isLoading={isLoading}
      />
    </div>
  );
}
