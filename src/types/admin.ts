// Так как у вас уже есть типы, возможно они уже определены
// Проверьте существующие типы перед добавлением этих

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  phone: string | null;
  telegram: string | null;
  preferredContact: "email" | "telegram" | "phone";
  createdAt: string;
  coursesCount: number;
  activeRequests: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  admins: number;
  withActiveRequests: number;
}