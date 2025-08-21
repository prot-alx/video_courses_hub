// File validation utilities
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// Magic bytes для различных видео форматов
const VIDEO_SIGNATURES = {
  // MP4/M4V/MOV
  mp4: [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp
    [0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70], // ftyp
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], // ftyp
  ],
  // WebM
  webm: [[0x1a, 0x45, 0xdf, 0xa3]], // EBML header
  // AVI
  avi: [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  // QuickTime MOV
  mov: [
    [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74], // ftyp qt
  ],
};

// Разрешенные расширения
const ALLOWED_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi"];

// Разрешенные MIME типы
const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];

export function validateFileExtension(filename: string): FileValidationResult {
  const extension = getFileExtension(filename);

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: `Недопустимое расширение файла. Разрешены: ${ALLOWED_EXTENSIONS.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
}

export function validateMimeType(mimeType: string): FileValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      isValid: false,
      error: `Недопустимый тип файла. Разрешены: ${ALLOWED_MIME_TYPES.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
}

export async function validateFileSignature(
  file: File
): Promise<FileValidationResult> {
  try {
    // Читаем первые 32 байта файла
    const buffer = await file.slice(0, 32).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Проверяем сигнатуры для каждого формата
    const signatures = Object.values(VIDEO_SIGNATURES).flat();

    const isValidSignature = signatures.some((signature) => {
      return signature.every((byte, index) => {
        return index < bytes.length && bytes[index] === byte;
      });
    });

    if (!isValidSignature) {
      return {
        isValid: false,
        error:
          "Файл не является допустимым видеофайлом (проверка сигнатуры не пройдена)",
      };
    }

    return { isValid: true };
  } catch (error) {
    console.log(error);
    return {
      isValid: false,
      error: "Ошибка при проверке файла",
    };
  }
}

export function validateFileSize(
  size: number,
  maxSize: number = 500 * 1024 * 1024
): FileValidationResult {
  if (size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    return {
      isValid: false,
      error: `Файл слишком большой. Максимальный размер: ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
}

export async function validateVideoFile(
  file: File
): Promise<FileValidationResult> {
  // 1. Проверка расширения
  const extensionResult = validateFileExtension(file.name);
  if (!extensionResult.isValid) return extensionResult;

  // 2. Проверка MIME типа
  const mimeResult = validateMimeType(file.type);
  if (!mimeResult.isValid) return mimeResult;

  // 3. Проверка размера
  const sizeResult = validateFileSize(file.size);
  if (!sizeResult.isValid) return sizeResult;

  // 4. Проверка сигнатуры файла (более глубокая проверка)
  const signatureResult = await validateFileSignature(file);
  if (!signatureResult.isValid) return signatureResult;

  return { isValid: true };
}

function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf("."));
}

// Утилита для форматирования размера файла
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
