// types/user.ts - Типы пользователей (объединяем с profile.ts)
export type PreferredContact = "email" | "phone" | "telegram";
export type UserRole = "USER" | "ADMIN";

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  telegram: string;
  preferredContact: PreferredContact;
}

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface User extends BaseUser {
  phone: string | null;
  telegram: string | null;
  preferredContact: PreferredContact;
  googleId?: string;
  coursesCount: number;
  activeRequests: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  admins: number;
  withActiveRequests: number;
}
