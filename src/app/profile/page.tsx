// app/profile/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToastContext } from "@/components/providers/ToastProvider";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import NotificationTip from "@/components/profile/NotificationTip";
import { signOut } from "next-auth/react";
import type { ProfileData } from "@/types/profile";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToastContext();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Загружаем данные профиля при монтировании
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    } else if (!authLoading && !isAuthenticated) {
      // Перенаправляем на главную если не авторизован
      window.location.href = "/";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, authLoading]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Ошибка загрузки профиля");

      const data = await response.json();
      setProfileData({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        telegram: data.user.telegram,
        preferredContact: data.user.preferredContact,
      });
    } catch (error) {
      console.error("Ошибка загрузки профиля:", error);
      toast.error("Ошибка загрузки", "Ошибка загрузки данных профиля");
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleSaveProfile = async (data: ProfileData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: data.phone,
          telegram: data.telegram,
          preferredContact: data.preferredContact,
        }),
      });

      if (!response.ok) throw new Error("Ошибка сохранения");

      const updatedData = await response.json();
      setProfileData({
        name: updatedData.user.name,
        email: updatedData.user.email,
        phone: updatedData.user.phone,
        telegram: updatedData.user.telegram,
        preferredContact: updatedData.user.preferredContact,
      });

      toast.success("Профиль обновлён!", "Изменения успешно сохранены");
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      toast.error("Ошибка сохранения", "Ошибка при сохранении профиля");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Ошибка выхода:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Показываем загрузку
  if (authLoading || isPageLoading || !profileData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-primary-200)" }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "var(--color-text-primary)" }}>
            Загрузка профиля...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      <ProfileHeader />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ProfileForm
            initialData={profileData}
            isLoading={isLoading}
            onSave={handleSaveProfile}
          />
          <ProfileSidebar onSignOut={handleSignOut} isLoading={isLoading} />
        </div>

        <div className="mt-6">
          <NotificationTip
            title="Совет"
            message="Указывайте актуальные контакты для связи при покупке курсов. Администратор свяжется с вами по выбранному способу связи для подтверждения заказа."
            type="info"
            icon="💡"
          />
        </div>
      </main>
    </div>
  );
}
