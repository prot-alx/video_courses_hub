import { renderHook, act } from "@testing-library/react";
import { z } from "zod";
import { useFormValidation } from "../lib/hooks/useFormValidation";

// Мокаем ToastProvider
const mockToast = {
  error: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
  dismiss: jest.fn(),
  clear: jest.fn(),
};

jest.mock("@/components/providers/ToastProvider", () => ({
  useToastContext: () => mockToast,
}));

// Тестовые схемы Zod
const TestUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older").max(100, "Age too high"),
});

const SimpleSchema = z.object({
  field: z.string().min(1, "Field is required"),
});

type TestUser = z.infer<typeof TestUserSchema>;
type SimpleData = z.infer<typeof SimpleSchema>;

describe("useFormValidation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic functionality", () => {
    it("should initialize with empty validation errors", () => {
      const { result } = renderHook(() => useFormValidation(SimpleSchema));

      expect(result.current.validationErrors).toEqual({});
      expect(result.current.isValid).toBe(true);
    });

    it("should validate valid data successfully", () => {
      const { result } = renderHook(() => useFormValidation(SimpleSchema));

      const validData: SimpleData = { field: "test" };
      let isValid: boolean;

      act(() => {
        isValid = result.current.validate(validData);
      });

      expect(isValid!).toBe(true);
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.isValid).toBe(true);
      expect(mockToast.error).not.toHaveBeenCalled();
    });

    it("should validate invalid data and set errors", () => {
      const { result } = renderHook(() => useFormValidation(SimpleSchema));

      const invalidData: SimpleData = { field: "" };
      let isValid: boolean;

      act(() => {
        isValid = result.current.validate(invalidData);
      });

      expect(isValid!).toBe(false);
      expect(result.current.validationErrors).toEqual({
        field: "Field is required",
      });
      expect(result.current.isValid).toBe(false);
      expect(mockToast.error).toHaveBeenCalledWith(
        "Ошибка валидации",
        "Проверьте правильность заполнения формы"
      );
    });
  });

  describe("Complex validation with multiple fields", () => {
    it("should handle multiple validation errors", () => {
      const { result } = renderHook(() => useFormValidation(TestUserSchema));

      const invalidData: TestUser = {
        name: "",
        email: "invalid-email",
        age: 15,
      };
      let isValid: boolean;

      act(() => {
        isValid = result.current.validate(invalidData);
      });

      expect(isValid!).toBe(false);
      expect(result.current.validationErrors).toEqual({
        name: "Name is required",
        email: "Invalid email",
        age: "Must be 18 or older",
      });
      expect(result.current.isValid).toBe(false);
    });

    it("should handle nested field paths", () => {
      const NestedSchema = z.object({
        user: z.object({
          profile: z.object({
            bio: z.string().min(1, "Bio is required"),
          }),
        }),
      });

      const { result } = renderHook(() => useFormValidation(NestedSchema));

      const invalidData = {
        user: {
          profile: {
            bio: "",
          },
        },
      };
      let isValid: boolean;

      act(() => {
        isValid = result.current.validate(invalidData);
      });

      expect(isValid!).toBe(false);
      expect(result.current.validationErrors).toEqual({
        "user.profile.bio": "Bio is required",
      });
    });
  });

  describe("Options configuration", () => {
    it("should not show toast when showToastOnError is false", () => {
      const { result } = renderHook(() =>
        useFormValidation(SimpleSchema, { showToastOnError: false })
      );

      const invalidData: SimpleData = { field: "" };

      act(() => {
        result.current.validate(invalidData);
      });

      expect(mockToast.error).not.toHaveBeenCalled();
      expect(result.current.validationErrors).toEqual({
        field: "Field is required",
      });
    });

    it("should use custom toast error title", () => {
      const customTitle = "Custom Error Title";
      const { result } = renderHook(() =>
        useFormValidation(SimpleSchema, {
          toastErrorTitle: customTitle,
        })
      );

      const invalidData: SimpleData = { field: "" };

      act(() => {
        result.current.validate(invalidData);
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        customTitle,
        "Проверьте правильность заполнения формы"
      );
    });

    it("should not reset errors on success when resetOnSuccess is false", () => {
      const { result } = renderHook(() =>
        useFormValidation(SimpleSchema, { resetOnSuccess: false })
      );

      // Сначала создаем ошибку
      act(() => {
        result.current.validate({ field: "" });
      });

      expect(result.current.validationErrors).toEqual({
        field: "Field is required",
      });

      // Затем валидируем корректные данные
      act(() => {
        result.current.validate({ field: "valid" });
      });

      // Ошибки не должны сброситься
      expect(result.current.validationErrors).toEqual({
        field: "Field is required",
      });
    });
  });

  describe("Manual error management", () => {
    it("should clear all errors", () => {
      const { result } = renderHook(() => useFormValidation(SimpleSchema));

      // Сначала создаем ошибку
      act(() => {
        result.current.validate({ field: "" });
      });

      expect(result.current.validationErrors).toEqual({
        field: "Field is required",
      });

      // Затем очищаем
      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.validationErrors).toEqual({});
      expect(result.current.isValid).toBe(true);
    });

    it("should set field error manually", () => {
      const { result } = renderHook(() => useFormValidation(SimpleSchema));

      act(() => {
        result.current.setFieldError("customField", "Custom error message");
      });

      expect(result.current.validationErrors).toEqual({
        customField: "Custom error message",
      });
      expect(result.current.isValid).toBe(false);
    });

    it("should get field error", () => {
      const { result } = renderHook(() => useFormValidation(SimpleSchema));

      act(() => {
        result.current.setFieldError("testField", "Test error");
      });

      expect(result.current.getFieldError("testField")).toBe("Test error");
      expect(result.current.getFieldError("nonExistentField")).toBeUndefined();
    });

    it("should add field error to existing errors", () => {
      const { result } = renderHook(() => useFormValidation(TestUserSchema));

      // Создаем ошибки валидации
      act(() => {
        result.current.validate({ name: "", email: "invalid", age: 15 });
      });

      // Добавляем кастомную ошибку
      act(() => {
        result.current.setFieldError("customField", "Custom error");
      });

      expect(result.current.validationErrors).toEqual({
        name: "Name is required",
        email: "Invalid email",
        age: "Must be 18 or older",
        customField: "Custom error",
      });
    });
  });

  describe("Error handling", () => {
    it("should handle non-ZodError exceptions", () => {
      const BrokenSchema = {
        parse: jest.fn(() => {
          throw new Error("Unexpected error");
        }),
      } as any;

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() => useFormValidation(BrokenSchema));

      let isValid: boolean;

      act(() => {
        isValid = result.current.validate({ test: "data" });
      });

      expect(isValid!).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Unexpected validation error:",
        expect.any(Error)
      );
      expect(mockToast.error).toHaveBeenCalledWith(
        "Ошибка",
        "Произошла неожиданная ошибка валидации"
      );

      consoleSpy.mockRestore();
    });

    it("should handle non-ZodError exceptions without toast", () => {
      const BrokenSchema = {
        parse: jest.fn(() => {
          throw new Error("Unexpected error");
        }),
      } as any;

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() =>
        useFormValidation(BrokenSchema, { showToastOnError: false })
      );

      act(() => {
        result.current.validate({ test: "data" });
      });

      expect(mockToast.error).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("isValid computed property", () => {
    it("should correctly compute isValid based on errors", () => {
      const { result } = renderHook(() => useFormValidation(SimpleSchema));

      // Initially valid (no errors)
      expect(result.current.isValid).toBe(true);

      // Invalid after validation error
      act(() => {
        result.current.validate({ field: "" });
      });
      expect(result.current.isValid).toBe(false);

      // Valid after clearing errors
      act(() => {
        result.current.clearErrors();
      });
      expect(result.current.isValid).toBe(true);

      // Invalid after manual error
      act(() => {
        result.current.setFieldError("field", "Manual error");
      });
      expect(result.current.isValid).toBe(false);
    });
  });
});
