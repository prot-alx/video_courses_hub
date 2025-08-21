// Upload with real progress tracking
export type UploadProgressCallback = (progress: number) => void;

export interface UploadResult {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  error?: string;
}

export function uploadFileWithProgress(
  url: string,
  file: File,
  fieldName: string = "file",
  onProgress?: UploadProgressCallback,
  additionalFields?: Record<string, string>
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    // Добавляем файл
    formData.append(fieldName, file);

    // Добавляем дополнительные поля если есть
    if (additionalFields) {
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    // Отслеживаем прогресс загрузки
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    // Обрабатываем завершение загрузки
    xhr.addEventListener("load", () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            data: response,
          });
        } else {
          // Пытаемся извлечь ошибку из ответа
          let errorMessage = "Ошибка загрузки файла";
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            if (errorResponse.error) {
              errorMessage = errorResponse.error;
            }
          } catch {
            // Используем стандартное сообщение
          }

          resolve({
            success: false,
            error: errorMessage,
          });
        }
      } catch (error) {
        console.log(error);
        resolve({
          success: false,
          error: "Ошибка обработки ответа сервера",
        });
      }
    });

    // Обрабатываем ошибки сети
    xhr.addEventListener("error", () => {
      resolve({
        success: false,
        error: "Ошибка сети при загрузке файла",
      });
    });

    // Обрабатываем отмену загрузки
    xhr.addEventListener("abort", () => {
      resolve({
        success: false,
        error: "Загрузка файла была отменена",
      });
    });

    // Обрабатываем таймаут
    xhr.addEventListener("timeout", () => {
      resolve({
        success: false,
        error: "Время загрузки файла истекло",
      });
    });

    // Настраиваем таймаут (10 минут для больших видеофайлов)
    xhr.timeout = 10 * 60 * 1000;

    // Отправляем запрос
    xhr.open("POST", url);
    xhr.send(formData);
  });
}

// Утилита для отмены загрузки (если нужна)
export class UploadCancellation {
  private xhr: XMLHttpRequest | null = null;

  setXHR(xhr: XMLHttpRequest) {
    this.xhr = xhr;
  }

  cancel() {
    if (this.xhr) {
      this.xhr.abort();
      this.xhr = null;
    }
  }

  isActive(): boolean {
    return this.xhr !== null;
  }
}
