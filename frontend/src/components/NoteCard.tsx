'use client';

import { Note } from '@/store/noteStore';
import { FiStar, FiTrash2, FiClock, FiArchive, FiRotateCcw, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import SpotlightCard from './SpotlightCard';

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  isTrashed?: boolean;
  isSelectMode?: boolean;
  isSelectedForBatch?: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onToggleStar: (e: React.MouseEvent) => void;
  onToggleArchive?: (e: React.MouseEvent) => void;
  onRestore?: (e: React.MouseEvent) => void;
  onPermanentDelete?: (e: React.MouseEvent) => void;
  onSelectToggle?: (e: React.MouseEvent) => void;
}

export default function NoteCard({
  note,
  isSelected,
  isTrashed = false,
  isSelectMode = false,
  isSelectedForBatch = false,
  onClick,
  onDelete,
  onTogglePin,
  onToggleStar,
  onToggleArchive,
  onRestore,
  onPermanentDelete,
  onSelectToggle
}: NoteCardProps) {
  const getContentPreview = (text: string) => {
    if (!text) {
      return 'No additional content';
    }
    const cleanText = text.replace(/<[^>]*>/g, '');
    return cleanText.length > 95 ? `${cleanText.substring(0, 95)}...` : cleanText;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <motion.article
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className="h-44"
      role="article"
    >
      <SpotlightCard
        spotlightColor="rgba(59, 130, 246, 0.08)"
        spotlightRadius={220}
        className={`group h-full w-full note-card border-hairline relative flex flex-col justify-between cursor-pointer select-none transition-colors duration-150 ${
          isSelected || isSelectedForBatch
            ? 'bg-surface-2 border-border-strong ring-1 ring-blue-500/25'
            : 'bg-surface-1 hover:bg-surface-hover'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-start gap-4">
              {isSelectMode && (
                <button
                  onClick={onSelectToggle}
                  className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelectedForBatch
                      ? 'bg-fill-primary border-fill-primary text-white'
                      : 'border-border-strong hover:border-fill-primary'
                  }`}
                >
                  {isSelectedForBatch && (
                    <FiCheck className="w-3 h-3" />
                  )}
                </button>
              )}
              <h3 className="font-semibold text-text-primary text-base line-clamp-1 truncate flex-grow leading-snug">
                {note.title || 'Untitled Note'}
              </h3>

              <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {isTrashed ? (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRestore?.(e); }}
                      className="p-1 rounded text-text-muted hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/25 transition-colors"
                      title="Restore Note"
                    >
                      <FiRotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onPermanentDelete?.(e); }}
                      className="p-1 rounded text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 transition-colors"
                      title="Permanently Delete"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleStar(e); }}
                      className={`p-1 rounded transition-colors hover:bg-surface-2 ${
                        note.starred ? 'text-yellow-500' : 'text-text-muted hover:text-yellow-500'
                      }`}
                      title={note.starred ? 'Unstar Note' : 'Star Note'}
                    >
                      <FiStar className={`w-3.5 h-3.5 ${note.starred ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onTogglePin(e); }}
                      className={`p-1 rounded transition-colors hover:bg-surface-2 ${
                        note.pinned ? 'text-on-accent' : 'text-text-muted hover:text-text-primary'
                      }`}
                      title={note.pinned ? 'Unpin Note' : 'Pin Note'}
                    >
                      <FiStar className={`w-3.5 h-3.5 ${note.pinned ? 'fill-current' : ''}`} />
                    </button>
                    {onToggleArchive && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleArchive(e); }}
                        className={`p-1 rounded transition-colors hover:bg-surface-2 ${
                          note.archived ? 'text-orange-500' : 'text-text-muted hover:text-orange-500'
                        }`}
                        title={note.archived ? 'Unarchive Note' : 'Archive Note'}
                      >
                        <FiArchive className={`w-3.5 h-3.5 ${note.archived ? 'fill-current' : ''}`} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                      className="p-1 rounded text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 transition-colors"
                      title="Move to Trash"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              {note.starred && (
                <div className="group-hover:hidden shrink-0 text-yellow-500" title="Starred Note">
                  <FiStar className="w-3.5 h-3.5 fill-current" />
                </div>
              )}

              {note.pinned && (
                <div className="group-hover:hidden shrink-0 text-on-accent" title="Pinned Note">
                  <FiStar className="w-3.5 h-3.5 fill-current" />
                </div>
              )}
            </div>

            <p className="text-small text-text-secondary mt-2 line-clamp-2 overflow-hidden leading-relaxed break-words">
              {getContentPreview(note.content)}
            </p>
          </div>

          <div className="mt-2">
            <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
              {note.category && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-fill-accent text-on-accent rounded shrink-0 truncate max-w-[90px]">
                  {note.category.name}
                </span>
              )}

              {note.tags.slice(0, 2).map((t) => (
                <span
                  key={t.id}
                  className="px-1.5 py-0.5 text-[10px] text-text-secondary bg-surface-2 border-hairline border-border-custom rounded shrink-0 truncate max-w-[80px]"
                >
                  #{t.name}
                </span>
              ))}

              {note.tags.length > 2 && (
                <span className="text-[9px] text-text-muted font-medium shrink-0">
                  +{note.tags.length - 2}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 mt-2.5 text-[10px] text-text-muted">
              <FiClock className="w-3 h-3 text-text-muted/70" />
              <span>Updated {formatDate(note.updatedAt)}</span>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.article>
  );
}
