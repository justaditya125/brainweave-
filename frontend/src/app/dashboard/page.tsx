'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useNoteStore, Note } from '@/store/noteStore';
import Sidebar from '@/components/Sidebar';
import NoteCard from '@/components/NoteCard';
import NoteEditor from '@/components/NoteEditor';
import DeleteDialog from '@/components/DeleteDialog';
import ShortcutsDialog from '@/components/ShortcutsDialog';
import TemplateSelector from '@/components/TemplateSelector';
import SearchFilters from '@/components/SearchFilters';
import KanbanBoard from '@/components/KanbanBoard';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  FiMenu,
  FiPlus,
  FiSearch,
  FiX,
  FiFilter,
  FiFileText,
  FiLayers,
  FiGrid,
  FiLayout
} from 'react-icons/fi';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useThemeStore } from '@/store/themeStore';

export default function DashboardPage() {
  const router = useRouter();
  
  // Auth Store
  const { token, loading: authLoading } = useAuthStore();

  // Note Store
  const {
    notes,
    archivedNotes,
    trashedNotes,
    selectedNote,
    loading: notesLoading,
    searchQuery,
    selectedCategoryId,
    selectedTagId,
    showStarredOnly,
    activeView,
    sortBy,
    searchResults,
    searchPagination,
    searchLoading,
    setSearchQuery,
    setSelectedCategoryId,
    setSelectedTagId,
    setSortBy,
    selectNote,
    fetchNotes,
    fetchArchivedNotes,
    fetchTrashedNotes,
    addNote,
    deleteNote,
    updateNote,
    restoreNote,
    permanentDeleteNote,
    emptyTrash,
    toggleArchiveNote,
    searchNotes,
    fetchNextSearchPage
  } = useNoteStore();

  // Local UI States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [noteToDeleteId, setNoteToDeleteId] = useState<number | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<number>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toggleTheme } = useThemeStore();

  // 1. Enforce Route Protection
  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [token, authLoading, router]);

  // 2. Fetch Initial User Notes Data
  useEffect(() => {
    if (token) {
      fetchNotes();
      fetchArchivedNotes();
      fetchTrashedNotes();
    }
  }, [token, fetchNotes, fetchArchivedNotes, fetchTrashedNotes]);

  // 2b. Server-side search when query >= 2 chars
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchNotes(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchNotes]);

  // 3. Real-Time Search & Filtering Logic (runs in <10ms client-side)
  const filteredNotes = useMemo(() => {
    // Use server-side search results when available
    if (searchQuery.trim().length >= 2 && searchResults.length > 0) {
      return searchResults;
    }

    let result: Note[] = [];

    // Select the appropriate notes based on active view
    if (activeView === 'archived') {
      result = [...archivedNotes];
    } else if (activeView === 'trashed') {
      result = [...trashedNotes];
    } else {
      result = [...notes];
    }

    // Filter by Starred (only for main notes view)
    if (showStarredOnly && activeView === 'notes') {
      result = result.filter((n) => n.starred);
    }

    // Filter by Category
    if (selectedCategoryId !== null) {
      result = result.filter((n) => n.categoryId === selectedCategoryId);
    }

    // Filter by Tag
    if (selectedTagId !== null) {
      result = result.filter((n) => n.tags.some((t) => t.id === selectedTagId));
    }

    // Filter by Search Query (Title, Content, Category name, Tag names)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((n) => {
        const titleMatch = n.title?.toLowerCase().includes(q);
        const contentMatch = n.content?.toLowerCase().includes(q);
        const categoryMatch = n.category?.name?.toLowerCase().includes(q);
        const tagsMatch = n.tags?.some((t) => t.name.toLowerCase().includes(q));
        return titleMatch || contentMatch || categoryMatch || tagsMatch;
      });
    }

    // Apply Sorting
    result.sort((a, b) => {
      // Pinned notes are always forced to the top (already sorted by SQL, but let's maintain it)
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Starred notes come after pinned but before regular notes
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;

      if (sortBy === 'date-desc') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      if (sortBy === 'alpha-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'alpha-desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      return 0;
    });

    return result;
  }, [notes, archivedNotes, trashedNotes, selectedCategoryId, selectedTagId, showStarredOnly, activeView, searchQuery, sortBy, searchResults]);

  // 4. Create Note Action
  const handleCreateNote = async () => {
    const success = await addNote({
      title: 'Untitled Note',
      content: '',
      categoryId: selectedCategoryId, // Auto assign current filter category
      tags: selectedTagId ? [useNoteStore.getState().tags.find(t => t.id === selectedTagId)?.name || ''] : []
    });
    
    // On mobile, newly created note is selected and we automatically open the editor view
    setMobileSidebarOpen(false);
  };

  const handleCreateNoteFromTemplate = async (content: string, title?: string) => {
    const success = await addNote({
      title: title || 'Untitled Note',
      content,
      categoryId: selectedCategoryId,
      tags: selectedTagId ? [useNoteStore.getState().tags.find(t => t.id === selectedTagId)?.name || ''] : []
    });
    setMobileSidebarOpen(false);
  };

  // Batch Operations
  const toggleNoteSelection = (noteId: number) => {
    setSelectedNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  const selectAllNotes = () => {
    setSelectedNoteIds(new Set(filteredNotes.map((n) => n.id)));
  };

  const deselectAllNotes = () => {
    setSelectedNoteIds(new Set());
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedNoteIds(new Set());
  };

  const handleBatchDelete = async () => {
    for (const id of selectedNoteIds) {
      await deleteNote(id);
    }
    exitSelectMode();
  };

  const handleBatchArchive = async () => {
    for (const id of selectedNoteIds) {
      await toggleArchiveNote(id);
    }
    exitSelectMode();
  };

  const handleBatchStar = async () => {
    for (const id of selectedNoteIds) {
      const note = notes.find((n) => n.id === id);
      if (note) {
        await updateNote(id, { starred: !note.starred });
      }
    }
    exitSelectMode();
  };

  // 5. Delete Confirmations Handlers
  const openDeleteDialog = (noteId: number) => {
    setNoteToDeleteId(noteId);
  };

  const confirmDeleteNote = async () => {
    if (noteToDeleteId) {
      await deleteNote(noteToDeleteId);
      setNoteToDeleteId(null);
    }
  };

  const handleTogglePin = async (note: Note) => {
    await updateNote(note.id, { pinned: !note.pinned });
  };

  const handleToggleStar = async (note: Note) => {
    await updateNote(note.id, { starred: !note.starred });
  };

  const handleToggleArchive = async (note: Note) => {
    await toggleArchiveNote(note.id);
  };

  const handleRestore = async (note: Note) => {
    await restoreNote(note.id);
  };

  const handlePermanentDelete = async (note: Note) => {
    await permanentDeleteNote(note.id);
  };

  const handleEmptyTrash = async () => {
    await emptyTrash();
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      description: 'Create new note',
      action: handleCreateNote
    },
    {
      key: 's',
      ctrl: true,
      description: 'Save current note',
      action: () => {
        if (selectedNote) {
          window.dispatchEvent(new CustomEvent('save-note'));
        }
      }
    },
    {
      key: 'Delete',
      ctrl: true,
      description: 'Delete current note',
      action: () => {
        if (selectedNote) {
          openDeleteDialog(selectedNote.id);
        }
      }
    },
    {
      key: 'p',
      ctrl: true,
      description: 'Pin/Unpin note',
      action: () => {
        if (selectedNote) {
          handleTogglePin(selectedNote);
        }
      }
    },
    {
      key: 'd',
      ctrl: true,
      description: 'Toggle dark mode',
      action: toggleTheme
    },
    {
      key: '/',
      ctrl: true,
      description: 'Focus search',
      action: () => {
        searchInputRef.current?.focus();
      }
    },
    {
      key: 'Escape',
      description: 'Close editor / Deselect',
      action: () => {
        if (selectedNote) {
          selectNote(null);
        }
      }
    },
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: () => setShowShortcuts(true)
    }
  ]);

  // Framer Motion Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 100, damping: 16 } 
    }
  };

  // Prevent flash of dashboard on redirection
  if (authLoading || (!token && !authLoading)) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-fill-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-small text-text-secondary">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-surface-0 flex overflow-hidden relative">
      {/* Mesh glowing gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-blue-900/5 dark:bg-blue-950/20 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/5 dark:bg-indigo-950/20 blur-[150px] pointer-events-none z-0" />

      {/* 1. Sidebar Nav Area */}
      <Sidebar isOpenMobile={mobileSidebarOpen} setIsOpenMobile={setMobileSidebarOpen} />

      {/* 2. Main List Panel */}
      <main className="flex-1 flex flex-col min-w-0 border-r border-border-custom bg-surface-0 h-full relative overflow-hidden z-10">
        {/* Background Dot Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-0" />

        {/* Header Toolbar */}
        <header className="px-6 py-4 border-b border-border-custom bg-surface-0/60 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-text-muted hover:text-text-primary p-1.5 rounded hover:bg-surface-2"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold tracking-tight text-text-primary">
              {activeView === 'archived' ? 'Archived Notes' : activeView === 'trashed' ? 'Trashed Notes' : 'Workspace'}
            </h1>
            {isSelectMode && (
              <span className="text-xs text-text-muted bg-surface-2 px-2 py-1 rounded-full">
                {selectedNoteIds.size} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSelectMode ? (
              <>
                <button
                  onClick={selectAllNotes}
                  className="btn-ghost py-1.5 px-3 text-xs font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllNotes}
                  className="btn-ghost py-1.5 px-3 text-xs font-medium"
                >
                  Deselect All
                </button>
                {selectedNoteIds.size > 0 && (
                  <>
                    <button
                      onClick={handleBatchStar}
                      className="btn-ghost py-1.5 px-3 text-xs font-medium text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/20"
                    >
                      Toggle Star
                    </button>
                    <button
                      onClick={handleBatchArchive}
                      className="btn-ghost py-1.5 px-3 text-xs font-medium text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                    >
                      Archive
                    </button>
                    <button
                      onClick={handleBatchDelete}
                      className="btn-ghost py-1.5 px-3 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      Delete
                    </button>
                  </>
                )}
                <button
                  onClick={exitSelectMode}
                  className="btn-ghost py-1.5 px-3 text-xs font-medium"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {activeView === 'trashed' && trashedNotes.length > 0 && (
                  <button
                    onClick={handleEmptyTrash}
                    className="btn-ghost py-1.5 px-4 text-xs font-medium flex items-center gap-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    Empty Trash
                  </button>
                )}
                {activeView === 'notes' && (
                  <>
                    <button
                      onClick={() => setIsSelectMode(true)}
                      className="btn-ghost py-1.5 px-3 text-xs font-medium"
                    >
                      Select
                    </button>
                    <button onClick={() => setShowTemplates(true)} className="btn-primary py-1.5 px-4 text-xs font-medium flex items-center gap-1.5 shadow-xs">
                      <FiPlus className="w-4 h-4" /> New Note
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </header>

        {/* Search, Sorting & Filter Pill Area */}
        <div className="px-6 py-3 border-b border-border-custom flex flex-col gap-3 shrink-0 bg-surface-1/80 backdrop-blur-md z-10">
          {/* Search bar & Sort dropdown Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            {/* Search Input Box */}
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search notes, categories, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-9 pr-14 py-1.5 text-xs bg-surface-2 border-hairline focus:bg-surface-1 rounded transition-all w-full outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-text-muted hover:text-text-primary p-0.5"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex h-4 select-none items-center gap-0.5 rounded border border-border-custom bg-surface-1 px-1.5 font-mono text-[9px] font-medium text-text-muted">
                    <span>⌘</span>/
                  </kbd>
                )}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <SearchFilters />
              <div className="flex bg-surface-2 border border-border-custom rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-surface-1 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                  }`}
                  title="Grid view"
                >
                  <FiGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'kanban' ? 'bg-surface-1 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                  }`}
                  title="Board view"
                >
                  <FiLayout className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-text-muted">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="form-input text-xs py-1.5 px-2.5 bg-surface-2 border-hairline rounded cursor-pointer outline-none max-w-[140px]"
              >
                <option value="date-desc">Latest Updated</option>
                <option value="date-asc">Oldest Updated</option>
                <option value="alpha-asc">Title (A-Z)</option>
                <option value="alpha-desc">Title (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Active Filters Row (only renders when filter is applied) */}
          {(selectedCategoryId !== null || selectedTagId !== null) && (
            <div className="flex flex-wrap items-center gap-2 text-xs py-0.5 animate-fade-in">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                <FiFilter /> Active Filters:
              </span>
              
              {/* Category Pill */}
              {selectedCategoryId !== null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-fill-accent text-on-accent rounded font-medium border border-transparent">
                  Notebook: {useNoteStore.getState().categories.find(c => c.id === selectedCategoryId)?.name}
                  <button onClick={() => setSelectedCategoryId(null)} className="hover:bg-fill-primary/20 rounded p-0.5 transition-colors">
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Tag Pill */}
              {selectedTagId !== null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-fill-accent text-on-accent rounded font-medium border border-transparent">
                  Tag: #{useNoteStore.getState().tags.find(t => t.id === selectedTagId)?.name}
                  <button onClick={() => setSelectedTagId(null)} className="hover:bg-fill-primary/20 rounded p-0.5 transition-colors">
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content Area */}
        {viewMode === 'kanban' && activeView === 'notes' ? (
          <KanbanBoard
            onSelectNote={(note) => selectNote(note)}
            onDeleteRequest={(noteId) => setNoteToDeleteId(noteId)}
          />
        ) : (
        /* Scrollable Note Cards Grid */
        <div className="flex-1 overflow-y-auto p-6 bg-transparent z-10">
          {notesLoading ? (
            /* Loading Skeleton Placeholders */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="note-card border-hairline bg-surface-1 h-44 animate-pulse-custom flex flex-col justify-between p-5">
                  <div>
                    <div className="h-4 bg-surface-2 rounded-md w-3/4"></div>
                    <div className="space-y-2 mt-4">
                      <div className="h-3 bg-surface-2 rounded-md"></div>
                      <div className="h-3 bg-surface-2 rounded-md w-5/6"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-4 bg-surface-2 rounded-md w-16"></div>
                    <div className="h-4 bg-surface-2 rounded-md w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-text-muted">
                <div className="w-5 h-5 border-2 border-fill-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            </div>
          ) : filteredNotes.length === 0 ? (
            /* Empty state varies by active view */
            <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted">
              {activeView === 'archived' ? (
                <>
                  <FiFileText className="w-12 h-12 text-text-muted stroke-[1.2] mb-4" />
                  <h3 className="font-semibold text-text-primary text-base">No archived notes</h3>
                  <p className="text-small text-text-secondary mt-1 max-w-xs">
                    Notes you archive will appear here. Archive notes to keep your workspace tidy.
                  </p>
                </>
              ) : activeView === 'trashed' ? (
                <>
                  <FiFileText className="w-12 h-12 text-text-muted stroke-[1.2] mb-4" />
                  <h3 className="font-semibold text-text-primary text-base">Trash is empty</h3>
                  <p className="text-small text-text-secondary mt-1 max-w-xs">
                    Deleted notes will appear here for 30 days before being permanently removed.
                  </p>
                </>
              ) : searchQuery ? (
                <>
                  <FiFileText className="w-12 h-12 text-text-muted stroke-[1.2] mb-4" />
                  <h3 className="font-semibold text-text-primary text-base">No results for &ldquo;{searchQuery}&rdquo;</h3>
                  <p className="text-small text-text-secondary mt-1 max-w-xs">
                    Try different keywords or clear your search and filters.
                  </p>
                </>
              ) : (
                <>
                  <FiFileText className="w-12 h-12 text-text-muted stroke-[1.2] mb-4" />
                  <h3 className="font-semibold text-text-primary text-base">No notes found</h3>
                  <p className="text-small text-text-secondary mt-1 max-w-xs">
                    Try clearing active filters or search terms, or create a brand new note!
                  </p>
                  <button onClick={handleCreateNote} className="btn-secondary py-1.5 px-4 text-small mt-4">
                    Create First Note
                  </button>
                </>
              )}
            </div>
          ) : (
            /* Grid rendering with slide staggered load and fluid layout transitions */
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  variants={cardVariants}
                  layout
                  className="h-full"
                >
                  <NoteCard
                    note={note}
                    isSelected={selectedNote?.id === note.id}
                    isTrashed={activeView === 'trashed'}
                    isSelectMode={isSelectMode}
                    isSelectedForBatch={selectedNoteIds.has(note.id)}
                    onClick={() => {
                      if (isSelectMode) {
                        toggleNoteSelection(note.id);
                      } else {
                        selectNote(note);
                      }
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(note.id);
                    }}
                    onTogglePin={(e) => {
                      e.stopPropagation();
                      handleTogglePin(note);
                    }}
                    onToggleStar={(e) => {
                      e.stopPropagation();
                      handleToggleStar(note);
                    }}
                    onToggleArchive={(e) => {
                      e.stopPropagation();
                      handleToggleArchive(note);
                    }}
                    onRestore={(e) => {
                      e.stopPropagation();
                      handleRestore(note);
                    }}
                    onPermanentDelete={(e) => {
                      e.stopPropagation();
                      handlePermanentDelete(note);
                    }}
                    onSelectToggle={(e) => {
                      e.stopPropagation();
                      toggleNoteSelection(note.id);
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
          {/* Search pagination - Load More */}
          {searchPagination && searchPagination.page < searchPagination.totalPages && (
            <div className="flex flex-col items-center gap-2 py-6">
              <button
                onClick={fetchNextSearchPage}
                disabled={searchLoading}
                className="btn-secondary py-2 px-6 text-xs font-medium disabled:opacity-50"
              >
                {searchLoading ? 'Loading...' : 'Load More'}
              </button>
              <span className="text-[11px] text-text-muted">
                Showing {searchResults.length} of {searchPagination.total} results
              </span>
            </div>
          )}
        </div>
        )}
      </main>

      {/* 3. Right Note Editor Panel (Responsive Slide Sheet with AnimatePresence) */}
      <AnimatePresence>
        {selectedNote && (
          <motion.section
            initial={{ x: '100%', opacity: 0.95 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-30 w-full md:relative md:translate-x-0 md:w-[480px] lg:w-[540px] shrink-0 border-l border-border-custom bg-surface-1 h-full shadow-2xl md:shadow-none overflow-hidden"
          >
            <NoteEditor note={selectedNote} onDeleteRequest={openDeleteDialog} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Empty State Overlay for Desktop when no note is selected */}
      {!selectedNote && (
        <section className="hidden md:flex flex-col items-center justify-center h-full text-center text-text-muted p-8 select-none flex-grow bg-surface-1 border-l border-border-custom max-w-[480px] lg:max-w-[540px] w-full shrink-0">
          <FiLayers className="w-16 h-16 stroke-[1.1] text-text-muted mb-4" />
          <h3 className="text-base font-semibold text-text-primary">No note selected</h3>
          <p className="text-small text-text-secondary mt-2 max-w-xs leading-relaxed">
            Select a card from the grid to review or edit its contents. Or double click a card to pin it.
          </p>
        </section>
      )}

      {/* 4. Delete Confirmation Dialog overlay */}
      <DeleteDialog
        isOpen={noteToDeleteId !== null}
        title="Delete Note"
        message="Are you absolutely sure you want to delete this note? This action is permanent and cannot be undone."
        onConfirm={confirmDeleteNote}
        onCancel={() => setNoteToDeleteId(null)}
      />

      {/* 5. Keyboard Shortcuts Dialog */}
      <ShortcutsDialog
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* 6. Template Selector Dialog */}
      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleCreateNoteFromTemplate}
      />
    </div>
  );
}
