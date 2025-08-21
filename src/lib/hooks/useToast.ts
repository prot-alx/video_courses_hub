"use client";
import { useState, useCallback } from "react";
import type { Toast, ToastType } from "@/components/ui/Toast";

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number) => {
      const id =
        Date.now().toString() + Math.random().toString(36).substring(2);
      const newToast: Toast = {
        id,
        type,
        title,
        message,
        duration: duration || 5000,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addToast("success", title, message, duration);
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addToast("error", title, message, duration);
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addToast("warning", title, message, duration);
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addToast("info", title, message, duration);
    },
    [addToast]
  );

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clear,
  };
}
