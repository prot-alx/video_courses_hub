import { PaginatedResponse, PaginationParams } from "./common";
import type {
  Course,
  CourseDetails,
  CreateCourseInput,
  UpdateCourseInput,
} from "./course";
import type { CourseRequest } from "./request";

// === GENERIC API RESPONSE TYPES ===
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

// === PAGINATED API RESPONSES ===
export interface ApiPaginatedResponse<T>
  extends ApiResponse<PaginatedResponse<T>> {
  success: true;
  data: PaginatedResponse<T>;
}

// === SPECIFIC API ENDPOINT TYPES ===

// Auth endpoints
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: "USER" | "ADMIN";
  };
  session: {
    token: string;
    expiresAt: string;
  };
}

// Course endpoints
export interface CoursesListParams extends PaginationParams {
  type?: "all" | "free" | "paid" | "featured";
  search?: string;
  tags?: string[];
}

export interface CourseDetailsParams {
  includeVideos?: boolean;
  includeStats?: boolean;
}

// Video endpoints
export interface VideoStreamParams {
  quality?: "360p" | "720p" | "1080p";
  format?: "mp4" | "webm";
}

export interface VideoUploadResponse {
  filename: string;
  originalName: string;
  size: number;
  duration?: number;
  poster?: string;
  uploadUrl: string;
}

// Request endpoints
export interface CourseRequestParams {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  userId?: string;
  courseId?: string;
}

// Admin endpoints
export interface AdminStatsResponse {
  users: {
    total: number;
    active: number;
    admins: number;
    newThisWeek: number;
  };
  courses: {
    total: number;
    free: number;
    paid: number;
    active: number;
  };
  videos: {
    total: number;
    totalDuration: number;
    averageDuration: number;
  };
  requests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  storage: {
    used: number; // in bytes
    total: number; // in bytes
    videosSize: number;
    thumbnailsSize: number;
  };
}

// File upload endpoints
export interface FileUploadParams {
  type: "video" | "thumbnail" | "document";
  maxSize?: number; // in bytes
  allowedFormats?: string[];
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number; // bytes per second
  timeRemaining?: number; // seconds
}

// === REQUEST/RESPONSE MAPPERS ===
export type EndpointMap = {
  // Auth
  "POST /api/auth/login": {
    request: { email: string; password: string };
    response: LoginResponse;
  };
  "POST /api/auth/logout": { request: never; response: { success: true } };

  // Courses
  "GET /api/courses": { request: CoursesListParams; response: Course[] };
  "GET /api/courses/[id]": {
    request: CourseDetailsParams;
    response: CourseDetails;
  };
  "POST /api/admin/courses": { request: CreateCourseInput; response: Course };
  "PUT /api/admin/courses/[id]": {
    request: UpdateCourseInput;
    response: Course;
  };
  "DELETE /api/admin/courses/[id]": {
    request: never;
    response: { success: true };
  };

  // Videos
  "GET /api/videos/[id]/stream": {
    request: VideoStreamParams;
    response: ReadableStream;
  };
  "POST /api/admin/upload/video": {
    request: FormData;
    response: VideoUploadResponse;
  };

  // Requests
  "GET /api/admin/requests": {
    request: CourseRequestParams;
    response: CourseRequest[];
  };
  "POST /api/course-request": {
    request: { courseId: string };
    response: CourseRequest;
  };
  "PATCH /api/admin/requests/[id]": {
    request: { action: "approve" | "reject" };
    response: { success: boolean };
  };

  // Admin
  "GET /api/admin/stats": { request: never; response: AdminStatsResponse };
};

// === TYPE HELPERS ===
export type ApiRequest<T extends keyof EndpointMap> = EndpointMap[T]["request"];
export type ApiResponseData<T extends keyof EndpointMap> =
  EndpointMap[T]["response"];

// Utility type for API hooks
export interface ApiHookOptions<T> {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

// Error code constants
export const API_ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
} as const;

export type ApiErrorCode = keyof typeof API_ERROR_CODES;
