"use client";
import React, { createContext, useContext } from "react";
import { useToast } from "@/lib/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import type { ToastType } from "@/components/ui/Toast";

interface ToastContextType {
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
  addToast: (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => string;
  clear: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onRemoveToast={toast.removeToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}
