import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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

  const colorByType = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="pointer-events-none fixed right-5 top-5 z-[1000] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2.5">
        {toasts.map(toast => {
          const Icon = iconByType[toast.type];
          return (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto flex items-start gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-xl dark:bg-[var(--bg-surface)]"
              style={{ borderColor: 'var(--border)' }}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${colorByType[toast.type]}`} />
              <p className="min-w-0 flex-1 text-sm font-medium leading-5 text-slate-700 dark:text-[var(--text-primary)]">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-200"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
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
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}
