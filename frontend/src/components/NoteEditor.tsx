'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNoteStore, Note } from '@/store/noteStore';
import { FiX, FiStar, FiTrash2, FiFolder, FiShare2, FiEdit3, FiEye, FiCopy, FiCheck, FiDownload, FiColumns, FiBold, FiItalic, FiList, FiLink, FiCode, FiMessageSquare, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { exportNoteAsMarkdown, exportNoteAsText, exportNoteAsHtml, exportNoteAsPdf } from '@/lib/export';
import { sanitizeHtml } from '@/lib/sanitize';
import VersionHistory from './VersionHistory';
import LinkedNotes from './LinkedNotes';
import CollaborationAvatars from './CollaborationAvatars';
import { useCollaboration } from '@/hooks/useCollaboration';

interface NoteEditorProps {
  note: Note;
  onDeleteRequest: (noteId: number) => void;
}

export default function NoteEditor({ note, onDeleteRequest }: NoteEditorProps) {
  const { categories, updateNote, selectNote } = useNoteStore();

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [categoryId, setCategoryId] = useState<number | null>(note.categoryId);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(note.tags.map((t) => t.name));
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Markdown Tab State
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [splitView, setSplitView] = useState(false);

  // Sharing States
  const [isPublic, setIsPublic] = useState(note.isPublic);
  const [copied, setCopied] = useState(false);

  // Export States
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Collaboration
  const {
    isConnected,
    connectedUsers,
    remoteCursors,
    emitNoteUpdate,
    emitCursorMove,
    emitTypingStart,
    emitTypingStop,
  } = useCollaboration(note.id);

  // Sync state when note selection changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setCategoryId(note.categoryId);
    setTags(note.tags.map((t) => t.name));
    setTagInput('');
    setSaveSuccess(false);
    setIsPublic(note.isPublic);
    setActiveTab('write');
    setCopied(false);
  }, [note]);

  // Emit collaboration updates (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      emitNoteUpdate(title, content);
    }, 500);
    return () => clearTimeout(timer);
  }, [title, content, emitNoteUpdate]);

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    const noteData = {
      title: title.trim() || 'Untitled Note',
      content: content,
      categoryId: categoryId,
      tags: tags,
      pinned: note.pinned,
      isPublic: isPublic
    };

    const success = await updateNote(note.id, noteData);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
    setIsSaving(false);
  };

  // Toggle Pinned
  const handleTogglePin = async () => {
    await updateNote(note.id, { pinned: !note.pinned });
  };

  // Toggle Sharing
  const handleToggleShare = async () => {
    const nextShare = !isPublic;
    setIsPublic(nextShare);
    await updateNote(note.id, { isPublic: nextShare });
  };

  // Dynamic share URL generation based on browser host
  const getShareUrl = (token: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/share/${token}`;
    }
    return `http://localhost:3000/share/${token}`;
  };

  const handleCopyLink = () => {
    if (note.shareToken) {
      navigator.clipboard.writeText(getShareUrl(note.shareToken));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Tag Helpers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  // Markdown Formatting Helpers
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const formatBold = () => insertMarkdown('**', '**');
  const formatItalic = () => insertMarkdown('*', '*');
  const formatCode = () => insertMarkdown('`', '`');
  const formatLink = () => insertMarkdown('[', '](url)');
  const formatList = () => insertMarkdown('\n- ');
  const formatQuote = () => insertMarkdown('\n> ');
  const formatHeading = () => insertMarkdown('\n## ');

  // Parse Markdown to HTML
  const getHtmlContent = () => {
    try {
      return { __html: sanitizeHtml(content || '') };
    } catch (e) {
      return { __html: sanitizeHtml(content || '') };
    }
  };

  return (
    <motion.div
      key={note.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, type: 'spring', stiffness: 200, damping: 22 }}
      className="flex flex-col h-full bg-surface-1 select-none selection:bg-fill-primary/20"
    >
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
        <div className="flex items-center gap-3">
          <button
            onClick={() => selectNote(null)}
            className="md:hidden text-text-muted hover:text-text-primary p-1"
            title="Back to list"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Collaboration Avatars */}
          <CollaborationAvatars users={connectedUsers} isConnected={isConnected} />
          
          {/* Segmented Write/Preview Tab Control */}
          <div className="flex bg-surface-2 rounded-lg p-0.5 border border-border-custom gap-0.5">
            <button
              onClick={() => { setActiveTab('write'); setSplitView(false); }}
              className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${
                activeTab === 'write' && !splitView
                  ? 'bg-surface-1 text-text-primary shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <FiEdit3 className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              onClick={() => { setActiveTab('preview'); setSplitView(false); }}
              className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${
                activeTab === 'preview' && !splitView
                  ? 'bg-surface-1 text-text-primary shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <FiEye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setSplitView(!splitView)}
              className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${
                splitView
                  ? 'bg-surface-1 text-text-primary shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Split view"
            >
              <FiColumns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Saved Status Notification */}
          {saveSuccess && (
            <span className="text-xs text-green-500 mr-2 animate-fade-in font-medium">
              Changes Saved
            </span>
          )}

          {/* Toggle Pin */}
          <button
            onClick={handleTogglePin}
            className={`p-2 rounded-lg hover:bg-surface-2 transition-colors ${
              note.pinned ? 'text-on-accent' : 'text-text-muted hover:text-text-primary'
            }`}
            title={note.pinned ? 'Unpin note' : 'Pin note'}
          >
            <FiStar className={`w-4 h-4 ${note.pinned ? 'fill-current' : ''}`} />
          </button>

          {/* Delete Note */}
          <button
            onClick={() => onDeleteRequest(note.id)}
            className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            title="Delete note"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>

          {/* Version History */}
          <button
            onClick={() => setShowVersionHistory(true)}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
            title="Version history"
          >
            <FiClock className="w-4 h-4" />
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              title="Export note"
            >
              <FiDownload className="w-4 h-4" />
            </button>
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 bg-surface-1 border border-border-custom rounded-lg shadow-lg py-1 min-w-[160px] animate-slide-up">
                  <button
                    onClick={() => {
                      exportNoteAsMarkdown(note);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left text-text-secondary hover:bg-surface-hover hover:text-text-primary flex items-center gap-2 transition-colors"
                  >
                    <span className="font-mono text-[10px] bg-surface-2 px-1.5 py-0.5 rounded">.md</span>
                    Export as Markdown
                  </button>
                  <button
                    onClick={() => {
                      exportNoteAsText(note);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left text-text-secondary hover:bg-surface-hover hover:text-text-primary flex items-center gap-2 transition-colors"
                  >
                    <span className="font-mono text-[10px] bg-surface-2 px-1.5 py-0.5 rounded">.txt</span>
                    Export as Text
                  </button>
                  <button
                    onClick={() => {
                      exportNoteAsHtml(note);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left text-text-secondary hover:bg-surface-hover hover:text-text-primary flex items-center gap-2 transition-colors"
                  >
                    <span className="font-mono text-[10px] bg-surface-2 px-1.5 py-0.5 rounded">.html</span>
                    Export as HTML
                  </button>
                  <div className="border-t border-border-custom my-1" />
                  <button
                    onClick={() => {
                      exportNoteAsPdf(note);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left text-text-secondary hover:bg-surface-hover hover:text-text-primary flex items-center gap-2 transition-colors"
                  >
                    <span className="font-mono text-[10px] bg-surface-2 px-1.5 py-0.5 rounded">.pdf</span>
                    Export as PDF
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Close Editor (Desktop) */}
          <button
            onClick={() => selectNote(null)}
            className="hidden md:block p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
            title="Close editor"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Body Area */}
      <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6 flex flex-col">
        {/* Notebook & Category Dropdown */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <FiFolder className="w-4 h-4 shrink-0" />
            <span>Notebook:</span>
          </div>
          <select
            value={categoryId || ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
            className="form-input text-xs py-1.5 px-2.5 max-w-[200px] border border-border-custom bg-surface-2 rounded outline-none"
          >
            <option value="">Uncategorized</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title Input */}
        <div>
          <input
            type="text"
            placeholder="Untitled Note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={activeTab === 'preview'}
            className="w-full bg-transparent border-none focus:outline-none text-2xl md:text-3xl font-medium tracking-tight text-text-primary placeholder-text-muted"
          />
        </div>

        {/* Tag Manager block */}
        <div className="flex flex-wrap items-center gap-2 py-2 border-t border-border-custom">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs bg-fill-accent text-on-accent rounded-full border border-transparent font-medium animate-slide-up"
            >
              #{tag}
              {activeTab === 'write' && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(idx)}
                  className="hover:bg-fill-primary/20 rounded-full p-0.5"
                >
                  <FiX className="w-2.5 h-2.5" />
                </button>
              )}
            </span>
          ))}
          {activeTab === 'write' && (
            <div className="relative inline-flex items-center">
              <span className="absolute left-2.5 text-text-muted text-xs">#</span>
              <input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="form-input text-xs py-1 pl-5 pr-2.5 w-24 bg-surface-2 border border-border-custom rounded-full focus:w-36 focus:bg-surface-1 outline-none transition-all"
              />
            </div>
          )}
        </div>

        {/* Public Sharing Control widget bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 border-t border-border-custom">
          <div className="flex items-center gap-2.5">
            <FiShare2 className="w-4 h-4 text-text-secondary" />
            <span className="text-xs font-medium text-text-secondary">Public sharing:</span>
            <button
              onClick={handleToggleShare}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPublic ? 'bg-blue-500' : 'bg-surface-2 border-border-custom'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isPublic ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {isPublic && note.shareToken && (
            <div className="flex items-center gap-2 flex-grow max-w-md animate-slide-up">
              <input
                type="text"
                readOnly
                value={getShareUrl(note.shareToken)}
                className="form-input text-[11px] font-mono py-1 px-2.5 bg-surface-2 border border-border-custom rounded w-full text-text-secondary select-all outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="btn-secondary py-1 px-3 text-[11px] bg-surface-1 border border-border-custom rounded shrink-0 flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <FiCheck className="w-3 h-3 text-green-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <FiCopy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Linked Notes */}
        <LinkedNotes
          noteId={note.id}
          onNavigateToNote={(id) => {
            const targetNote = useNoteStore.getState().notes.find((n) => n.id === id);
            if (targetNote) selectNote(targetNote);
          }}
        />

        {/* Content Input / Compiled Markdown Render area */}
        <div className="pt-2 border-t border-border-custom flex-grow flex flex-col">
          {/* Markdown Formatting Toolbar */}
          {!splitView && activeTab === 'write' && (
            <div className="flex items-center gap-1 pb-2 flex-wrap">
              <button
                onClick={formatHeading}
                className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                title="Heading"
              >
                <span className="text-xs font-bold">H</span>
              </button>
              <button
                onClick={formatBold}
                className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                title="Bold"
              >
                <FiBold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={formatItalic}
                className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                title="Italic"
              >
                <FiItalic className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-border-custom mx-1" />
              <button
                onClick={formatList}
                className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                title="List"
              >
                <FiList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={formatQuote}
                className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                title="Quote"
              >
                <FiMessageSquare className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={formatCode}
                className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                title="Code"
              >
                <FiCode className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-border-custom mx-1" />
              <button
                onClick={formatLink}
                className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                title="Link"
              >
                <FiLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {splitView ? (
            <div className="flex gap-4 flex-grow min-h-[350px]">
              <textarea
                ref={textareaRef}
                placeholder="Start writing in markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-1/2 bg-transparent border border-border-custom rounded-lg p-3 focus:outline-none resize-none text-base text-text-primary leading-relaxed placeholder-text-muted"
              />
              <div 
                className="w-1/2 overflow-y-auto markdown-preview text-text-primary border border-border-custom rounded-lg p-3"
                dangerouslySetInnerHTML={getHtmlContent()}
              />
            </div>
          ) : activeTab === 'write' ? (
            <textarea
              ref={textareaRef}
              placeholder="Start writing in markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-grow min-h-[350px] bg-transparent border-none focus:outline-none resize-none text-base text-text-primary leading-relaxed placeholder-text-muted"
            />
          ) : (
            <div 
              className="w-full flex-grow overflow-y-auto markdown-preview text-text-primary min-h-[350px]"
              dangerouslySetInnerHTML={getHtmlContent()}
            />
          )}
        </div>
      </div>

      {/* Editor footer with stats and Save button */}
      <div className="px-6 py-3 border-t border-border-custom flex items-center justify-between bg-surface-1">
        <div className="flex items-center gap-4 text-[11px] text-text-muted">
          <span>{(content || '').split(/\s+/).filter(Boolean).length} words</span>
          <span>{(content || '').length} chars</span>
          <span>{Math.max(1, Math.ceil((content || '').split(/\s+/).filter(Boolean).length / 200))} min read</span>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2 py-2 px-6 shadow-xs rounded font-medium text-xs text-white"
        >
          {isSaving ? 'Saving...' : 'Save Note'}
        </button>
      </div>

      {/* Version History Drawer */}
      <VersionHistory
        noteId={note.id}
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
      />
    </motion.div>
  );
}
