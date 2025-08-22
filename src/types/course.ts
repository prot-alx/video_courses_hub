import { BaseCourse, BaseVideo, CourseFilterType, DateString } from "./common";

// === VIDEO TYPES ===
export interface Video extends BaseVideo {
  courseId: string;
  filename: string;
  poster?: string | null;
}

export interface VideoDetails extends Video {
  courseTitle: string;
  videoUrl: string | null;
  streamUrl?: string;
}

// Admin video view with additional metadata
export interface AdminVideoView extends Video {
  fileSize?: number;
  uploadedAt: DateString;
  lastModified: DateString;
}

// === COURSE TYPES ===
export interface Course extends BaseCourse {
  videos: Video[];
  totalDuration?: number | null;
  isActive?: boolean;
  orderIndex?: number;
}

export interface CourseDetails extends Course {
  author?: {
    id: string;
    name: string;
  };
  tags?: string[];
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  language?: string;
}

// Admin course view with additional metadata
export interface AdminCourseView extends Course {
  isActive: boolean;
  orderIndex: number;
  enrolledUsersCount: number;
  completionRate: number;
  revenue?: number;
  createdAt: DateString;
  updatedAt: DateString;
}

// === COURSE ACCESS ===
export interface CourseAccess {
  id: string;
  userId: string;
  courseId: string;
  grantedAt: DateString;
  grantedBy: string;
  expiresAt?: DateString | null;
  isActive: boolean;
}

// === STATISTICS ===
export interface CourseStats {
  totalCourses: number;
  freeCourses: number;
  paidCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  averageRating?: number;
}

export interface VideoStats {
  totalVideos: number;
  totalDuration: number; // in seconds
  averageDuration: number;
  publicVideos: number;
  privateVideos: number;
}

// === FORM INPUTS ===
export interface CreateCourseInput {
  title: string;
  description?: string | null;
  price?: number | null;
  isFree: boolean;
  isActive?: boolean;
  thumbnail?: string | null;
  tags?: string[];
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

export interface UpdateCourseInput {
  title?: string;
  description?: string | null;
  price?: number | null;
  isFree?: boolean;
  isActive?: boolean;
  thumbnail?: string | null;
  tags?: string[];
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

export interface CreateVideoInput {
  courseId: string;
  title: string;
  displayName?: string;
  description?: string | null;
  filename: string;
  orderIndex?: number;
  isFree: boolean;
  duration?: number | null;
  poster?: string | null;
}

export interface UpdateVideoInput {
  title?: string;
  displayName?: string;
  description?: string | null;
  orderIndex?: number;
  isFree?: boolean;
  duration?: number | null;
  poster?: string | null;
}

// === FILTERING & SORTING ===
export interface CourseFilterOptions {
  type?: CourseFilterType;
  priceRange?: {
    min?: number;
    max?: number;
  };
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  tags?: string[];
  search?: string;
  isActive?: boolean;
}

export interface VideoFilterOptions {
  courseId?: string;
  isFree?: boolean;
  search?: string;
  durationRange?: {
    min?: number; // in seconds
    max?: number;
  };
}
