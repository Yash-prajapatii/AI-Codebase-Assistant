import React, {
    createContext,
    useContext,
    useCallback,
    useState,
  } from "react";
  import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
  import clsx from "clsx";
  
  type ToastType = "success" | "error" | "warning" | "info";
  
  interface Toast {
    id: string;
    message: string;
    type: ToastType;
  }
  
  interface ToastContextValue {
    addToast: (message: string, type?: ToastType) => void;
  }
  
  const ToastContext = createContext<ToastContextValue | null>(null);
  
  const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={15} />,
    error:   <XCircle size={15} />,
    warning: <AlertTriangle size={15} />,
    info:    <Info size={15} />,
  };
  
  const STYLES: Record<ToastType, string> = {
    success: "border-success/30 text-success bg-success/10",
    error:   "border-danger/30 text-danger bg-danger/10",
    warning: "border-warning/30 text-warning bg-warning/10",
    info:    "border-info/30 text-info bg-info/10",
  };
  
  export function ToastProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
  
    const addToast = useCallback(
      (message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
      },
      []
    );
  
    const remove = useCallback((id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
  
    return (
      <ToastContext.Provider value={{ addToast }}>
        {children}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={clsx(
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-sm",
                "pointer-events-auto animate-slide-up shadow-lg backdrop-blur-sm",
                "bg-surface-overlay/90",
                STYLES[toast.type]
              )}
            >
              {ICONS[toast.type]}
              <span className="text-ink-primary">{toast.message}</span>
              <button
                onClick={() => remove(toast.id)}
                className="ml-1 text-ink-tertiary hover:text-ink-secondary transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    );
  }
  
  export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
  }