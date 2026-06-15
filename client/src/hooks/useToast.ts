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
        return toast.success(
          `${title}${description ? ` - ${description}` : ''}`,
          toastOptions
        );

      case 'error':
        return toast.error(
          `${title}${description ? ` - ${description}` : ''}`,
          toastOptions
        );

      case 'warning':
        return toast(
          `${title}${description ? ` - ${description}` : ''}`,
          {
            ...toastOptions,
            icon: '⚠️',
          }
        );

      case 'loading':
        return toast.loading(
          `${title}${description ? ` - ${description}` : ''}`,
          {
            ...toastOptions,
            duration: Infinity, // Loading toasts don't auto-dismiss
          }
        );

      case 'info':
      default:
        return toast(
          `${title}${description ? ` - ${description}` : ''}`,
          {
            ...toastOptions,
            icon: 'ℹ️',
          }
        );
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

  const showLoading = useCallback((title: string, description?: string) => {
    const toastId = toast.loading(
      `${title}${description ? ` - ${description}` : ''}`,
      {
        duration: Infinity,
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
      }
    );
    return () => toast.dismiss(toastId);
  }, []);

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading
  };
};
