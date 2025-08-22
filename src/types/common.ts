// Common base types used across the application

// === ENUMS ===
export type UserRole = "USER" | "ADMIN";
export type CourseFilterType = "all" | "free" | "paid" | "featured";
export type RequestStatus = "new" | "approved" | "rejected" | "cancelled";
export type PreferredContact = "email" | "phone" | "telegram";
export type ContactMethod = "email" | "phone" | "telegram";
export type ToastType = "success" | "error" | "warning" | "info";

// === BASE ENTITIES ===
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BaseUser extends BaseEntity {
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
}

export interface BaseVideo {
  id: string;
  title: string;
  description?: string | null;
  isFree: boolean;
  duration: number | null;
  orderIndex: number;
  hasAccess: boolean;
}

export interface BaseCourse {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  isFree: boolean;
  hasAccess: boolean;
  videosCount: number;
  freeVideosCount: number;
  thumbnail: string | null;
}

// === UTILITY TYPES ===
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type Nullable<T> = T | null;
export type ID = string;

// === FORM STATE TYPES ===
export interface FormState<T> {
  data: T;
  isSubmitting: boolean;
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
  isDirty: boolean;
}

// === PAGINATION ===
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// === DATE HELPERS ===
export type DateString = string; // ISO date string
export type Timestamp = number; // Unix timestamp
