import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  timestamp: number;
}

interface NotificationStore {
  // State
  toasts: Toast[];

  // Actions
  addToast: (toast: Omit<Toast, "id" | "timestamp">) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;

  // Convenience methods
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Initial state
  toasts: [],

  // Actions
  addToast: (toastData) => {
    const id = uuidv4();
    const toast: Toast = {
      ...toastData,
      id,
      timestamp: Date.now(),
      duration: toastData.duration ?? 5000, // Default 5 seconds
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto remove toast after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, toast.duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },

  // Convenience methods
  success: (title, message, duration) => {
    return get().addToast({ title, message, type: "success", duration });
  },

  error: (title, message, duration = 8000) => {
    return get().addToast({ title, message, type: "error", duration });
  },

  warning: (title, message, duration = 6000) => {
    return get().addToast({ title, message, type: "warning", duration });
  },

  info: (title, message, duration) => {
    return get().addToast({ title, message, type: "info", duration });
  },
}));

// Hook for easy toast usage
export const useToast = () => {
  const { success, error, warning, info, removeToast } = useNotificationStore();

  return {
    success,
    error,
    warning,
    info,
    dismiss: removeToast,
  };
};
