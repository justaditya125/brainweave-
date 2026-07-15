'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const { user, updateProfile, error, loading, clearError } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMsg('');
    setValidationErrors({});

    const errors: Record<string, string> = {};
    if (!name) {
      errors.name = 'Name is required';
    }
    if (newPassword && !currentPassword) {
      errors.currentPassword = 'Current password is required to change password';
    }
    if (newPassword && newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const payload: any = { name, avatar: avatar || null };
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    const success = await updateProfile(payload);
    if (success) {
      setSuccessMsg('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    }
  };

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
            className="note-card note-card-lifted bg-surface-1 border-hairline w-full max-w-md p-6 relative flex flex-col"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors p-1"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-medium text-text-primary mb-6">User Profile Settings</h3>

            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border-hairline border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded text-small animate-fade-in">
                {successMsg}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-bg-danger border-hairline border-border-danger text-red-600 dark:text-red-400 rounded text-small animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-small font-medium text-text-secondary mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`form-input ${validationErrors.name ? 'form-input-error' : ''}`}
                />
                {validationErrors.name && (
                  <p className="text-caption text-red-500 mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-small font-medium text-text-secondary mb-1">Avatar Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="pt-2 border-hairline-t border-border-custom">
                <h4 className="text-small font-medium text-text-primary mb-3">Change Password (Optional)</h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-caption text-text-secondary mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`form-input ${validationErrors.currentPassword ? 'form-input-error' : ''}`}
                    />
                    {validationErrors.currentPassword && (
                      <p className="text-caption text-red-500 mt-1">{validationErrors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-caption text-text-secondary mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`form-input ${validationErrors.newPassword ? 'form-input-error' : ''}`}
                    />
                    {validationErrors.newPassword && (
                      <p className="text-caption text-red-500 mt-1">{validationErrors.newPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-hairline-t border-border-custom">
                <button type="button" onClick={onClose} className="btn-secondary py-1.5 px-4 text-small">
                  Close
                </button>
                <button type="submit" disabled={loading} className="btn-primary py-1.5 px-4 text-small">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
