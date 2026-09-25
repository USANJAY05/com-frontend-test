import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4500) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, message, type }].slice(-4));
    window.setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  const dismiss = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const iconByType = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const styleByType = {
    success: {
      icon: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-300 dark:border-emerald-700',
      background: 'bg-emerald-50 dark:bg-emerald-950',
    },
    error: {
      icon: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-300 dark:border-rose-700',
      background: 'bg-rose-50 dark:bg-rose-950',
    },
    warning: {
      icon: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-300 dark:border-amber-700',
      background: 'bg-amber-50 dark:bg-amber-950',
    },
    info: {
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-300 dark:border-blue-700',
      background: 'bg-blue-50 dark:bg-blue-950',
    },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed right-5 top-5 z-[1000] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map(toast => {
          const Icon = iconByType[toast.type];
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-center gap-2.5 rounded-lg border px-3 py-2 shadow-lg ${styleByType[toast.type].border} ${styleByType[toast.type].background}`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${styleByType[toast.type].icon}`} />
              <p className="min-w-0 flex-1 text-xs font-medium leading-4 text-slate-700 dark:text-[var(--text-primary)]">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded-md p-0.5 text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-200"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
