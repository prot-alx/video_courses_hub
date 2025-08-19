// types/forms.ts - Типы для форм (на основе validations.ts)
import { ContactMethod } from "./request";
import { PreferredContact } from "./user";

export interface CreateCourseInput {
  title: string;
  description?: string | null;
  price?: number | null;
  isFree: boolean;
  isActive?: boolean;
  thumbnail?: string | null;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string | null;
  price?: number | null;
  isFree?: boolean;
  isActive?: boolean;
  thumbnail?: string | null;
}

export interface CreateVideoInput {
  courseId: string;
  title: string;
  displayName: string;
  description?: string | null;
  filename: string;
  orderIndex?: number;
  isFree: boolean;
  duration?: number;
  poster?: string;
}

export interface UpdateVideoInput {
  displayName?: string;
  description?: string | null;
  orderIndex?: number;
  isFree?: boolean;
  duration?: number;
}

export interface CourseRequestInput {
  courseId: string;
  contactMethod: ContactMethod;
}

export interface ProcessRequestInput {
  status: "approved" | "rejected";
}

export interface UpdateProfileInput {
  phone?: string;
  telegram?: string;
  preferredContact?: PreferredContact;
}

export interface GrantAccessInput {
  userId: string;
  courseId: string;
}

export interface ReorderVideosInput {
  videoIds: string[];
}

export interface PaginationInput {
  page?: number;
  limit?: number;
}
