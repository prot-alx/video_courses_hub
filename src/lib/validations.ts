import { z } from "zod";

// Схемы для курсов
export const CreateCourseSchema = z.object({
  title: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Максимум 100 символов"),
  shortDescription: z
    .string()
    .max(150, "Краткое описание не должно превышать 150 символов")
    .optional()
    .nullable(),
  fullDescription: z
    .string()
    .max(2000, "Подробное описание не должно превышать 2000 символов")
    .optional()
    .nullable(),
  price: z
    .number()
    .min(1, "Цена должна быть больше 0")
    .max(999999, "Максимальная цена 999,999 ₽")
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
  title: z
    .string()
    .min(1, "Название видео обязательно")
    .max(100, "Максимум 100 символов"), // Для совместимости
  displayName: z
    .string()
    .min(1, "Отображаемое название обязательно")
    .max(100, "Максимум 100 символов"),
  description: z
    .string()
    .max(2000, "Описание не должно превышать 2000 символов")
    .optional()
    .nullable(),
  filename: z.string().min(1, "Имя файла обязательно"),
  orderIndex: z.number().int().min(0).default(0),
  isFree: z.boolean().default(false),
  duration: z.number().int().min(0).optional(),
  fileSize: z.number().int().min(0).optional(),
  poster: z.string().optional(),
});

export const UpdateVideoSchema = z.object({
  displayName: z
    .string()
    .min(1, "Отображаемое название обязательно")
    .max(100, "Максимум 100 символов")
    .optional(),
  description: z
    .string()
    .max(2000, "Описание не должно превышать 2000 символов")
    .optional()
    .nullable(),
  orderIndex: z.number().int().min(0).optional(),
  isFree: z.boolean().optional(),
  duration: z.number().int().min(0).optional(),
  fileSize: z.number().int().min(0).optional(),
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
  displayName: z
    .string()
    .max(100, "Максимум 100 символов")
    .optional()
    .nullable(),
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

// Схемы для новостей
export const CreateNewsSchema = z.object({
  title: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Максимум 100 символов"),
  shortDescription: z
    .string()
    .min(1, "Краткое описание обязательно")
    .max(150, "Краткое описание не должно превышать 150 символов"),
  fullDescription: z
    .string()
    .min(1, "Подробное описание обязательно")
    .max(2000, "Подробное описание не должно превышать 2000 символов"),
  image: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const UpdateNewsSchema = CreateNewsSchema.partial();

// Схема для отзывов
export const ReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Оценка обязательна")
    .max(5, "Максимальная оценка 5"),
  comment: z
    .string()
    .max(500, "Комментарий не должен превышать 500 символов")
    .optional()
    .nullable(),
});

// Схема для формы обратной связи
export const ContactFormSchema = z.object({
  name: z.string().min(1, "Имя обязательно").max(100, "Максимум 100 символов"),
  email: z.string().email("Некорректный email"),
  subject: z
    .enum(
      ["general", "courses", "enrollment", "technical", "partnership", "other"],
      {
        message: "Выберите корректную тему",
      }
    )
    .optional(),
  message: z
    .string()
    .min(1, "Сообщение обязательно")
    .max(2000, "Максимум 2000 символов"),
});

// Схема для входа администратора
export const AdminLoginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Пароль обязателен"),
});
