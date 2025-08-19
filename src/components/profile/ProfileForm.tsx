// components/profile/ProfileForm.tsx
"use client";

import { useState } from "react";
import ContactField from "./ContactField";
import type { ProfileData } from "@/types/profile";

interface ProfileFormProps {
  initialData: ProfileData;
  isLoading?: boolean;
  onSave: (data: ProfileData) => void;
}

export default function ProfileForm({
  initialData,
  isLoading = false,
  onSave,
}: Readonly<ProfileFormProps>) {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleFieldChange = (field: keyof ProfileData, value: string) => {
    // Валидация telegram username
    if (field === "telegram" && value && !value.startsWith("@")) {
      value = "@" + value.replace(/^@+/, ""); // Убираем лишние @ и добавляем один
    }

    const newData = { ...formData, [field]: value };
    setFormData(newData);
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(initialData));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Простая валидация
    if (!formData.name.trim()) {
      alert("Введите имя");
      return;
    }

    onSave(formData);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setFormData(initialData);
    setIsEditing(false);
    setHasChanges(false);
  };

  const contactOptions = [
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
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Личные данные
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-discord btn-discord-secondary"
              disabled={isLoading}
            >
              Редактировать
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Имя */}
          <ContactField
            label="Имя"
            value={formData.name}
            onChange={(value) => handleFieldChange("name", value)}
            disabled={!isEditing}
            placeholder="Ваше имя"
            required
          />

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
          <ContactField
            label="Телефон"
            value={formData.phone}
            onChange={(value) => handleFieldChange("phone", value)}
            disabled={!isEditing}
            type="tel"
            placeholder="+7 999 123-45-67"
          />

          {/* Telegram */}
          <ContactField
            label="Telegram"
            value={formData.telegram}
            onChange={(value) => handleFieldChange("telegram", value)}
            disabled={!isEditing}
            placeholder="@username"
          />

          {/* Предпочитаемый способ связи */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Предпочитаемый способ связи
            </label>
            <select
              value={formData.preferredContact}
              onChange={(e) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                handleFieldChange("preferredContact", e.target.value as any)
              }
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded border disabled:opacity-50 transition-colors"
              style={{
                background: isEditing
                  ? "var(--color-primary-100)"
                  : "var(--color-primary-400)",
                borderColor: "var(--color-primary-400)",
                color: isEditing
                  ? "var(--color-primary-400)"
                  : "var(--color-text-secondary)",
              }}
            >
              {contactOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  style={{
                    background: "var(--color-primary-300)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Кнопки сохранения/отмены */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading || !hasChanges}
                className="btn-discord btn-discord-primary disabled:opacity-50"
              >
                {isLoading ? "Сохраняем..." : "Сохранить изменения"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="btn-discord btn-discord-secondary"
              >
                Отмена
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
