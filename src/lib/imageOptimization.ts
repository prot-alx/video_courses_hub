// Утилиты для оптимизации изображений
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  // Проверяем тип файла
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Поддерживаются только форматы: JPEG, PNG, WebP",
    };
  }

  // Проверяем размер файла (максимум 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB в байтах
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "Размер файла не должен превышать 5MB",
    };
  }

  return { isValid: true };
}

// Функция для сжатия изображения на клиенте
export function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Вычисляем новые размеры с сохранением пропорций
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Рисуем изображение на canvas
      ctx?.drawImage(img, 0, 0, width, height);

      // Конвертируем в blob с сжатием
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Ошибка сжатия изображения"));
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => reject(new Error("Ошибка загрузки изображения"));
    img.src = URL.createObjectURL(file);
  });
}

// Генерация placeholder для lazy loading
export function generatePlaceholder(width: number, height: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Создаем простой градиент
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#f3f4f6");
  gradient.addColorStop(1, "#e5e7eb");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.1);
}

// Проверка поддержки WebP
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src =
      "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
  });
}
