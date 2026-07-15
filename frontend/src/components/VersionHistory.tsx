'use client';

import { useEffect, useState } from 'react';
import { useNoteStore, NoteVersion } from '@/store/noteStore';
import { FiX, FiClock, FiRotateCcw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface VersionHistoryProps {
  noteId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function VersionHistory({ noteId, isOpen, onClose }: VersionHistoryProps) {
  const { noteVersions, fetchNoteVersions, restoreNoteVersion } = useNoteStore();
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && noteId) {
      fetchNoteVersions(noteId);
    }
  }, [isOpen, noteId, fetchNoteVersions]);

  const handleRestore = async (versionId: string) => {
    setRestoring(versionId);
    try {
      await restoreNoteVersion(noteId, Number(versionId));
    } catch (err) {
      // Error is handled by the store with toast
    } finally {
      setRestoring(null);
      onClose();
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-surface-1 border-l border-border-custom shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-fill-accent text-on-accent">
                  <FiClock className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-text-primary">Version History</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Versions List */}
            <div className="flex-1 overflow-y-auto p-4">
              {noteVersions.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <FiClock className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No versions yet</p>
                  <p className="text-xs mt-1">Versions are created when you save changes</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {noteVersions.map((version, idx) => (
                    <div
                      key={version.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border-custom hover:bg-surface-hover transition-colors"
                    >
                      <div className="shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-fill-accent text-on-accent flex items-center justify-center text-xs font-bold">
                          v{version.version}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate">
                          {version.title}
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          {formatDate(version.createdAt)}
                        </div>
                        <div className="text-xs text-text-secondary mt-1 line-clamp-2">
                          {version.content?.substring(0, 100) || 'No content'}...
                        </div>
                      </div>
                      {idx > 0 && (
                        <button
                          onClick={() => handleRestore(String(version.id))}
                          disabled={restoring === String(version.id)}
                          className="shrink-0 p-2 rounded-lg text-text-muted hover:text-fill-primary hover:bg-surface-2 transition-colors disabled:opacity-50"
                          title="Restore this version"
                        >
                          <FiRotateCcw className={`w-4 h-4 ${restoring === String(version.id) ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
