"use client";

import { useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import NotificationTip from "@/components/profile/NotificationTip";
import type { ProfileData } from "@/types/profile";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);

  // Моковые данные пользователя (потом заменим на API)
  const initialProfileData: ProfileData = {
    name: "Иван Иванов",
    email: "ivan@example.com",
    phone: "+7 999 123-45-67",
    telegram: "@ivan_dev",
    preferredContact: "email",
  };

  // Обработчики
  const handleSaveProfile = async (data: ProfileData) => {
    setIsLoading(true);
    console.log("Saving profile:", data);

    // Здесь будет API вызов для обновления профиля
    try {
      // Симуляция сохранения
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Профиль успешно обновлен!");
    } catch (error) {
      alert("Ошибка при сохранении профиля");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    console.log("Sign out clicked");

    // Здесь будет NextAuth signOut
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // router.push('/');
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      <ProfileHeader />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ProfileForm
            initialData={initialProfileData}
            isLoading={isLoading}
            onSave={handleSaveProfile}
          />

          <ProfileSidebar onSignOut={handleSignOut} isLoading={isLoading} />
        </div>

        {/* Подсказка */}
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
