"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToastContext } from "@/components/providers/ToastProvider";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface AdminSettings {
  supportTelegram: string;
  supportPhone: string;
  supportEmail: string;
}

export default function AdminSettingsPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const toast = useToastContext();
  const [settings, setSettings] = useState<AdminSettings>({
    supportTelegram: "",
    supportPhone: "",
    supportEmail: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/contact");
      const data = await response.json();

      if (data.success) {
        setSettings({
          supportTelegram: data.data.telegram || "",
          supportPhone: data.data.phone || "",
          supportEmail: data.data.email || "",
        });
        setError(null);
      } else {
        // Если настройки не найдены, это нормально для первого запуска
        if (response.status === 404) {
          setError(null);
        } else {
          setError(data.error || "Ошибка загрузки настроек");
        }
      }
    } catch (err) {
      setError("Ошибка сети при загрузке настроек");
      console.error("Ошибка загрузки настроек:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Валидация ограничений по символам
    if (settings.supportTelegram.length > 50) {
      setError("Telegram не должен превышать 50 символов");
      setSaving(false);
      return;
    }
    if (settings.supportPhone.length > 20) {
      setError("Телефон не должен превышать 20 символов");
      setSaving(false);
      return;
    }
    if (settings.supportEmail.length > 100) {
      setError("Email не должен превышать 100 символов");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Настройки сохранены!", "Контактные данные обновлены");
      } else {
        setError(result.error || "Ошибка сохранения настроек");
      }
    } catch (err) {
      setError("Ошибка сети при сохранении настроек");
      console.error("Ошибка сохранения настроек:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchSettings();
    }
  }, [isAuthenticated, isAdmin]);

  // Проверка доступа
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Доступ запрещен
          </h2>
          <Link href="/admin" className="btn-discord btn-discord-primary">
            К админке
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      <AdminHeader title="Настройки" onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdminNavigation />

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}

        <div
          className="p-6 rounded-lg border"
          style={{
            background: "var(--color-primary-300)",
            borderColor: "var(--color-primary-400)",
          }}
        >
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: "var(--color-text-primary)" }}
          >
            ⚙️ Настройки поддержки
          </h2>

          <div
            className="mb-6 p-4 rounded border"
            style={{
              background: "var(--color-primary-100)",
              borderColor: "var(--color-accent)",
            }}
          >
            <p
              className="text-sm"
              style={{ color: "var(--color-primary-400)" }}
            >
              💡 <strong>Информация:</strong> Эти контакты будут отображаться
              пользователям для связи с поддержкой. Любой админ может изменять
              эти настройки.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span
                className="ml-3"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Загрузка настроек...
              </span>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Telegram для поддержки
                </label>
                <input
                  type="text"
                  value={settings.supportTelegram}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      supportTelegram: e.target.value,
                    }))
                  }
                  placeholder="@support_username"
                  maxLength={50}
                  className={`input-discord w-full ${
                    settings.supportTelegram.length > 50 ? "border-red-500" : ""
                  }`}
                  style={{
                    borderColor:
                      settings.supportTelegram.length > 50
                        ? "#ef4444"
                        : undefined,
                  }}
                  disabled={saving}
                />
                <div className="flex justify-between items-center mt-1">
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Пример: @support_team или @admin_contact
                  </p>
                  <span
                    className={`text-xs ${
                      settings.supportTelegram.length > 50
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {settings.supportTelegram.length}/50
                  </span>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Телефон поддержки
                </label>
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      supportPhone: e.target.value,
                    }))
                  }
                  placeholder="+7 (900) 123-45-67"
                  maxLength={20}
                  className={`input-discord w-full ${
                    settings.supportPhone.length > 20 ? "border-red-500" : ""
                  }`}
                  style={{
                    borderColor:
                      settings.supportPhone.length > 20 ? "#ef4444" : undefined,
                  }}
                  disabled={saving}
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={`text-xs ${
                      settings.supportPhone.length > 20
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {settings.supportPhone.length}/20
                  </span>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Email поддержки
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      supportEmail: e.target.value,
                    }))
                  }
                  placeholder="support@example.com"
                  maxLength={100}
                  className={`input-discord w-full ${
                    settings.supportEmail.length > 100 ? "border-red-500" : ""
                  }`}
                  style={{
                    borderColor:
                      settings.supportEmail.length > 100
                        ? "#ef4444"
                        : undefined,
                  }}
                  disabled={saving}
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={`text-xs ${
                      settings.supportEmail.length > 100
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {settings.supportEmail.length}/100
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={
                    saving ||
                    (!settings.supportTelegram.trim() &&
                      !settings.supportPhone.trim() &&
                      !settings.supportEmail.trim())
                  }
                  className="btn-discord btn-discord-primary disabled:opacity-50"
                >
                  {saving ? "Сохранение..." : "Сохранить настройки"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
