import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage, ToastType } from '../types';

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => string;
  showSuccess: (title: string, message: string, duration?: number) => string;
  showError: (title: string, message: string, duration?: number) => string;
  showInfo: (title: string, message: string, duration?: number) => string;
  showWarning: (title: string, message: string, duration?: number) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const duration = toast.duration || (toast.type === 'error' ? 6500 : 4500);

    const newToast: ToastMessage = {
      ...toast,
      id,
      duration,
    };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, [removeToast]);

  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    return showToast({ type: 'success', title, message, duration });
  }, [showToast]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    return showToast({ type: 'error', title, message, duration: duration || 7000 });
  }, [showToast]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    return showToast({ type: 'info', title, message, duration });
  }, [showToast]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    return showToast({ type: 'warning', title, message, duration });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, showSuccess, showError, showInfo, showWarning, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 md:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isError = toast.type === 'error';
            const isSuccess = toast.type === 'success';
            const isWarning = toast.type === 'warning';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`pointer-events-auto rounded-2xl p-4 shadow-xl border backdrop-blur-md flex items-start gap-3.5 transition-all ${
                  isError
                    ? 'bg-white border-red-200 text-slate-900 shadow-red-950/10 ring-1 ring-red-500/20'
                    : isSuccess
                    ? 'bg-white border-emerald-200 text-slate-900 shadow-emerald-950/10 ring-1 ring-emerald-500/20'
                    : isWarning
                    ? 'bg-white border-amber-200 text-slate-900 shadow-amber-950/10 ring-1 ring-amber-500/20'
                    : 'bg-white border-blue-200 text-slate-900 shadow-blue-950/10 ring-1 ring-blue-500/20'
                }`}
              >
                {/* Visual Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isError
                      ? 'bg-red-50 text-red-600'
                      : isSuccess
                      ? 'bg-emerald-50 text-emerald-600'
                      : isWarning
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {isError && <AlertCircle className="w-5 h-5" />}
                  {isSuccess && <CheckCircle2 className="w-5 h-5" />}
                  {isWarning && <AlertTriangle className="w-5 h-5" />}
                  {!isError && !isSuccess && !isWarning && <Info className="w-5 h-5" />}
                </div>

                {/* Content */}
                <div className="flex-grow pr-2 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-black uppercase tracking-wider ${
                      isError ? 'text-red-700' : isSuccess ? 'text-emerald-700' : isWarning ? 'text-amber-700' : 'text-blue-700'
                    }`}>
                      {toast.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed break-words">
                    {toast.message}
                  </p>
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors hover:bg-slate-100 shrink-0"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
