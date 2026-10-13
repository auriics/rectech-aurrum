import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success', duration = 4000) => {
    if (!message) return;
    
    // Prevent immediate duplicates
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    setToasts(prev => {
      // Don't duplicate exact same message if already visible
      if (prev.some(t => t.message === message && t.type === type)) {
        return prev;
      }
      return [...prev, { id, type, message, duration }];
    });

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, [dismissToast]);

  const showSuccess = useCallback((message: string, duration = 4000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration = 5000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration = 4500) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration = 4000) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const contextValue = useMemo(() => ({
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissToast,
  }), [showToast, showSuccess, showError, showWarning, showInfo, dismissToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Non-blocking Fixed Toast Notification Stack */}
      <div 
        aria-live="polite"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map(toast => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
                  isSuccess 
                    ? 'bg-emerald-600/95 dark:bg-emerald-600/90 text-white border-emerald-400/40 shadow-emerald-950/20' 
                    : isError
                    ? 'bg-rose-600/95 dark:bg-rose-600/90 text-white border-rose-400/40 shadow-rose-950/20'
                    : isWarning
                    ? 'bg-amber-600/95 dark:bg-amber-600/90 text-white border-amber-400/40 shadow-amber-950/20'
                    : 'bg-[#00334A]/95 text-white border-[#BA9E6A]/40 shadow-black/30'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-100" />}
                  {isError && <AlertCircle className="w-5 h-5 text-rose-100" />}
                  {isWarning && <AlertTriangle className="w-5 h-5 text-amber-100" />}
                  {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[var(--primary-gold)]" />}
                </div>

                <div className="flex-1 text-xs sm:text-sm font-semibold leading-snug">
                  {toast.message}
                </div>

                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="shrink-0 p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Dismiss notification"
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

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
