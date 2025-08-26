"use client";
import { useState, useEffect } from "react";
import ContactField from "./ContactField";
import type { UserProfile, PreferredContact } from "@/types";
import { UpdateProfileSchema } from "@/lib/validations";
import { useFormValidation } from "@/lib/hooks/useFormValidation";
import { useToastContext } from "@/components/providers/ToastProvider";

interface ProfileFormProps {
  initialData: UserProfile;
  isLoading?: boolean;
  onSave: (data: UserProfile) => void;
}

export default function ProfileForm({
  initialData,
  isLoading = false,
  onSave,
}: Readonly<ProfileFormProps>) {
  const toast = useToastContext();
  const [formData, setFormData] = useState<UserProfile>(initialData);
  const [editingFields, setEditingFields] = useState<Set<keyof UserProfile>>(
    new Set()
  );
  const [savingFields, setSavingFields] = useState<Set<keyof UserProfile>>(
    new Set()
  );

  // Обновляем форму при изменении данных от родителя
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Проверяем доступность выбранного способа связи
  useEffect(() => {
    const { preferredContact, phone, telegram } = formData;

    // Если выбран телефон, но поле пустое - сбрасываем на email
    if (preferredContact === "phone" && !phone?.trim()) {
      setFormData((prev) => ({ ...prev, preferredContact: "email" }));
    }

    // Если выбран телеграм, но поле пустое - сбрасываем на email
    if (preferredContact === "telegram" && !telegram?.trim()) {
      setFormData((prev) => ({ ...prev, preferredContact: "email" }));
    }
  }, [formData.phone, formData.telegram, formData.preferredContact]);

  const { validate, validationErrors, getFieldError, clearErrors } =
    useFormValidation(UpdateProfileSchema, {
      showToastOnError: true,
      toastErrorTitle: "Ошибка валидации профиля",
    });

  const handleFieldChange = (field: keyof UserProfile, value: string) => {
    // Валидация telegram username
    if (field === "telegram" && value && !value.startsWith("@")) {
      value = "@" + value.replace(/^@+/, ""); // Убираем лишние @ и добавляем один
    }

    // Для nullable полей преобразуем пустую строку в null
    const processedValue =
      field === "displayName" || field === "phone" || field === "telegram"
        ? value.trim() === ""
          ? null
          : value
        : value;

    const newData = { ...formData, [field]: processedValue };
    setFormData(newData);
  };

  const startEditing = (field: keyof UserProfile) => {
    setEditingFields((prev) => new Set(prev).add(field));
    clearErrors();
  };

  const cancelEditing = (field: keyof UserProfile) => {
    setEditingFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
    // Возвращаем исходное значение
    setFormData((prev) => ({ ...prev, [field]: initialData[field] }));
    clearErrors();
  };

  const saveField = async (field: keyof UserProfile) => {
    // Подготавливаем данные для валидации - всегда включаем preferredContact
    const validationData = {
      preferredContact: formData.preferredContact,
      ...(field === "displayName" && {
        displayName: formData.displayName || undefined,
      }),
      ...(field === "phone" && { phone: formData.phone || undefined }),
      ...(field === "telegram" && { telegram: formData.telegram || undefined }),
    };

    if (!validate(validationData)) {
      return;
    }

    setSavingFields((prev) => new Set(prev).add(field));

    try {
      // Отправляем только измененное поле
      const updateData: Partial<UserProfile> = {
        [field]: formData[field],
      };

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error("Ошибка сохранения");

      const updatedData = await response.json();

      // Обновляем initialData чтобы отражать сохраненные изменения
      const newInitialData = {
        ...initialData,
        [field]: updatedData.user[field],
      };

      // Обновляем состояние формы с актуальными данными с сервера
      setFormData((prev) => ({
        ...prev,
        ...updatedData.user,
      }));

      // Выходим из режима редактирования
      setEditingFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });

      toast.success(
        "Поле обновлено!",
        `${getFieldLabel(field)} успешно сохранено`
      );

      // Обновляем через onSave для синхронизации с родительским компонентом
      onSave(newInitialData);
    } catch (error) {
      console.error(`Ошибка сохранения ${field}:`, error);
      toast.error(
        "Ошибка сохранения",
        `Ошибка при сохранении ${getFieldLabel(field).toLowerCase()}`
      );
    } finally {
      setSavingFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  };

  const getFieldLabel = (field: keyof UserProfile): string => {
    const labels: Record<keyof UserProfile, string> = {
      name: "Имя",
      displayName: "Имя на платформе",
      email: "Email",
      phone: "Телефон",
      telegram: "Telegram",
      preferredContact: "Предпочитаемый способ связи",
    };
    return labels[field] || field;
  };

  const handlePreferredContactChange = (value: string) => {
    // Проверяем, что значение соответствует нашему типу
    const validContacts: PreferredContact[] = ["email", "phone", "telegram"];

    if (validContacts.includes(value as PreferredContact)) {
      handleFieldChange("preferredContact", value as PreferredContact);
    }
  };

  const isFieldEditing = (field: keyof UserProfile) => editingFields.has(field);
  const isFieldSaving = (field: keyof UserProfile) => savingFields.has(field);
  const hasFieldChanged = (field: keyof UserProfile) =>
    formData[field] !== initialData[field];

  const contactOptions: Array<{
    value: PreferredContact;
    label: string;
  }> = [
    { value: "email", label: "Email" },
    { value: "phone", label: "Телефон" },
    { value: "telegram", label: "Telegram" },
  ];

  return (
    <div className="lg:col-span-2">
      <div
        className="p-6 rounded-lg border"
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div className="mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Личные данные
          </h2>
          <p
            className="text-sm mt-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Нажмите на поле для редактирования
          </p>
        </div>

        <div className="space-y-6">
          {/* Имя из Google (всегда отключено) */}
          <ContactField
            label="Имя из Google аккаунта"
            value={formData.name}
            onChange={() => {}} // Не изменяется
            disabled={true} // Всегда заблокировано
            helpText="Автоматически подтягивается из Google аккаунта"
          />

          {/* Отображаемое имя */}
          <div
            className="border rounded-lg p-4"
            style={{ borderColor: "var(--color-primary-400)" }}
          >
            <ContactField
              label="Имя на платформе"
              value={formData.displayName || ""}
              onChange={(value) => handleFieldChange("displayName", value)}
              disabled={!isFieldEditing("displayName")}
              placeholder="Имя для показа в отзывах и комментариях"
              helpText="Если не заполнено, будет использоваться имя из Google"
              maxLength={100}
              showCounter={true}
              error={getFieldError("displayName")}
            />
            <div className="flex gap-2 mt-3">
              {!isFieldEditing("displayName") ? (
                <button
                  type="button"
                  onClick={() => startEditing("displayName")}
                  className="btn-discord btn-discord-primary btn-sm"
                  disabled={isLoading}
                >
                  Редактировать
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => saveField("displayName")}
                    disabled={
                      isFieldSaving("displayName") ||
                      !hasFieldChanged("displayName")
                    }
                    className="btn-discord btn-discord-primary btn-sm disabled:opacity-50"
                  >
                    {isFieldSaving("displayName")
                      ? "Сохраняем..."
                      : "Сохранить"}
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelEditing("displayName")}
                    disabled={isFieldSaving("displayName")}
                    className="btn-discord btn-discord-primary btn-sm"
                  >
                    Отмена
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Email */}
          <ContactField
            label="Email"
            value={formData.email}
            onChange={() => {}} // Не изменяется
            disabled={true}
            type="email"
            helpText="Email изменить нельзя (привязан к Google аккаунту)"
          />

          {/* Телефон */}
          <div
            className="border rounded-lg p-4"
            style={{ borderColor: "var(--color-primary-400)" }}
          >
            <ContactField
              label="Телефон"
              value={formData.phone || ""}
              onChange={(value) => handleFieldChange("phone", value)}
              disabled={!isFieldEditing("phone")}
              type="tel"
              placeholder="+7 999 123-45-67"
              error={getFieldError("phone")}
            />
            <div className="flex gap-2 mt-3">
              {!isFieldEditing("phone") ? (
                <button
                  type="button"
                  onClick={() => startEditing("phone")}
                  className="btn-discord btn-discord-primary btn-sm"
                  disabled={isLoading}
                >
                  Редактировать
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => saveField("phone")}
                    disabled={
                      isFieldSaving("phone") || !hasFieldChanged("phone")
                    }
                    className="btn-discord btn-discord-primary btn-sm disabled:opacity-50"
                  >
                    {isFieldSaving("phone") ? "Сохраняем..." : "Сохранить"}
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelEditing("phone")}
                    disabled={isFieldSaving("phone")}
                    className="btn-discord btn-discord-primary btn-sm"
                  >
                    Отмена
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Telegram */}
          <div
            className="border rounded-lg p-4"
            style={{ borderColor: "var(--color-primary-400)" }}
          >
            <ContactField
              label="Telegram"
              value={formData.telegram || ""}
              onChange={(value) => handleFieldChange("telegram", value)}
              disabled={!isFieldEditing("telegram")}
              placeholder="@username"
              error={getFieldError("telegram")}
            />
            <div className="flex gap-2 mt-3">
              {!isFieldEditing("telegram") ? (
                <button
                  type="button"
                  onClick={() => startEditing("telegram")}
                  className="btn-discord btn-discord-primary btn-sm"
                  disabled={isLoading}
                >
                  Редактировать
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => saveField("telegram")}
                    disabled={
                      isFieldSaving("telegram") || !hasFieldChanged("telegram")
                    }
                    className="btn-discord btn-discord-primary btn-sm disabled:opacity-50"
                  >
                    {isFieldSaving("telegram") ? "Сохраняем..." : "Сохранить"}
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelEditing("telegram")}
                    disabled={isFieldSaving("telegram")}
                    className="btn-discord btn-discord-primary btn-sm"
                  >
                    Отмена
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Предпочитаемый способ связи */}
          <div
            className="border rounded-lg p-4"
            style={{ borderColor: "var(--color-primary-400)" }}
          >
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Предпочитаемый способ связи
              </label>
              <select
                value={formData.preferredContact}
                onChange={(e) => handlePreferredContactChange(e.target.value)}
                disabled={!isFieldEditing("preferredContact")}
                className="w-full px-3 py-2 rounded border disabled:opacity-50 transition-colors"
                style={{
                  background: isFieldEditing("preferredContact")
                    ? "var(--color-primary-100)"
                    : "var(--color-primary-400)",
                  borderColor: "var(--color-primary-400)",
                  color: isFieldEditing("preferredContact")
                    ? "var(--color-primary-400)"
                    : "var(--color-text-secondary)",
                }}
              >
                {contactOptions.map((option) => {
                  // Проверяем доступность опций
                  const isDisabled =
                    (option.value === "phone" && !formData.phone?.trim()) ||
                    (option.value === "telegram" && !formData.telegram?.trim());

                  return (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={isDisabled}
                      style={{
                        background: "var(--color-primary-300)",
                        color: isDisabled
                          ? "var(--color-text-secondary)"
                          : "var(--color-text-primary)",
                      }}
                    >
                      {option.label}
                      {isDisabled && " (не заполнено)"}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex gap-2 mt-3">
              {!isFieldEditing("preferredContact") ? (
                <button
                  type="button"
                  onClick={() => startEditing("preferredContact")}
                  className="btn-discord btn-discord-primary btn-sm"
                  disabled={isLoading}
                >
                  Редактировать
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => saveField("preferredContact")}
                    disabled={
                      isFieldSaving("preferredContact") ||
                      !hasFieldChanged("preferredContact")
                    }
                    className="btn-discord btn-discord-primary btn-sm disabled:opacity-50"
                  >
                    {isFieldSaving("preferredContact")
                      ? "Сохраняем..."
                      : "Сохранить"}
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelEditing("preferredContact")}
                    disabled={isFieldSaving("preferredContact")}
                    className="btn-discord btn-discord-primary btn-sm"
                  >
                    Отмена
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
