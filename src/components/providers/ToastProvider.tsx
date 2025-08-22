"use client";
import React, { createContext, useContext } from "react";
import { useNotificationStore, useToast } from "@/stores/notifications";
import Toast from "@/components/ui/Toast";

interface ToastContextType {
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { toasts, removeToast, clearAllToasts } = useNotificationStore();
  const toast = useToast();

  const contextValue: ToastContextType = {
    ...toast,
    clear: clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toastItem) => (
          <Toast
            key={toastItem.id}
            toast={toastItem}
            onDismiss={() => removeToast(toastItem.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}
