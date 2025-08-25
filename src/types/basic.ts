// === БАЗОВЫЕ ТИПЫ ===
export type UserRole = "USER" | "ADMIN";
export type CourseFilterType = "all" | "free" | "paid" | "featured";
export type RequestStatus = "new" | "approved" | "rejected" | "cancelled";
export type PreferredContact = "email" | "phone" | "telegram";
export type ContactMethod = "email" | "phone" | "telegram";
export type ToastType = "success" | "error" | "warning" | "info";
export type FilterType = "all" | "new" | "approved" | "rejected";

// === БАЗОВЫЕ СУЩНОСТИ ===
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// === ОСНОВНЫЕ ИНТЕРФЕЙСЫ ===
export interface User extends BaseEntity {
  email: string;
  name: string | null;
  displayName: string | null;
  role: UserRole;
  phone: string | null;
  telegram: string | null;
  preferredContact: PreferredContact;
  image?: string | null;
}

export interface Video extends BaseEntity {
  courseId: string;
  title: string;
  displayName: string | null;
  description: string | null;
  filename: string;
  orderIndex: number;
  isFree: boolean;
  duration: number | null;
  poster: string | null;
}

export interface Course extends BaseEntity {
  title: string;
  shortDescription: string | null;
  fullDescription: string | null;
  price: number | null;
  isFree: boolean;
  isActive: boolean;
  thumbnail: string | null;
  orderIndex: number;
  totalDuration: number;
  // UI поля
  hasAccess?: boolean;
  requestStatus?: RequestStatus | null;
  videosCount?: number;
  freeVideosCount?: number;
  videos?: Video[];
}

export interface CourseRequest extends BaseEntity {
  userId: string;
  courseId: string;
  status: RequestStatus;
  contactMethod: PreferredContact;
  processedAt: string | null;
  user: {
    name: string | null;
    displayName: string | null;
    email: string;
    phone: string | null;
    telegram: string | null;
    preferredContact: PreferredContact;
  };
  course: {
    id: string;
    title: string;
    price: number | null;
  };
}

// === API ОТВЕТЫ ===
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// === ФОРМЫ ===
export interface UserProfile {
  name: string;
  displayName: string | null;
  email: string;
  phone: string | null;
  telegram: string | null;
  preferredContact: PreferredContact;
}

export interface ProfileData {
  name: string;
  displayName: string | null;
  email: string;
  phone: string | null;
  telegram: string | null;
  preferredContact: PreferredContact;
}

export interface CreateCourseInput {
  title: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  price?: number | null;
  isFree: boolean;
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {
  isActive?: boolean;
  orderIndex?: number;
  thumbnail?: string | null;
}

// === РАСШИРЕННЫЕ ТИПЫ ДЛЯ ВИДЕО ===
export interface VideoDetails extends Video {
  courseTitle: string;
  videoUrl: string | null;
  streamUrl?: string;
  hasAccess?: boolean;
}

// === АДМИНСКИЕ ТИПЫ ===
export interface AdminCourse extends Course {
  isActive: boolean;
  videosCount: number;
  orderIndex: number;
}

export interface AdminStats {
  totalCourses: number;
  activeCourses: number;
  freeCourses: number;
  pendingRequests: number;
}

export interface AdminUserView extends User {
  coursesCount: number;
  pendingRequestsCount: number;
  lastActivity?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  admins: number;
  withActiveRequests: number;
  newUsersThisWeek: number;
}

export interface CreateRequestData {
  id: string;
  status: string;
  createdAt: string;
  course: {
    title: string;
  };
  message: string;
}

// === УТИЛИТАРНЫЕ ТИПЫ ===
export interface BaseCourse {
  id: string;
  title: string;
  shortDescription: string | null;
  fullDescription: string | null;
  price: number | null;
  isFree: boolean;
  hasAccess: boolean;
  videosCount: number;
  freeVideosCount: number;
  thumbnail: string | null;
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

export interface CourseFormData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: string;
  isFree: boolean;
  isActive: boolean;
  thumbnail: string;
}

export interface RequestsApiResponse {
  requests: CourseRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: {
    total: number;
    new: number;
    approved: number;
    rejected: number;
    cancelled: number;
  };
}

export interface RequestStats {
  all: number;
  new: number;
  approved: number;
  rejected: number;
}
