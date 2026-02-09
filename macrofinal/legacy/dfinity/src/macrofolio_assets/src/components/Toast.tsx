import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Default durations by type
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 5000,
  error: 8000,
  warning: 6000,
  info: 5000,
  loading: 0, // Loading toasts don't auto-dismiss
};

export function useToasts() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToasts must be used within a ToastProvider');
  }
  return context;
}

// Toast Icon component
const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  const iconProps = { className: "w-5 h-5" };
  
  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} className={`${iconProps.className} text-success`} />;
    case 'error':
      return <AlertCircle {...iconProps} className={`${iconProps.className} text-danger`} />;
    case 'warning':
      return <AlertTriangle {...iconProps} className={`${iconProps.className} text-warning`} />;
    case 'info':
      return <Info {...iconProps} className={`${iconProps.className} text-info`} />;
    case 'loading':
      return <Loader2 {...iconProps} className={`${iconProps.className} text-info animate-spin`} />;
    default:
      return <Info {...iconProps} />;
  }
};

// Individual Toast component
const ToastItem: React.FC<{ 
  toast: Toast; 
  onClose: () => void;
}> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.type !== 'loading' && toast.duration !== 0) {
      const timer = setTimeout(onClose, toast.duration || DEFAULT_DURATIONS[toast.type]);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const typeStyles = {
    success: 'border-l-success bg-success/5',
    error: 'border-l-danger bg-danger/5',
    warning: 'border-l-warning bg-warning/5',
    info: 'border-l-info bg-info/5',
    loading: 'border-l-info bg-info/5',
  };

  return (
    <div 
      className={`
        flex items-start gap-3 p-4 rounded-lg border border-l-4 bg-card shadow-lg animate-slide-in-right
        max-w-sm w-full ${typeStyles[toast.type]}
      `}
      role="alert"
    >
      <ToastIcon type={toast.type} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-textPrimary">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-textMuted mt-1">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium text-primary hover:text-primary/80 mt-2"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-textMuted hover:text-textPrimary transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      ...toast,
      id: generateId(),
      duration: toast.duration ?? DEFAULT_DURATIONS[toast.type],
    };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      {/* Toast Container */}
      <div 
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem 
              toast={toast} 
              onClose={() => removeToast(toast.id)} 
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Convenience hooks for specific toast types
export function useToast() {
  const { addToast, removeToast, clearToasts } = useToasts();

  return {
    success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) => addToast({ type: 'info', title, message }),
    loading: (title: string, message?: string) => addToast({ type: 'loading', title, message }),
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: { title: string; message?: string };
        success: { title: string; message?: string };
        error: { title: string; message?: string };
      }
    ) => {
      const loadingId = generateId();
      const loadingToast: Toast = { 
        id: loadingId,
        type: 'loading', 
        title: messages.loading.title, 
        message: messages.loading.message,
        duration: 0 
      };
      addToast(loadingToast);
      
      return promise
        .then((data) => {
          removeToast(loadingId);
          addToast({ type: 'success', title: messages.success.title, message: messages.success.message });
          return data;
        })
        .catch((error) => {
          removeToast(loadingId);
          addToast({ type: 'error', title: messages.error.title, message: messages.error.message });
          throw error;
        });
    },
    dismiss: removeToast,
    clear: clearToasts,
  };
}

export default ToastProvider;

