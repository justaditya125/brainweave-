'use client';

import { useToastStore } from '@/store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';

const icons = {
  success: <FiCheck className="w-4 h-4" />,
  error: <FiX className="w-4 h-4" />,
  warning: <FiAlertCircle className="w-4 h-4" />,
  info: <FiInfo className="w-4 h-4" />
};

const styles = {
  success: 'bg-green-500/10 border-green-500/30 text-green-500',
  error: 'bg-red-500/10 border-red-500/30 text-red-500',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-500'
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-md max-w-sm ${styles[toast.type]}`}
          >
            <span className="shrink-0">{icons[toast.type]}</span>
            <span className="text-sm font-medium text-text-primary">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-0.5 rounded hover:bg-surface-2 transition-colors ml-2"
            >
              <FiX className="w-3.5 h-3.5 text-text-muted" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
