import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    shortcuts.forEach(({ key, ctrlKey, metaKey, shiftKey, altKey, callback }) => {
      const isCtrlPressed = ctrlKey ? event.ctrlKey : !event.ctrlKey;
      const isMetaPressed = metaKey ? event.metaKey : !event.metaKey;
      const isShiftPressed = shiftKey ? event.shiftKey : !event.shiftKey;
      const isAltPressed = altKey ? event.altKey : !event.altKey;
      
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        isCtrlPressed &&
        isMetaPressed &&
        isShiftPressed &&
        isAltPressed
      ) {
        event.preventDefault();
        callback();
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Common keyboard shortcuts for the app
export const useAppKeyboardShortcuts = (actions: {
  onSearch?: () => void;
  onCloseModal?: () => void;
  onRefresh?: () => void;
  onHelp?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      metaKey: true,
      callback: () => actions.onSearch?.(),
      description: 'Focus search'
    },
    {
      key: 'Escape',
      callback: () => actions.onCloseModal?.(),
      description: 'Close modal'
    },
    {
      key: 'r',
      metaKey: true,
      callback: () => actions.onRefresh?.(),
      description: 'Refresh data'
    },
    {
      key: '?',
      callback: () => actions.onHelp?.(),
      description: 'Show help'
    }
  ];

  useKeyboardShortcuts(shortcuts);
};
