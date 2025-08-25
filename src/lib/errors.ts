// Централизованная система обработки ошибок
import { NextResponse } from "next/server";

export enum ErrorCode {
  // Общие ошибки
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
  
  // Ошибки валидации
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  
  // Ошибки аутентификации
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  
  // Ошибки курсов и видео
  COURSE_NOT_FOUND = "COURSE_NOT_FOUND",
  VIDEO_NOT_FOUND = "VIDEO_NOT_FOUND",
  ACCESS_DENIED = "ACCESS_DENIED",
  COURSE_INACTIVE = "COURSE_INACTIVE",
  
  // Ошибки файловой системы
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  UPLOAD_FAILED = "UPLOAD_FAILED",
  
  // Ошибки базы данных
  DATABASE_ERROR = "DATABASE_ERROR",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  
  // Бизнес-логика
  REQUEST_ALREADY_EXISTS = "REQUEST_ALREADY_EXISTS",
  USER_ALREADY_HAS_ACCESS = "USER_ALREADY_HAS_ACCESS",
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
  statusCode: number;
}

export class CustomError extends Error implements AppError {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = "CustomError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    
    // Поддержка Error.captureStackTrace для Node.js
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      statusCode: this.statusCode,
    };
  }
}

// Предопределенные ошибки
export const ErrorDefinitions = {
  INTERNAL_SERVER_ERROR: (details?: unknown) => 
    new CustomError(ErrorCode.INTERNAL_SERVER_ERROR, "Внутренняя ошибка сервера", 500, details),
  
  BAD_REQUEST: (message: string = "Некорректный запрос", details?: unknown) =>
    new CustomError(ErrorCode.BAD_REQUEST, message, 400, details),
  
  UNAUTHORIZED: (message: string = "Необходима авторизация") =>
    new CustomError(ErrorCode.UNAUTHORIZED, message, 401),
  
  FORBIDDEN: (message: string = "Доступ запрещен") =>
    new CustomError(ErrorCode.FORBIDDEN, message, 403),
  
  NOT_FOUND: (resource: string = "Ресурс") =>
    new CustomError(ErrorCode.NOT_FOUND, `${resource} не найден`, 404),
  
  VALIDATION_ERROR: (message: string = "Ошибка валидации", details?: unknown) =>
    new CustomError(ErrorCode.VALIDATION_ERROR, message, 400, details),
  
  COURSE_NOT_FOUND: () =>
    new CustomError(ErrorCode.COURSE_NOT_FOUND, "Курс не найден", 404),
  
  VIDEO_NOT_FOUND: () =>
    new CustomError(ErrorCode.VIDEO_NOT_FOUND, "Видео не найдено", 404),
  
  ACCESS_DENIED: (resource: string = "ресурсу") =>
    new CustomError(ErrorCode.ACCESS_DENIED, `Доступ к ${resource} запрещен`, 403),
  
  FILE_TOO_LARGE: (maxSize: string) =>
    new CustomError(ErrorCode.FILE_TOO_LARGE, `Размер файла превышает ${maxSize}`, 400),
  
  INVALID_FILE_TYPE: (allowedTypes: string[]) =>
    new CustomError(ErrorCode.INVALID_FILE_TYPE, `Разрешенные типы файлов: ${allowedTypes.join(", ")}`, 400),
  
  DATABASE_ERROR: (operation: string = "выполнения операции") =>
    new CustomError(ErrorCode.DATABASE_ERROR, `Ошибка базы данных при ${operation}`, 500),
};

// Обработчик ошибок для API routes
export function handleApiError(error: unknown): NextResponse {
  // Логирование ошибки
  logError(error);

  // Если это наша кастомная ошибка
  if (error instanceof CustomError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(process.env.NODE_ENV === "development" && { details: error.details }),
        },
      },
      { status: error.statusCode }
    );
  }

  // Prisma ошибки
  if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.DUPLICATE_ENTRY,
          message: "Запись уже существует",
        },
      },
      { status: 409 }
    );
  }

  if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: "Запись не найдена",
        },
      },
      { status: 404 }
    );
  }

  // Ошибки валидации Zod
  if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Ошибка валидации данных",
          details: "errors" in error ? error.errors : undefined,
        },
      },
      { status: 400 }
    );
  }

  // Неизвестная ошибка
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: "Внутренняя ошибка сервера",
        ...(process.env.NODE_ENV === "development" && { details: error instanceof Error ? error.message : String(error) }),
      },
    },
    { status: 500 }
  );
}

// Логирование ошибок
export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : "";
  
  if (error instanceof CustomError) {
    console.error(
      `${timestamp} ${contextStr} CustomError:`,
      {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
        stack: error.stack,
      }
    );
  } else if (error instanceof Error) {
    console.error(`${timestamp} ${contextStr} Error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error(`${timestamp} ${contextStr} Unknown Error:`, error);
  }
  
  // В продакшене здесь можно добавить отправку в систему мониторинга
  // Например: Sentry, LogRocket, или собственную систему логирования
}

// Вспомогательная функция для безопасного выполнения асинхронных операций
export async function safeAsyncHandler<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<[T | null, CustomError | null]> {
  try {
    const result = await operation();
    return [result, null];
  } catch (error) {
    const customError = error instanceof CustomError 
      ? error 
      : ErrorDefinitions.INTERNAL_SERVER_ERROR(error);
    
    logError(customError, context);
    return [null, customError];
  }
}