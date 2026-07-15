'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiLink, FiArrowRight, FiArrowLeft, FiX, FiSearch, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface LinkedNote {
  id: number;
  title: string;
}

interface LinkedNotesProps {
  noteId: number;
  onNavigateToNote: (noteId: number) => void;
}

export default function LinkedNotes({ noteId, onNavigateToNote }: LinkedNotesProps) {
  const [outgoingLinks, setOutgoingLinks] = useState<LinkedNote[]>([]);
  const [incomingLinks, setIncomingLinks] = useState<LinkedNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LinkedNote[]>([]);

  const fetchLinks = useCallback(async () => {
    if (!noteId) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/links/${noteId}`);
      setOutgoingLinks(response.data.outgoing);
      setIncomingLinks(response.data.incoming);
    } catch (err) {
      console.error('Failed to fetch links', err);
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const searchForNotes = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await api.get(`/links/search?q=${encodeURIComponent(query)}&excludeId=${noteId}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Failed to search notes', err);
    }
  }, [noteId]);

  useEffect(() => {
    const timer = setTimeout(() => searchForNotes(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery, searchForNotes]);

  const addLink = async (targetNoteId: number) => {
    try {
      await api.post(`/links/${noteId}`, { targetNoteId });
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      fetchLinks();
    } catch (err) {
      console.error('Failed to create link', err);
    }
  };

  const removeLink = async (targetNoteId: number) => {
    try {
      await api.delete(`/links/${noteId}/${targetNoteId}`);
      fetchLinks();
    } catch (err) {
      console.error('Failed to remove link', err);
    }
  };

  const totalLinks = outgoingLinks.length + incomingLinks.length;

  return (
    <div className="border-t border-border-custom pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-text-muted">
          <FiLink className="w-4 h-4" />
          <span className="text-xs font-medium">
            Linked Notes
            {totalLinks > 0 && (
              <span className="ml-1 text-text-muted/60">({totalLinks})</span>
            )}
          </span>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-1 text-text-muted hover:text-fill-primary transition-colors"
          title="Link a note"
        >
          <FiPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="relative">
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes to link..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-2 border border-border-custom rounded-lg focus:outline-none focus:border-fill-primary"
                autoFocus
              />
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2 bg-surface-2 border border-border-custom rounded-lg max-h-40 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => addLink(result.id)}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-surface-1 transition-colors flex items-center justify-between group"
                  >
                    <span className="text-text-primary truncate">{result.title}</span>
                    <FiPlus className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-4 h-4 border-2 border-fill-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && totalLinks === 0 && (
        <p className="text-xs text-text-muted/60 py-2">
          No linked notes yet. Use [[note title]] in your note or click + to link.
        </p>
      )}

      {/* Outgoing Links */}
      {outgoingLinks.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <FiArrowRight className="w-3 h-3" /> Links to
          </p>
          <div className="space-y-1">
            {outgoingLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between group px-2 py-1 rounded hover:bg-surface-2 transition-colors"
              >
                <button
                  onClick={() => onNavigateToNote(link.id)}
                  className="text-xs text-fill-primary hover:underline truncate flex-1 text-left"
                >
                  {link.title}
                </button>
                <button
                  onClick={() => removeLink(link.id)}
                  className="p-0.5 text-text-muted opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  title="Remove link"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incoming Links */}
      {incomingLinks.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <FiArrowLeft className="w-3 h-3" /> Linked from
          </p>
          <div className="space-y-1">
            {incomingLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigateToNote(link.id)}
                className="w-full text-left px-2 py-1 text-xs text-fill-primary hover:underline truncate rounded hover:bg-surface-2 transition-colors"
              >
                {link.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
