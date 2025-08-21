// Image validation utilities for thumbnails
export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Максимальный размер изображения (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function validateImageExtension(
  filename: string
): ImageValidationResult {
  const extension = getFileExtension(filename);

  if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: `Недопустимое расширение изображения. Разрешены: ${ALLOWED_IMAGE_EXTENSIONS.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
}

export function validateImageMimeType(mimeType: string): ImageValidationResult {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
    return {
      isValid: false,
      error: `Недопустимый тип изображения. Разрешены: ${ALLOWED_IMAGE_MIME_TYPES.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
}

export async function validateImageSignature(
  file: File
): Promise<ImageValidationResult> {
  try {
    // Читаем первые 12 байт файла
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Проверяем JPEG
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return { isValid: true };
    }

    // Проверяем PNG
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return { isValid: true };
    }

    // Проверяем WebP (RIFF + WEBP)
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46
    ) {
      // Проверяем WEBP signature в байтах 8-11
      if (
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
      ) {
        return { isValid: true };
      }
    }

    return {
      isValid: false,
      error: "Файл не является допустимым изображением",
    };
  } catch (error) {
    console.log(error);
    return {
      isValid: false,
      error: "Ошибка при проверке файла изображения",
    };
  }
}

export function validateImageSize(size: number): ImageValidationResult {
  if (size > MAX_IMAGE_SIZE) {
    const maxSizeMB = Math.round(MAX_IMAGE_SIZE / 1024 / 1024);
    return {
      isValid: false,
      error: `Изображение слишком большое. Максимальный размер: ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
}

export async function validateImageFile(
  file: File
): Promise<ImageValidationResult> {
  // 1. Проверка расширения
  const extensionResult = validateImageExtension(file.name);
  if (!extensionResult.isValid) return extensionResult;

  // 2. Проверка MIME типа
  const mimeResult = validateImageMimeType(file.type);
  if (!mimeResult.isValid) return mimeResult;

  // 3. Проверка размера
  const sizeResult = validateImageSize(file.size);
  if (!sizeResult.isValid) return sizeResult;

  // 4. Проверка сигнатуры файла
  const signatureResult = await validateImageSignature(file);
  if (!signatureResult.isValid) return signatureResult;

  return { isValid: true };
}

function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf("."));
}
