import { useState } from "react";
import { useToastContext } from "@/components/providers/ToastProvider";
import { ContactFormSchema } from "@/lib/validations";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface UseContactFormReturn {
  formData: ContactFormData;
  isSubmitting: boolean;
  validationErrors: Record<string, string>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

export function useContactForm(): UseContactFormReturn {
  const toast = useToastContext();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация с Zod
    const validation = ContactFormSchema.safeParse(formData);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as string] = error.message;
        }
      });
      setValidationErrors(errors);
      toast.error(
        "Ошибка валидации",
        "Проверьте правильность заполнения формы"
      );
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);

    try {
      // Отправляем данные формы на API
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка отправки');
      }

      toast.success(
        "Сообщение отправлено!",
        "Спасибо за обращение! Мы свяжемся с вами в ближайшее время."
      );

      // Очищаем форму
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.log(error);
      toast.error(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось отправить сообщение. Попробуйте позже."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return {
    formData,
    isSubmitting,
    validationErrors,
    handleSubmit,
    handleChange,
  };
}
