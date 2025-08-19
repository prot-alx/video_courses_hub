// src/components/layout/AdminContactButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

interface AdminContactButtonProps {
  className?: string;
  position?: "fixed" | "static";
}

export default function AdminContactButton({ 
  className = "", 
  position = "fixed" 
}: AdminContactButtonProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [adminTelegram, setAdminTelegram] = useState<string | null>(null);

  useEffect(() => {
    // Загружаем Telegram админа
    const fetchAdminContact = async () => {
      try {
        const response = await fetch("/api/admin/contact");
        const data = await response.json();
        if (data.success) {
          setAdminTelegram(data.data.telegram);
        }
      } catch (error) {
        console.error("Ошибка загрузки контактов админа:", error);
      }
    };

    // Загружаем только для авторизованных не-админов
    if (isAuthenticated && !isAdmin) {
      fetchAdminContact();
    }
  }, [isAuthenticated, isAdmin]);

  // Не показываем кнопку админам или если Telegram не загружен
  if (isAdmin || !adminTelegram) {
    return null;
  }

  const handleContactAdmin = () => {
    const username = adminTelegram.replace("@", "");
    window.open(`https://t.me/${username}`, "_blank");
  };

  const buttonClasses = position === "fixed" 
    ? "fixed bottom-6 right-6 z-50 btn-discord btn-discord-primary shadow-lg hover:shadow-xl"
    : "btn-discord btn-discord-primary";

  return (
    <button
      onClick={handleContactAdmin}
      className={`${buttonClasses} ${className} flex items-center gap-2`}
      title="Написать администратору в Telegram"
    >
      <span className="text-lg">💬</span>
      <span className="text-sm font-medium">
        {position === "fixed" ? "Админ" : "Написать админу"}
      </span>
    </button>
  );
}