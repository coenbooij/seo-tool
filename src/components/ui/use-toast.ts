// Adapted from https://ui.shadcn.com
import { useState, useEffect, useCallback } from "react";

const TOAST_TIMEOUT = 5000;

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastState {
  toasts: Toast[];
}

const useToast = () => {
  const [state, setState] = useState<ToastState>({ toasts: [] });

  useEffect(() => {
    const timer = setInterval(() => {
      setState((current) => ({
        ...current,
        toasts: current.toasts.filter((toast) => {
          const now = new Date().getTime();
          const toastTime = new Date(toast.id).getTime();
          return now - toastTime < TOAST_TIMEOUT;
        }),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
      const id = new Date().toISOString();
      setState((current) => ({
        ...current,
        toasts: [...current.toasts, { id, title, description, variant }],
      }));
    },
    []
  );

  return {
    toast,
    toasts: state.toasts,
  };
};

export { useToast };
