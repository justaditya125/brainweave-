'use client';

import { FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}

export default function DeleteDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete'
}: DeleteDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.25 }}
            className="note-card note-card-lifted bg-surface-1 border-hairline w-full max-w-md p-6 flex flex-col gap-4"
          >
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <FiAlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary">{title}</h3>
                <p className="text-small text-text-secondary mt-1">{message}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button onClick={onCancel} className="btn-secondary py-1.5 px-4 text-small">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="btn-primary bg-red-600 hover:bg-red-700 text-white border-none py-1.5 px-4 text-small"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
