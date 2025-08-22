import { BaseUser, PreferredContact, UserRole } from "./common";

// === USER TYPES ===
export interface User extends BaseUser {
  phone: string | null;
  telegram: string | null;
  preferredContact: PreferredContact;
  googleId?: string;
}

// Admin-specific user view with additional stats
export interface AdminUserView extends User {
  coursesCount: number;
  activeRequests: number;
  lastLoginAt: string | null;
}

// User profile data for forms
export interface UserProfile {
  name: string;
  email: string;
  phone: string | null;
  telegram: string | null;
  preferredContact: PreferredContact;
}

// Authentication user (minimal info from sessions)
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
}

// === STATISTICS ===
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  admins: number;
  withActiveRequests: number;
  newUsersThisWeek: number;
}

// === FORM INPUTS ===
export interface UpdateUserProfileInput {
  name?: string;
  phone?: string | null;
  telegram?: string | null;
  preferredContact?: PreferredContact;
}

export interface UserFilterOptions {
  role?: UserRole;
  hasActiveRequests?: boolean;
  search?: string;
}
