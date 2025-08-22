import { useState } from "react";
import { useToastContext } from "@/components/providers/ToastProvider";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface UseContactFormReturn {
  formData: ContactFormData;
  isSubmitting: boolean;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Ошибка", "Пожалуйста, заполните все обязательные поля");
      return;
    }

    setIsSubmitting(true);

    try {
      // Здесь должен быть реальный API для отправки сообщения
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Имитация запроса

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
        "Не удалось отправить сообщение. Попробуйте позже."
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
    handleSubmit,
    handleChange,
  };
}
