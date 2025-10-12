import { useCallback } from 'react';
import toast from 'react-hot-toast';
import type { ToastOptions } from '../services/types';

export const useToast = () => {
  const showToast = useCallback((options: ToastOptions) => {
    const { type, title, description, duration = 4000 } = options;

    const toastOptions = {
      duration,
      position: 'top-right' as const,
      style: {
        background: '#fff',
        color: '#333',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        maxWidth: '400px',
      },
    };

    switch (type) {
      case 'success':
        toast.success(
          `${title}${description ? ` - ${description}` : ''}`,
          toastOptions
        );
        break;

      case 'error':
        toast.error(
          `${title}${description ? ` - ${description}` : ''}`,
          toastOptions
        );
        break;

      case 'warning':
        toast(
          `${title}${description ? ` - ${description}` : ''}`,
          {
            ...toastOptions,
            icon: '⚠️',
          }
        );
        break;

      case 'info':
      default:
        toast(
          `${title}${description ? ` - ${description}` : ''}`,
          {
            ...toastOptions,
            icon: 'ℹ️',
          }
        );
        break;
    }
  }, []);

  const showSuccess = useCallback((title: string, description?: string) => {
    showToast({ type: 'success', title, description });
  }, [showToast]);

  const showError = useCallback((title: string, description?: string) => {
    showToast({ type: 'error', title, description });
  }, [showToast]);

  const showInfo = useCallback((title: string, description?: string) => {
    showToast({ type: 'info', title, description });
  }, [showToast]);

  const showWarning = useCallback((title: string, description?: string) => {
    showToast({ type: 'warning', title, description });
  }, [showToast]);

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
};
