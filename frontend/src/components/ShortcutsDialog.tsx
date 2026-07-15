'use client';

import { FiX, FiCommand } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultShortcuts } from '@/hooks/useKeyboardShortcuts';

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsDialog({ isOpen, onClose }: ShortcutsDialogProps) {
  const formatShortcut = (shortcut: typeof defaultShortcuts[0]) => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key === 'Delete' ? 'Del' : shortcut.key === 'Escape' ? 'Esc' : shortcut.key.toUpperCase());
    return parts;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-surface-1 border border-border-custom rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-fill-accent text-on-accent">
                  <FiCommand className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-text-primary">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {defaultShortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    <span className="text-sm text-text-secondary">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {formatShortcut(shortcut).map((key, keyIdx) => (
                        <span key={keyIdx}>
                          <kbd className="px-2 py-1 text-[11px] font-mono font-medium bg-surface-2 border border-border-custom rounded text-text-primary shadow-xs">
                            {key}
                          </kbd>
                          {keyIdx < formatShortcut(shortcut).length - 1 && (
                            <span className="text-text-muted mx-0.5">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border-custom bg-surface-2/50">
              <p className="text-[11px] text-text-muted text-center">
                Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-1 border border-border-custom rounded">?</kbd> to toggle this dialog
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
