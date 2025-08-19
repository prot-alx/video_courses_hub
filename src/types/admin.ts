// types/admin.ts - Типы для админки
import { UserStats } from "./user";

export interface AdminStats {
  users: UserStats;
  courses: {
    total: number;
    free: number;
    paid: number;
  };
  requests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  path: string;
  createdAt: string;
}
