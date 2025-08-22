import { z } from "zod";

// Схемы для курсов
export const CreateCourseSchema = z.object({
  title: z
    .string()
    .min(1, "Название обязательно")
    .max(200, "Максимум 200 символов"),
  description: z.string().optional().nullable(),
  price: z
    .number()
    .min(0, "Цена не может быть отрицательной")
    .optional()
    .nullable(),
  isFree: z.boolean().default(false),
  isActive: z.boolean().default(true),
  thumbnail: z.string().optional().nullable(),
});

export const UpdateCourseSchema = CreateCourseSchema.partial();

// Схемы для видео
export const CreateVideoSchema = z.object({
  courseId: z.string().min(1, "ID курса обязателен"),
  title: z.string().min(1, "Название видео обязательно").max(200), // Для совместимости
  displayName: z.string().min(1, "Отображаемое название обязательно").max(200),
  description: z
    .string()
    .max(2000, "Описание не должно превышать 2000 символов")
    .optional()
    .nullable(),
  filename: z.string().min(1, "Имя файла обязательно"),
  orderIndex: z.number().int().min(0).default(0),
  isFree: z.boolean().default(false),
  duration: z.number().int().min(0).optional(),
  poster: z.string().optional(),
});

export const UpdateVideoSchema = z.object({
  displayName: z
    .string()
    .min(1, "Отображаемое название обязательно")
    .max(200)
    .optional(),
  description: z
    .string()
    .max(2000, "Описание не должно превышать 2000 символов")
    .optional()
    .nullable(),
  orderIndex: z.number().int().min(0).optional(),
  isFree: z.boolean().optional(),
  duration: z.number().int().min(0).optional(),
  // title, courseId и filename не редактируются в update
});

// Схемы для заявок на покупку
export const CourseRequestSchema = z.object({
  courseId: z.string().min(1, "ID курса обязателен"),
  contactMethod: z.enum(["email", "phone", "telegram"]),
});

export const ProcessRequestSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

// Схемы для профиля пользователя
export const UpdateProfileSchema = z.object({
  phone: z.string().optional(),
  telegram: z.string().optional(),
  preferredContact: z.enum(["email", "phone", "telegram"]).default("email"),
});

// Схемы для управления доступом
export const GrantAccessSchema = z.object({
  userId: z.string().min(1, "ID пользователя обязателен"),
  courseId: z.string().min(1, "ID курса обязателен"),
});

export const RevokeAccessSchema = GrantAccessSchema;

// Схемы для запросов курсов (обновлено с централизованным типом)
export const GetCoursesSchema = z.object({
  type: z.enum(["all", "free", "paid", "featured"]).optional().default("all"),
});

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Схема для изменения порядка видео
export const ReorderVideosSchema = z.object({
  videoIds: z.array(z.string()).min(1, "Список видео не может быть пустым"),
});
