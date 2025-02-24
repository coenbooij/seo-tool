"use client";

import { useToast } from "./use-toast";
import { Toast } from "./toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-0 right-0 z-[100] flex flex-col gap-2 w-full max-w-[420px] p-4">
      {toasts.map(({ id, title, description, variant }) => (
        <Toast key={id} variant={variant} className="overflow-hidden">
          <div className="grid gap-1">
            {title && <div className="font-semibold">{title}</div>}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
          </div>
        </Toast>
      ))}
    </div>
  );
}
