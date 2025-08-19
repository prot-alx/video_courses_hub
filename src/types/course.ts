// types/course.ts - Обновленные типы курсов
export type CourseFilterType = "all" | "free" | "paid";

export interface Video {
  id: string;
  title: string;
  description?: string | null;
  isFree: boolean;
  duration: number | null; // в секундах
  orderIndex: number;
  hasAccess: boolean;
}

export interface VideoDetails extends Video {
  courseId: string;
  courseTitle: string;
  videoUrl: string | null; // Путь к видеофайлу
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  isFree: boolean;
  hasAccess: boolean;
  videosCount: number;
  freeVideosCount: number;
  videos: Video[];
  thumbnail: string | null;
}

export interface CourseStats {
  totalUsers: number;
  activeUsers: number;
  completionRate: number;
  averageWatchTime: number;
}
