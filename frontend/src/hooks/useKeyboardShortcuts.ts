'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled: boolean = true) {
  const pressedKeysRef = useRef(new Set<string>());

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Prevent repeat firings when key is held
      const keyId = `${event.key}-${event.ctrlKey}-${event.shiftKey}-${event.altKey}`;
      if (pressedKeysRef.current.has(keyId)) return;
      pressedKeysRef.current.add(keyId);

      // Don't trigger shortcuts when typing in inputs/textareas
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // Allow Escape and some specific shortcuts in inputs
        if (event.key !== 'Escape') {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey);
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts, enabled]
  );

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const keyId = `${event.key}-${event.ctrlKey}-${event.shiftKey}-${event.altKey}`;
    pressedKeysRef.current.delete(keyId);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, enabled]);
}

export const defaultShortcuts: Omit<ShortcutConfig, 'action'>[] = [
  { key: 'n', ctrl: true, description: 'Create new note' },
  { key: 's', ctrl: true, description: 'Save current note' },
  { key: 'Delete', ctrl: true, description: 'Delete current note' },
  { key: 'p', ctrl: true, description: 'Pin/Unpin note' },
  { key: 'e', ctrl: true, description: 'Export note' },
  { key: 'd', ctrl: true, description: 'Toggle dark mode' },
  { key: '/', ctrl: true, description: 'Focus search' },
  { key: 'Escape', description: 'Close editor / Deselect' },
  { key: '1', alt: true, description: 'Go to Dashboard' },
  { key: '2', alt: true, description: 'Go to Notebooks' },
  { key: '3', alt: true, description: 'Go to Tags' },
  { key: '?', shift: true, description: 'Show keyboard shortcuts' },
];
