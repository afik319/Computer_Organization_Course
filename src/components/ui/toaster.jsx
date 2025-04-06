import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts
        .filter((toast) => toast.open !== false) // מציג רק טוסטים פתוחים
        .map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            open={toast.open}
            onOpenChange={toast.onOpenChange}
            className="text-right"
            dir="rtl"
          >
            <div className="grid gap-1">
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              {toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </div>

            {/* כפתור ✖ בעיצוב המקורי */}
            <button
              onClick={() => toast.dismiss?.()}
              className="absolute right-2 top-2 rounded-md p-1 text-foreground/40 opacity-0 transition-opacity hover:text-foreground/70 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </Toast>
        ))}
      <ToastViewport />
    </ToastProvider>
  );
}
