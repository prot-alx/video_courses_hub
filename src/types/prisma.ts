// Enhanced Prisma types with better type safety

import { Prisma } from "@prisma/client";
import type { UserRole, RequestStatus, PreferredContact } from "./common";

// === ENHANCED PRISMA MODELS ===

// User with proper typing
export interface PrismaUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  phone: string | null;
  telegram: string | null;
  preferredContact: PreferredContact;
  googleId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Course with proper typing
export interface PrismaCourse {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  isFree: boolean;
  isActive: boolean;
  thumbnail: string | null;
  orderIndex: number;
  totalDuration: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Video with proper typing
export interface PrismaVideo {
  id: string;
  courseId: string;
  title: string;
  displayName: string;
  description: string | null;
  filename: string;
  duration: number | null;
  poster: string | null;
  orderIndex: number;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Course Request with proper typing
export interface PrismaCourseRequest {
  id: string;
  userId: string;
  courseId: string;
  status: RequestStatus;
  contactMethod: PreferredContact;
  message: string | null;
  processedAt: Date | null;
  processedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// User Course Access with proper typing
export interface PrismaUserCourseAccess {
  id: string;
  userId: string;
  courseId: string;
  grantedAt: Date;
  grantedBy: string;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// === PRISMA SELECT OBJECTS ===

// Base selects for common queries
export const userBaseSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  phone: true,
  telegram: true,
  preferredContact: true,
  createdAt: true,
} as const satisfies Prisma.UserSelect;

export const courseBaseSelect = {
  id: true,
  title: true,
  description: true,
  price: true,
  isFree: true,
  isActive: true,
  thumbnail: true,
  orderIndex: true,
  totalDuration: true,
  createdAt: true,
} as const satisfies Prisma.CourseSelect;

export const videoBaseSelect = {
  id: true,
  courseId: true,
  title: true,
  displayName: true,
  description: true,
  filename: true,
  duration: true,
  poster: true,
  orderIndex: true,
  isFree: true,
  createdAt: true,
} as const satisfies Prisma.VideoSelect;

export const courseRequestBaseSelect = {
  id: true,
  userId: true,
  courseId: true,
  status: true,
  contactMethod: true,
  processedAt: true,
  processedBy: true,
  createdAt: true,
} as const satisfies Prisma.CourseRequestSelect;

// === COMPLEX SELECTS WITH RELATIONS ===

export const courseWithVideosSelect = {
  ...courseBaseSelect,
  videos: {
    select: videoBaseSelect,
    orderBy: { orderIndex: "asc" },
  },
  _count: {
    select: {
      videos: true,
      userAccess: true,
    },
  },
} as const satisfies Prisma.CourseSelect;

export const courseWithStatsSelect = {
  ...courseBaseSelect,
  _count: {
    select: {
      videos: true,
      userAccess: true,
      requests: {
        where: { status: "new" },
      },
    },
  },
} as const satisfies Prisma.CourseSelect;

export const userWithStatsSelect = {
  ...userBaseSelect,
  _count: {
    select: {
      courseAccess: true,
      courseRequests: {
        where: { status: "new" },
      },
    },
  },
} as const satisfies Prisma.UserSelect;

export const courseRequestWithRelationsSelect = {
  ...courseRequestBaseSelect,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  course: {
    select: {
      id: true,
      title: true,
      price: true,
      isFree: true,
    },
  },
} as const satisfies Prisma.CourseRequestSelect;

// === WHERE CLAUSE BUILDERS ===

export const buildUserWhereClause = (filters: {
  role?: UserRole;
  hasActiveRequests?: boolean;
  search?: string;
}): Prisma.UserWhereInput => {
  const where: Prisma.UserWhereInput = {};

  if (filters.role) {
    where.role = filters.role;
  }

  if (filters.hasActiveRequests !== undefined) {
    where.courseRequests = filters.hasActiveRequests
      ? { some: { status: "new" } }
      : { none: { status: "new" } };
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
};

export const buildCourseWhereClause = (filters: {
  isFree?: boolean;
  isActive?: boolean;
  search?: string;
  priceRange?: { min?: number; max?: number };
}): Prisma.CourseWhereInput => {
  const where: Prisma.CourseWhereInput = {};

  if (filters.isFree !== undefined) {
    where.isFree = filters.isFree;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.priceRange) {
    const { min, max } = filters.priceRange;
    if (min !== undefined || max !== undefined) {
      where.price = {};
      if (min !== undefined) where.price.gte = min;
      if (max !== undefined) where.price.lte = max;
    }
  }

  return where;
};

// === ORDER BY BUILDERS ===

export const buildUserOrderBy = (
  sortBy: "name" | "email" | "createdAt" | "updatedAt",
  sortOrder: "asc" | "desc" = "asc"
): Prisma.UserOrderByWithRelationInput => {
  return { [sortBy]: sortOrder };
};

export const buildCourseOrderBy = (
  sortBy: "title" | "price" | "createdAt" | "orderIndex",
  sortOrder: "asc" | "desc" = "asc"
): Prisma.CourseOrderByWithRelationInput => {
  return { [sortBy]: sortOrder };
};

// === TYPE INFERENCE HELPERS ===

// Infer types from select objects
export type UserWithBase = Prisma.UserGetPayload<{
  select: typeof userBaseSelect;
}>;

export type CourseWithBase = Prisma.CourseGetPayload<{
  select: typeof courseBaseSelect;
}>;

export type VideoWithBase = Prisma.VideoGetPayload<{
  select: typeof videoBaseSelect;
}>;

export type CourseWithVideos = Prisma.CourseGetPayload<{
  select: typeof courseWithVideosSelect;
}>;

export type CourseWithStats = Prisma.CourseGetPayload<{
  select: typeof courseWithStatsSelect;
}>;

export type UserWithStats = Prisma.UserGetPayload<{
  select: typeof userWithStatsSelect;
}>;

export type CourseRequestWithRelations = Prisma.CourseRequestGetPayload<{
  select: typeof courseRequestWithRelationsSelect;
}>;

// === PAGINATION HELPERS ===

export interface PrismaOptions {
  skip?: number;
  take?: number;
  orderBy?:
    | Prisma.UserOrderByWithRelationInput[]
    | Prisma.CourseOrderByWithRelationInput[];
  where?: Prisma.UserWhereInput | Prisma.CourseWhereInput;
}

export const buildPaginationOptions = (
  page: number = 1,
  limit: number = 10
): Pick<PrismaOptions, "skip" | "take"> => ({
  skip: (page - 1) * limit,
  take: limit,
});

// === TRANSACTION HELPERS ===

export interface CreateCourseWithVideosInput {
  course: Prisma.CourseCreateInput;
  videos?: Prisma.VideoCreateManyInput[];
}

export interface UpdateCourseWithVideosInput {
  courseId: string;
  course?: Prisma.CourseUpdateInput;
  videosToCreate?: Prisma.VideoCreateManyInput[];
  videosToUpdate?: { id: string; data: Prisma.VideoUpdateInput }[];
  videosToDelete?: string[];
}

// === VALIDATION HELPERS ===

export const validatePrismaId = (id: string): boolean => {
  // Basic UUID v4 validation
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// === ERROR HANDLING ===

export const isPrismaError = (
  error: unknown
): error is Prisma.PrismaClientKnownRequestError => {
  return error instanceof Prisma.PrismaClientKnownRequestError;
};

export const handlePrismaError = (error: unknown): string => {
  if (isPrismaError(error)) {
    switch (error.code) {
      case "P2002":
        return "Запись с такими данными уже существует";
      case "P2025":
        return "Запись не найдена";
      case "P2003":
        return "Нарушение ссылочной целостности";
      case "P2014":
        return "Конфликт связанных данных";
      default:
        return `Ошибка базы данных: ${error.message}`;
    }
  }
  return "Неизвестная ошибка базы данных";
};
