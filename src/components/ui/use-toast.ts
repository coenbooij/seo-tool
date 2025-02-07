import { toast as sonnerToast } from "sonner"

const toast = sonnerToast

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  action?: {
    label: string
    onClick: () => void
  }
}

const useToast = () => {
  return {
    toast: ({ title, description, action }: ToastProps) => {
      sonnerToast(title || description, {
        description: title ? description : undefined,
        action: action
          ? {
              label: action.label,
              onClick: action.onClick,
            }
          : undefined,
      })
    },
  }
}

export { toast, useToast }