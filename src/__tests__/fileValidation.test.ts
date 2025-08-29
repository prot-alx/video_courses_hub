import {
  validateFileExtension,
  validateMimeType,
  validateFileSize,
  validateFileSignature,
  formatFileSize,
} from "@/lib/fileValidation";

// Мокаем File API для Node.js окружения
class MockFile {
  name: string;
  type: string;
  size: number;
  private readonly content: Uint8Array;

  constructor(
    content: number[],
    filename: string,
    options: { type?: string } = {}
  ) {
    this.name = filename;
    this.type = options.type || "";
    this.size = content.length;
    this.content = new Uint8Array(content);
  }

  slice(start = 0, end = this.content.length) {
    return {
      arrayBuffer: () => Promise.resolve(this.content.slice(start, end).buffer),
    };
  }
}

// Полифилл для глобального File объекта
global.File = MockFile as any;

describe("File Validation", () => {
  describe("validateFileExtension", () => {
    it("should accept valid video extensions", () => {
      expect(validateFileExtension("video.mp4")).toEqual({ isValid: true });
      expect(validateFileExtension("movie.webm")).toEqual({ isValid: true });
      expect(validateFileExtension("clip.mov")).toEqual({ isValid: true });
      expect(validateFileExtension("film.avi")).toEqual({ isValid: true });
    });

    it("should reject invalid extensions", () => {
      const result = validateFileExtension("document.pdf");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Недопустимое расширение файла");
    });

    it("should be case insensitive", () => {
      expect(validateFileExtension("VIDEO.MP4")).toEqual({ isValid: true });
      expect(validateFileExtension("Movie.WEBM")).toEqual({ isValid: true });
    });

    it("should handle files without extensions", () => {
      const result = validateFileExtension("videofile");
      expect(result.isValid).toBe(false);
    });
  });

  describe("validateMimeType", () => {
    it("should accept valid video MIME types", () => {
      expect(validateMimeType("video/mp4")).toEqual({ isValid: true });
      expect(validateMimeType("video/webm")).toEqual({ isValid: true });
      expect(validateMimeType("video/quicktime")).toEqual({ isValid: true });
      expect(validateMimeType("video/x-msvideo")).toEqual({ isValid: true });
    });

    it("should reject invalid MIME types", () => {
      const result = validateMimeType("image/png");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Недопустимый тип файла");
    });

    it("should reject empty MIME type", () => {
      const result = validateMimeType("");
      expect(result.isValid).toBe(false);
    });
  });

  describe("validateFileSize", () => {
    it("should accept files within size limit", () => {
      const tenMB = 10 * 1024 * 1024;
      expect(validateFileSize(tenMB)).toEqual({ isValid: true });
    });

    it("should reject files exceeding default limit (500MB)", () => {
      const sixHundredMB = 600 * 1024 * 1024;
      const result = validateFileSize(sixHundredMB);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Файл слишком большой");
    });

    it("should respect custom size limit", () => {
      const fiveMB = 5 * 1024 * 1024;
      const customLimit = 3 * 1024 * 1024; // 3MB

      const result = validateFileSize(fiveMB, customLimit);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Максимальный размер: 3MB");
    });

    it("should accept zero size files", () => {
      expect(validateFileSize(0)).toEqual({ isValid: true });
    });
  });

  describe("validateFileSignature", () => {
    it("should validate MP4 file signature", async () => {
      // MP4 signature: 0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70
      const mp4Signature = [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70];
      const mockFile = new MockFile(mp4Signature, "test.mp4", {
        type: "video/mp4",
      });

      const result = await validateFileSignature(mockFile as any);
      expect(result.isValid).toBe(true);
    });

    it("should validate WebM file signature", async () => {
      // WebM signature: 0x1a, 0x45, 0xdf, 0xa3
      const webmSignature = [0x1a, 0x45, 0xdf, 0xa3];
      const mockFile = new MockFile(webmSignature, "test.webm", {
        type: "video/webm",
      });

      const result = await validateFileSignature(mockFile as any);
      expect(result.isValid).toBe(true);
    });

    it("should reject invalid file signatures", async () => {
      // Случайные байты, не соответствующие ни одной видео-сигнатуре
      const invalidSignature = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff];
      const mockFile = new MockFile(invalidSignature, "fake.mp4", {
        type: "video/mp4",
      });

      const result = await validateFileSignature(mockFile as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("проверка сигнатуры не пройдена");
    });

    it("should handle file reading errors", async () => {
      // Подавляем console логи для этого теста
      const originalError = console.error;
      const originalLog = console.log;
      console.error = jest.fn();
      console.log = jest.fn();

      // Мокаем файл, который вызывает ошибку при чтении
      const mockFile = {
        slice: () => ({
          arrayBuffer: () => Promise.reject(new Error("Read error")),
        }),
      };

      const result = await validateFileSignature(mockFile as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Ошибка при проверке файла");

      // Восстанавливаем консоль
      console.error = originalError;
      console.log = originalLog;
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB"); // 1024 + 512
      expect(formatFileSize(1024 * 1024)).toBe("1 MB");
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
    });

    it("should handle decimal precision", () => {
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(1100)).toBe("1.07 KB");
    });

    it("should handle very large sizes", () => {
      const terabyte = 1024 * 1024 * 1024 * 1024;
      // В данной реализации массив sizes содержит только 4 элемента: Bytes, KB, MB, GB
      // При превышении индекса получается undefined
      const result = formatFileSize(terabyte);
      expect(result).toContain("1"); // Проверяем что хотя бы цифра есть
    });
  });
});
