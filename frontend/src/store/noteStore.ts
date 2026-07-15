import { create } from 'zustand';
import api from '@/lib/api';
import { useToastStore } from './toastStore';

export interface Category {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  userId: number;
  title: string;
  content: string;
  categoryId: number | null;
  boardColumnId: number | null;
  pinned: boolean;
  starred: boolean;
  archived: boolean;
  deletedAt: string | null;
  isPublic: boolean;
  shareToken: string | null;
  sortOrder: number;
  category: { id: number; name: string } | null;
  tags: Array<{ id: number; name: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalNotes: number;
  totalCategories: number;
  totalTags: number;
  recentNotes: Note[];
}

export interface NoteVersion {
  id: number;
  noteId: number;
  userId: number;
  title: string;
  content: string;
  version: number;
  createdAt: string;
}

interface NoteState {
  notes: Note[];
  archivedNotes: Note[];
  trashedNotes: Note[];
  categories: Category[];
  tags: Tag[];
  stats: DashboardStats | null;
  selectedNote: Note | null;
  loading: boolean;
  error: string | null;
  noteVersions: NoteVersion[];

  // Filters
  searchQuery: string;
  selectedCategoryId: number | null;
  selectedTagId: number | null;
  showStarredOnly: boolean;
  activeView: 'notes' | 'archived' | 'trashed';
  sortBy: 'date-desc' | 'date-asc' | 'alpha-asc' | 'alpha-desc';

  // Search
  searchResults: Note[];
  searchPagination: { page: number; limit: number; total: number; totalPages: number } | null;
  searchLoading: boolean;
  searchFilters: { category: string; tag: string; dateFrom: string; dateTo: string };

  // Setters
  setSearchQuery: (query: string) => void;
  setSelectedCategoryId: (id: number | null) => void;
  setSelectedTagId: (id: number | null) => void;
  setShowStarredOnly: (show: boolean) => void;
  setActiveView: (view: 'notes' | 'archived' | 'trashed') => void;
  setSortBy: (sort: 'date-desc' | 'date-asc' | 'alpha-asc' | 'alpha-desc') => void;
  selectNote: (note: Note | null) => void;
  setSearchFilters: (filters: Partial<{ category: string; tag: string; dateFrom: string; dateTo: string }>) => void;

  // Actions
  fetchNotes: () => Promise<void>;
  fetchArchivedNotes: () => Promise<void>;
  fetchTrashedNotes: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTags: () => Promise<void>;
  fetchStats: () => Promise<void>;
  searchNotes: (query: string, page?: number) => Promise<void>;
  fetchNextSearchPage: () => Promise<void>;
  
  // Note actions
  addNote: (noteData: { title: string; content?: string; categoryId?: number | null; tags?: string[]; pinned?: boolean; starred?: boolean; isPublic?: boolean }) => Promise<boolean>;
  updateNote: (id: number, noteData: { title?: string; content?: string; categoryId?: number | null; tags?: string[]; pinned?: boolean; starred?: boolean; isPublic?: boolean }) => Promise<boolean>;
  deleteNote: (id: number) => Promise<boolean>;
  restoreNote: (id: number) => Promise<boolean>;
  permanentDeleteNote: (id: number) => Promise<boolean>;
  emptyTrash: () => Promise<boolean>;
  toggleArchiveNote: (id: number) => Promise<boolean>;

  // Version actions
  fetchNoteVersions: (noteId: number) => Promise<void>;
  restoreNoteVersion: (noteId: number, versionId: number) => Promise<boolean>;

  // Reorder actions
  reorderNotes: (orderedIds: number[]) => Promise<boolean>;

  // Category actions
  addCategory: (name: string) => Promise<boolean>;
  renameCategory: (id: number, name: string) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;

  // Tag actions
  deleteTag: (id: number) => Promise<boolean>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  archivedNotes: [],
  trashedNotes: [],
  categories: [],
  tags: [],
  stats: null,
  selectedNote: null,
  loading: false,
  error: null,
  noteVersions: [],

  searchQuery: '',
  selectedCategoryId: null,
  selectedTagId: null,
  showStarredOnly: false,
  activeView: 'notes',
  sortBy: 'date-desc',
  searchResults: [],
  searchPagination: null,
  searchLoading: false,
  searchFilters: { category: 'all', tag: 'all', dateFrom: '', dateTo: '' },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
  setSelectedTagId: (selectedTagId) => set({ selectedTagId }),
  setShowStarredOnly: (showStarredOnly) => set({ showStarredOnly }),
  setActiveView: (activeView) => set({ activeView }),
  setSortBy: (sortBy) => set({ sortBy }),
  selectNote: (selectedNote) => set({ selectedNote }),
  setSearchFilters: (filters) => set((state) => ({ searchFilters: { ...state.searchFilters, ...filters } })),

  fetchNotes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/notes');
      set({ notes: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch notes', loading: false });
    }
  },

  fetchArchivedNotes: async () => {
    try {
      const response = await api.get('/notes/archived');
      set({ archivedNotes: response.data });
    } catch (err) {
      console.error('Failed to fetch archived notes', err);
    }
  },

  fetchTrashedNotes: async () => {
    try {
      const response = await api.get('/notes/trashed');
      set({ trashedNotes: response.data });
    } catch (err) {
      console.error('Failed to fetch trashed notes', err);
    }
  },

  fetchCategories: async () => {
    try {
      const response = await api.get('/categories');
      set({ categories: response.data });
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  },

  fetchTags: async () => {
    try {
      const response = await api.get('/tags');
      set({ tags: response.data });
    } catch (err) {
      console.error('Failed to fetch tags', err);
    }
  },

  fetchStats: async () => {
    try {
      const response = await api.get('/stats');
      set({ stats: response.data });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  },

  searchNotes: async (query, page = 1) => {
    if (!query || query.trim().length < 2) {
      set({ searchResults: [], searchPagination: null, searchLoading: false });
      return;
    }

    set({ searchLoading: true });
    try {
      const { searchFilters } = get();
      const params = new URLSearchParams({ q: query, page: page.toString(), limit: '50' });
      if (searchFilters.category !== 'all') params.append('category', searchFilters.category);
      if (searchFilters.tag !== 'all') params.append('tag', searchFilters.tag);
      if (searchFilters.dateFrom) params.append('dateFrom', searchFilters.dateFrom);
      if (searchFilters.dateTo) params.append('dateTo', searchFilters.dateTo);

      const response = await api.get(`/notes/search?${params.toString()}`);
      set({
        searchResults: response.data.notes,
        searchPagination: response.data.pagination,
        searchLoading: false,
      });
    } catch (err) {
      set({ searchLoading: false });
    }
  },

  fetchNextSearchPage: async () => {
    const { searchQuery, searchPagination, searchFilters, searchResults } = get();
    if (!searchPagination || searchPagination.page >= searchPagination.totalPages) return;

    const nextPage = searchPagination.page + 1;
    set({ searchLoading: true });
    try {
      const params = new URLSearchParams({ q: searchQuery, page: nextPage.toString(), limit: '50' });
      if (searchFilters.category !== 'all') params.append('category', searchFilters.category);
      if (searchFilters.tag !== 'all') params.append('tag', searchFilters.tag);
      if (searchFilters.dateFrom) params.append('dateFrom', searchFilters.dateFrom);
      if (searchFilters.dateTo) params.append('dateTo', searchFilters.dateTo);

      const response = await api.get(`/notes/search?${params.toString()}`);
      set({
        searchResults: [...searchResults, ...response.data.notes],
        searchPagination: response.data.pagination,
        searchLoading: false,
      });
    } catch (err) {
      set({ searchLoading: false });
    }
  },

  addNote: async (noteData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/notes', noteData);
      const newNote = response.data;
      set((state) => ({
        notes: [newNote, ...state.notes],
        selectedNote: newNote,
        loading: false
      }));
      get().fetchTags();
      get().fetchStats();
      useToastStore.getState().addToast('Note created', 'success');
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create note', loading: false });
      useToastStore.getState().addToast('Failed to create note', 'error');
      return false;
    }
  },

  updateNote: async (id, noteData) => {
    try {
      const response = await api.put(`/notes/${id}`, noteData);
      const updatedNote = response.data;
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
        selectedNote: state.selectedNote?.id === id ? updatedNote : state.selectedNote
      }));
      get().fetchTags();
      get().fetchStats();
      useToastStore.getState().addToast('Note saved', 'success');
      return true;
    } catch (err: any) {
      console.error('Failed to update note', err);
      useToastStore.getState().addToast('Failed to save note', 'error');
      return false;
    }
  },

  deleteNote: async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        selectedNote: state.selectedNote?.id === id ? null : state.selectedNote
      }));
      get().fetchTrashedNotes();
      get().fetchTags();
      get().fetchStats();
      useToastStore.getState().addToast('Note moved to trash', 'info');
      return true;
    } catch (err) {
      console.error('Failed to delete note', err);
      useToastStore.getState().addToast('Failed to delete note', 'error');
      return false;
    }
  },

  restoreNote: async (id) => {
    try {
      const response = await api.put(`/notes/${id}/restore`);
      set((state) => ({
        trashedNotes: state.trashedNotes.filter((n) => n.id !== id),
        notes: [response.data, ...state.notes]
      }));
      get().fetchTags();
      get().fetchStats();
      useToastStore.getState().addToast('Note restored', 'success');
      return true;
    } catch (err) {
      console.error('Failed to restore note', err);
      useToastStore.getState().addToast('Failed to restore note', 'error');
      return false;
    }
  },

  permanentDeleteNote: async (id) => {
    try {
      await api.delete(`/notes/${id}/permanent`);
      set((state) => ({
        trashedNotes: state.trashedNotes.filter((n) => n.id !== id)
      }));
      get().fetchTags();
      get().fetchStats();
      useToastStore.getState().addToast('Note permanently deleted', 'info');
      return true;
    } catch (err) {
      console.error('Failed to permanently delete note', err);
      useToastStore.getState().addToast('Failed to delete note', 'error');
      return false;
    }
  },

  emptyTrash: async () => {
    try {
      await api.delete('/notes/trash/empty');
      set({ trashedNotes: [] });
      get().fetchTags();
      get().fetchStats();
      useToastStore.getState().addToast('Trash emptied', 'info');
      return true;
    } catch (err) {
      console.error('Failed to empty trash', err);
      useToastStore.getState().addToast('Failed to empty trash', 'error');
      return false;
    }
  },

  toggleArchiveNote: async (id) => {
    // Optimistic update
    const prevNotes = get().notes;
    const prevArchived = get().archivedNotes;
    const noteToToggle = prevNotes.find((n) => n.id === id) || prevArchived.find((n) => n.id === id);
    
    if (noteToToggle) {
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        archivedNotes: state.archivedNotes.filter((n) => n.id !== id),
      }));
    }

    try {
      const response = await api.put(`/notes/${id}/archive`);
      const updatedNote = response.data;
      set((state) => ({
        notes: updatedNote.archived ? state.notes : [updatedNote, ...state.notes],
        archivedNotes: updatedNote.archived ? [updatedNote, ...state.archivedNotes] : state.archivedNotes,
        selectedNote: state.selectedNote?.id === id ? null : state.selectedNote
      }));
      get().fetchStats();
      useToastStore.getState().addToast(updatedNote.archived ? 'Note archived' : 'Note unarchived', 'info');
      return true;
    } catch (err) {
      // Rollback on failure
      if (noteToToggle) {
        set({ notes: prevNotes, archivedNotes: prevArchived });
      }
      console.error('Failed to toggle archive status', err);
      useToastStore.getState().addToast('Failed to archive note', 'error');
      return false;
    }
  },

  fetchNoteVersions: async (noteId) => {
    try {
      const response = await api.get(`/versions/${noteId}/versions`);
      set({ noteVersions: response.data });
    } catch (err) {
      console.error('Failed to fetch versions', err);
    }
  },

  restoreNoteVersion: async (noteId, versionId) => {
    try {
      const response = await api.put(`/versions/${noteId}/versions/${versionId}/restore`);
      const restoredNote = response.data;
      set((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? restoredNote : n)),
        selectedNote: state.selectedNote?.id === noteId ? restoredNote : state.selectedNote
      }));
      useToastStore.getState().addToast('Version restored', 'success');
      return true;
    } catch (err) {
      console.error('Failed to restore version', err);
      useToastStore.getState().addToast('Failed to restore version', 'error');
      return false;
    }
  },

  reorderNotes: async (orderedIds) => {
    try {
      await api.put('/notes/reorder/batch', { orderedIds });
      set((state) => {
        const reorderedNotes = orderedIds.map((id) => state.notes.find((n) => n.id === id)).filter(Boolean) as Note[];
        const remainingNotes = state.notes.filter((n) => !orderedIds.includes(n.id));
        return { notes: [...reorderedNotes, ...remainingNotes] };
      });
      return true;
    } catch (err) {
      console.error('Failed to reorder notes', err);
      useToastStore.getState().addToast('Failed to reorder notes', 'error');
      return false;
    }
  },

  addCategory: async (name) => {
    try {
      const response = await api.post('/categories', { name });
      const newCategory = response.data;
      set((state) => ({
        categories: [...state.categories, newCategory].sort((a, b) => a.name.localeCompare(b.name))
      }));
      get().fetchStats();
      useToastStore.getState().addToast('Category created', 'success');
      return true;
    } catch (err) {
      console.error('Failed to create category', err);
      useToastStore.getState().addToast('Failed to create category', 'error');
      return false;
    }
  },

  renameCategory: async (id, name) => {
    try {
      const response = await api.put(`/categories/${id}`, { name });
      const updatedCategory = response.data;
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? updatedCategory : c)).sort((a, b) => a.name.localeCompare(b.name)),
        notes: state.notes.map((n) => (n.categoryId === id ? { ...n, category: { id, name } } : n))
      }));
      useToastStore.getState().addToast('Category renamed', 'success');
      return true;
    } catch (err) {
      console.error('Failed to rename category', err);
      useToastStore.getState().addToast('Failed to rename category', 'error');
      return false;
    }
  },

  deleteCategory: async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        notes: state.notes.map((n) => (n.categoryId === id ? { ...n, categoryId: null, category: null } : n)),
        selectedNote: state.selectedNote?.categoryId === id ? { ...state.selectedNote, categoryId: null, category: null } : state.selectedNote,
        selectedCategoryId: state.selectedCategoryId === id ? null : state.selectedCategoryId
      }));
      get().fetchStats();
      useToastStore.getState().addToast('Category deleted', 'info');
      return true;
    } catch (err) {
      console.error('Failed to delete category', err);
      useToastStore.getState().addToast('Failed to delete category', 'error');
      return false;
    }
  },

  deleteTag: async (id) => {
    try {
      await api.delete(`/tags/${id}`);
      set((state) => ({
        tags: state.tags.filter((t) => t.id !== id),
        notes: state.notes.map((n) => ({
          ...n,
          tags: n.tags.filter((t) => t.id !== id)
        })),
        selectedNote: state.selectedNote
          ? { ...state.selectedNote, tags: state.selectedNote.tags.filter((t) => t.id !== id) }
          : null,
        selectedTagId: state.selectedTagId === id ? null : state.selectedTagId
      }));
      get().fetchStats();
      useToastStore.getState().addToast('Tag deleted', 'info');
      return true;
    } catch (err) {
      console.error('Failed to delete tag', err);
      useToastStore.getState().addToast('Failed to delete tag', 'error');
      return false;
    }
  }
}));
export default useNoteStore;
