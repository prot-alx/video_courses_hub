// === CORE TYPES ===
export * from "./common";

// === DOMAIN TYPES ===
export * from "./user";
export * from "./course";
export * from "./request";
export * from "./admin";

// === API & FORMS ===
export * from "./api";
export * from "./forms";

// === DATABASE ===
export * from "./prisma";

// === DEPRECATED (for backward compatibility) ===
// Note: profile.ts types are deprecated, use types from ./user.ts instead

// === RE-EXPORTS FOR CONVENIENCE ===
export type {
  BaseEntity,
  BaseUser,
  BaseCourse,
  BaseVideo,
  UserRole,
  CourseFilterType,
  RequestStatus,
  PreferredContact,
  ToastType,
  DateString,
  ID,
  Nullable,
  Optional,
  RequiredFields,
  PartialExcept,
  FormState,
  PaginationParams,
  PaginatedResponse,
} from "./common";

// === TYPE GUARDS ===
export const isUserRole = (
  role: string
): role is import("./common").UserRole => {
  return ["USER", "ADMIN"].includes(role);
};

export const isCourseFilterType = (
  type: string
): type is import("./common").CourseFilterType => {
  return ["all", "free", "paid", "featured"].includes(type);
};

export const isRequestStatus = (
  status: string
): status is import("./common").RequestStatus => {
  return ["new", "approved", "rejected", "cancelled"].includes(status);
};

// === UTILITY FUNCTIONS ===
export const createEmptyFormState = <T>(
  initialData: T
): import("./common").FormState<T> => ({
  data: initialData,
  isSubmitting: false,
  isValid: true,
  errors: {},
  isDirty: false,
});

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};