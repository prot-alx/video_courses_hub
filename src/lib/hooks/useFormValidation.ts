import { useState } from "react";
import { ZodSchema, ZodError } from "zod";
import { useToastContext } from "@/components/providers/ToastProvider";

interface UseFormValidationOptions {
  showToastOnError?: boolean;
  toastErrorTitle?: string;
  resetOnSuccess?: boolean;
}

interface UseFormValidationReturn<T> {
  validationErrors: Record<string, string>;
  isValid: boolean;
  validate: (data: T) => boolean;
  clearErrors: () => void;
  setFieldError: (field: string, message: string) => void;
  getFieldError: (field: string) => string | undefined;
}

export function useFormValidation<T>(
  schema: ZodSchema<T>,
  options: UseFormValidationOptions = {}
): UseFormValidationReturn<T> {
  const {
    showToastOnError = true,
    toastErrorTitle = "Ошибка валидации",
    resetOnSuccess = true,
  } = options;

  const toast = useToastContext();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validate = (data: T): boolean => {
    try {
      schema.parse(data);

      if (resetOnSuccess) {
        setValidationErrors({});
      }

      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};

        error.issues.forEach((err) => {
          const path = err.path.join(".");
          if (path) {
            errors[path] = err.message;
          }
        });

        setValidationErrors(errors);

        if (showToastOnError) {
          toast.error(
            toastErrorTitle,
            "Проверьте правильность заполнения формы"
          );
        }

        return false;
      }

      // Неожиданная ошибка
      console.error("Unexpected validation error:", error);
      if (showToastOnError) {
        toast.error("Ошибка", "Произошла неожиданная ошибка валидации");
      }

      return false;
    }
  };

  const clearErrors = () => {
    setValidationErrors({});
  };

  const setFieldError = (field: string, message: string) => {
    setValidationErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  };

  const getFieldError = (field: string): string | undefined => {
    return validationErrors[field];
  };

  const isValid = Object.keys(validationErrors).length === 0;

  return {
    validationErrors,
    isValid,
    validate,
    clearErrors,
    setFieldError,
    getFieldError,
  };
}
