"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ApiResponse } from "@/types";

interface NavItem {
  href: string;
  label: string;
  badge?: number;
  isActive?: boolean;
}

interface AdminNavigationProps {
  items?: NavItem[];
}

export default function AdminNavigation({
  items,
}: Readonly<AdminNavigationProps>) {
  const pathname = usePathname();
  const [pendingRequests, setPendingRequests] = useState(0);

  // Загружаем статистику для бейджей
  const fetchPendingRequests = async () => {
    try {
      const response = await fetch("/api/admin/requests?status=new");
      const data: ApiResponse<{ stats: { new: number } }> =
        await response.json();

      if (data.success && data.data) {
        setPendingRequests(data.data.stats.new || 0);
      }
    } catch (error) {
      console.error("Ошибка загрузки заявок:", error);
    }
  };

  useEffect(() => {
    // Загружаем только если items не переданы (автоматический режим)
    if (!items) {
      fetchPendingRequests();

      // Обновляем каждую минуту
      const interval = setInterval(fetchPendingRequests, 60000);
      return () => clearInterval(interval);
    }
  }, [items]);

  // Автоматическое определение навигации, если items не переданы
  const autoNavItems: NavItem[] = [
    {
      href: "/admin",
      label: "Курсы",
      isActive: pathname === "/admin",
    },
    {
      href: "/admin/requests",
      label: "Заявки",
      badge: pendingRequests > 0 ? pendingRequests : undefined,
      isActive: pathname.startsWith("/admin/requests"),
    },
    {
      href: "/admin/reviews",
      label: "Отзывы",
      isActive: pathname.startsWith("/admin/reviews"),
    },
    {
      href: "/admin/news",
      label: "Новости",
      isActive: pathname.startsWith("/admin/news"),
    },
    {
      href: "/admin/users",
      label: "Пользователи",
      isActive: pathname.startsWith("/admin/users"),
    },
    {
      href: "/admin/files",
      label: "Файлы",
      isActive: pathname.startsWith("/admin/files"),
    },
    {
      href: "/admin/settings",
      label: "Настройки поддержки",
      isActive: pathname.startsWith("/admin/settings"),
    },
    {
      href: "/admin/logs",
      label: "Логи",
      isActive: pathname.startsWith("/admin/logs"),
    },
  ];

  // Используем переданные items или автоматические
  const navItems = items || autoNavItems;

  return (
    <nav className="mb-8">
      {/* Десктопная версия - показываем только на больших экранах */}
      <div className="hidden lg:flex gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`btn-discord relative ${
              item.isActive ? "btn-discord-primary" : "btn-discord-secondary"
            }`}
          >
            {item.label}
            {item.badge && item.badge > 0 && (
              <span className="notification-badge absolute -top-2 -right-2">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Мобильная версия - показываем на средних и маленьких экранах */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 pb-2 min-w-max">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`btn-discord relative whitespace-nowrap text-sm px-3 py-2 ${
                item.isActive ? "btn-discord-primary" : "btn-discord-secondary"
              }`}
            >
              {item.label}
              {item.badge && item.badge > 0 && (
                <span className="notification-badge absolute -top-1 -right-1 text-xs min-w-[16px] h-4 leading-4">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
