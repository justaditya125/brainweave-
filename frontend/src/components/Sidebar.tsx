'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNoteStore } from '@/store/noteStore';
import { useThemeStore } from '@/store/themeStore';
import ProfileDialog from './ProfileDialog';
import DeleteDialog from './DeleteDialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dashboard,
  Folder,
  Tag,
  Settings as SettingsIcon,
  Logout,
  ChevronDown as ChevronDownIcon,
  ChevronRight,
  ChevronLeft,
  AddLarge,
  TrashCan,
  ChartLine,
  User as UserIcon,
  Sun,
  Moon,
  Notification,
  Search as SearchIcon,
  Star,
  Archive,
  Edit
} from '@carbon/icons-react';
import ShinyText from './ShinyText';

// Softer spring animation curve
const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

interface SidebarProps {
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export default function Sidebar({ isOpenMobile, setIsOpenMobile }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const {
    categories,
    tags,
    stats,
    selectedCategoryId,
    selectedTagId,
    showStarredOnly,
    activeView,
    archivedNotes,
    trashedNotes,
    setSelectedCategoryId,
    setSelectedTagId,
    setShowStarredOnly,
    setActiveView,
    addCategory,
    renameCategory,
    deleteCategory,
    deleteTag,
    fetchCategories,
    fetchTags,
    fetchStats,
    searchQuery,
    setSearchQuery
  } = useNoteStore();

  const [activeSection, setActiveSection] = useState<'dashboard' | 'notebooks' | 'tags' | 'settings'>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'tag'; id: number; name: string } | null>(null);
  const editingInputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useThemeStore();

  // Load categories, tags, stats on mount
  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchStats();
  }, [fetchCategories, fetchTags, fetchStats]);

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      return;
    }
    const success = await addCategory(newCatName.trim());
    if (success) {
      setNewCatName('');
      setShowAddCat(false);
    }
  };

  const handleStartRenameCategory = (cat: { id: number; name: string }) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
    setTimeout(() => editingInputRef.current?.focus(), 0);
  };

  const handleRenameCategorySubmit = async () => {
    if (!editingCategoryId || !editingCategoryName.trim()) {
      setEditingCategoryId(null);
      return;
    }
    if (editingCategoryName.trim() !== categories.find((c) => c.id === editingCategoryId)?.name) {
      await renameCategory(editingCategoryId, editingCategoryName.trim());
    }
    setEditingCategoryId(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'category') {
      deleteCategory(deleteTarget.id);
    } else {
      deleteTag(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  /* ---------------------------- Left Icon Nav Rail -------------------------- */
  const IconNavigation = () => (
    <aside className="bg-surface-1 flex flex-col gap-2 items-center p-4 w-16 h-full border-r border-border-custom shrink-0">
      {/* Brand logo icon */}
      <div className="mb-4 size-10 flex items-center justify-center shrink-0">
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm select-none">
          N
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-2.5 w-full items-center">
        <button
          type="button"
          onClick={() => { setActiveSection('dashboard'); setIsCollapsed(false); }}
          className={`flex items-center justify-center rounded-lg size-10 transition-colors duration-300 ${
            activeSection === 'dashboard' ? 'bg-surface-2 text-fill-primary' : 'hover:bg-surface-hover text-text-secondary'
          }`}
          title="Dashboard"
        >
          <Dashboard size={18} />
        </button>

        <button
          type="button"
          onClick={() => { setActiveSection('notebooks'); setIsCollapsed(false); }}
          className={`flex items-center justify-center rounded-lg size-10 transition-colors duration-300 ${
            activeSection === 'notebooks' ? 'bg-surface-2 text-fill-primary' : 'hover:bg-surface-hover text-text-secondary'
          }`}
          title="Notebooks"
        >
          <Folder size={18} />
        </button>

        <button
          type="button"
          onClick={() => { setActiveSection('tags'); setIsCollapsed(false); }}
          className={`flex items-center justify-center rounded-lg size-10 transition-colors duration-300 ${
            activeSection === 'tags' ? 'bg-surface-2 text-fill-primary' : 'hover:bg-surface-hover text-text-secondary'
          }`}
          title="Tags"
        >
          <Tag size={18} />
        </button>

        <button
          type="button"
          onClick={() => { setActiveView('archived'); setActiveSection('dashboard'); setIsCollapsed(false); }}
          className={`flex items-center justify-center rounded-lg size-10 transition-colors duration-300 ${
            activeView === 'archived' ? 'bg-surface-2 text-orange-500' : 'hover:bg-surface-hover text-text-secondary'
          }`}
          title="Archived Notes"
        >
          <Archive size={18} />
        </button>

        <button
          type="button"
          onClick={() => { setActiveView('trashed'); setActiveSection('dashboard'); setIsCollapsed(false); }}
          className={`flex items-center justify-center rounded-lg size-10 transition-colors duration-300 ${
            activeView === 'trashed' ? 'bg-surface-2 text-red-500' : 'hover:bg-surface-hover text-text-secondary'
          }`}
          title="Trashed Notes"
        >
          <TrashCan size={18} />
        </button>

        <button
          type="button"
          onClick={() => { setActiveSection('settings'); setIsCollapsed(false); }}
          className={`flex items-center justify-center rounded-lg size-10 transition-colors duration-300 ${
            activeSection === 'settings' ? 'bg-surface-2 text-fill-primary' : 'hover:bg-surface-hover text-text-secondary'
          }`}
          title="Settings"
        >
          <SettingsIcon size={18} />
        </button>

        <div className="w-8 h-[1px] bg-border-custom my-1" />

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center rounded-lg size-10 hover:bg-surface-hover text-text-secondary transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      <div className="flex-1" />

      {/* Bottom Profile and Sign Out */}
      <div className="flex flex-col gap-3 w-full items-center shrink-0">
        <button
          onClick={logout}
          className="flex items-center justify-center rounded-lg size-10 hover:bg-red-50 dark:hover:bg-red-950/20 text-text-muted hover:text-red-500 transition-colors"
          title="Sign Out"
        >
          <Logout size={18} />
        </button>

        <button
          onClick={() => setIsProfileOpen(true)}
          className="relative rounded-full shrink-0 size-8 bg-surface-2 border border-border-custom cursor-pointer focus:outline-none"
          title="Profile Settings"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="flex items-center justify-center size-full text-xs font-semibold text-text-primary">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </button>
      </div>
    </aside>
  );

  /* ------------------------------ Detail Sidebar ----------------------------- */
  const DetailSidebar = () => {
    const renderContent = () => {
      switch (activeSection) {
        case 'dashboard':
          return (
            <div className="flex flex-col gap-4 w-full">
              {/* Stats card */}
              {activeView === 'notes' && stats && (
                <div className="p-4 bg-surface-2 border-hairline border-border-custom rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600/10 text-blue-500 shrink-0">
                    <ChartLine size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] leading-none text-text-muted uppercase tracking-wider font-semibold">Total Notes</div>
                    <div className="font-semibold text-text-primary mt-1 text-base leading-none">
                      {stats.totalNotes || 0}
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'archived' && (
                <div className="p-4 bg-surface-2 border-hairline border-border-custom rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 shrink-0">
                    <Archive size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] leading-none text-text-muted uppercase tracking-wider font-semibold">Archived</div>
                    <div className="font-semibold text-text-primary mt-1 text-base leading-none">
                      {archivedNotes.length}
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'trashed' && (
                <div className="p-4 bg-surface-2 border-hairline border-border-custom rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500 shrink-0">
                    <TrashCan size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] leading-none text-text-muted uppercase tracking-wider font-semibold">Trashed</div>
                    <div className="font-semibold text-text-primary mt-1 text-base leading-none">
                      {trashedNotes.length}
                    </div>
                  </div>
                </div>
              )}

              {/* Fast filters - only show for main notes view */}
              {activeView === 'notes' && (
                <div className="flex flex-col gap-1 w-full">
                  <span className="px-2 mb-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Fast Access</span>
                  <button
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setSelectedTagId(null);
                      setShowStarredOnly(false);
                      setActiveView('notes');
                      setIsOpenMobile(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                      selectedCategoryId === null && selectedTagId === null && !showStarredOnly && activeView === 'notes'
                        ? 'bg-surface-2 text-fill-primary font-medium'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    <Folder size={14} />
                    <span>All Workspace Notes</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setSelectedTagId(null);
                      setShowStarredOnly(true);
                      setActiveView('notes');
                      setIsOpenMobile(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                      showStarredOnly && activeView === 'notes'
                        ? 'bg-surface-2 text-yellow-500 font-medium'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    <Star size={14} className={showStarredOnly ? 'fill-current' : ''} />
                    <span>Starred Notes</span>
                  </button>
                </div>
              )}

              {/* Back to notes button for archived/trashed views */}
              {activeView !== 'notes' && (
                <div className="flex flex-col gap-1 w-full">
                  <button
                    onClick={() => {
                      setActiveView('notes');
                      setIsOpenMobile(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
                  >
                    <Folder size={14} />
                    <span>Back to Notes</span>
                  </button>
                </div>
              )}
            </div>
          );

        case 'notebooks':
          return (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between px-2">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Notebooks</span>
                <button
                  onClick={() => setShowAddCat(!showAddCat)}
                  className="text-text-muted hover:text-text-primary hover:bg-surface-2 p-1 rounded transition-colors"
                  title="Add Notebook"
                >
                  <AddLarge size={14} />
                </button>
              </div>

              {showAddCat && (
                <form onSubmit={handleAddCategorySubmit} className="px-2 animate-slide-up">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Press enter to save..."
                    className="form-input text-xs py-1.5 px-2 bg-surface-2 border-hairline focus:bg-surface-1 rounded w-full outline-none"
                    autoFocus
                  />
                </form>
              )}

              <ul className="flex flex-col gap-0.5 w-full">
                <li>
                  <button
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setIsOpenMobile(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                      selectedCategoryId === null
                        ? 'bg-surface-2 text-fill-primary font-medium'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    <Folder size={14} />
                    <span>All Notebooks</span>
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id} className="group relative">
                    {editingCategoryId === cat.id ? (
                      <input
                        ref={editingInputRef}
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        onBlur={handleRenameCategorySubmit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameCategorySubmit();
                          if (e.key === 'Escape') setEditingCategoryId(null);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-xs bg-surface-2 border border-fill-primary outline-none text-text-primary"
                      />
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedCategoryId(cat.id);
                            setIsOpenMobile(false);
                          }}
                          onDoubleClick={() => handleStartRenameCategory(cat)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                            selectedCategoryId === cat.id
                              ? 'bg-surface-2 text-fill-primary font-medium'
                              : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                          }`}
                        >
                          <Folder size={14} />
                          <span className="truncate pr-6">{cat.name}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartRenameCategory(cat);
                          }}
                          className="absolute right-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-text-muted hover:text-fill-primary transition-all p-1"
                          title="Rename Notebook"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({ type: 'category', id: cat.id, name: cat.name });
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all p-1"
                          title="Delete Notebook"
                        >
                          <TrashCan size={14} />
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );

        case 'tags':
          return (
            <div className="flex flex-col gap-3 w-full">
              <span className="px-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Tags</span>
              <ul className="flex flex-col gap-0.5 w-full">
                <li>
                  <button
                    onClick={() => {
                      setSelectedTagId(null);
                      setIsOpenMobile(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                      selectedTagId === null
                        ? 'bg-surface-2 text-fill-primary font-medium'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    <Tag size={14} />
                    <span>All Tags</span>
                  </button>
                </li>
                {tags.map((tag) => (
                  <li key={tag.id} className="group relative">
                    <button
                      onClick={() => {
                        setSelectedTagId(tag.id);
                        setIsOpenMobile(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                        selectedTagId === tag.id
                          ? 'bg-surface-2 text-fill-primary font-medium'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      }`}
                    >
                      <Tag size={14} />
                      <span className="truncate pr-6">#{tag.name}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ type: 'tag', id: tag.id, name: tag.name });
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all p-1"
                      title="Delete Tag"
                    >
                      <TrashCan size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );

        case 'settings':
          return (
            <div className="flex flex-col gap-3 w-full">
              <span className="px-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Workspace Preferences</span>
              <div className="flex flex-col gap-1 w-full">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-lg transition-colors text-left"
                >
                  <UserIcon size={14} />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-lg transition-colors text-left"
                >
                  {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                  <span>{theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</span>
                </button>
              </div>
            </div>
          );
      }
    };

    const sectionTitles = {
      dashboard: activeView === 'archived' ? 'Archived Notes' : activeView === 'trashed' ? 'Trashed Notes' : 'Dashboard Overview',
      notebooks: "Notebook Folders",
      tags: "Tag Identifiers",
      settings: "User Preferences"
    };

    if (isCollapsed) {
      return null;
    }

    return (
      <div className="w-60 h-full flex flex-col gap-4 p-4 border-r border-border-custom bg-surface-1 select-none">
        {/* Shimmering Logo Header */}
        <div className="flex items-center gap-2 px-1 py-0.5 shrink-0">
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white font-semibold text-[10px] shadow-sm select-none">
            N
          </div>
          <ShinyText text="NotionNotes" speed={6} className="font-semibold text-xs tracking-tight text-text-primary" />
        </div>

        {/* Section title & Collapse trigger */}
        <div className="flex items-center justify-between shrink-0">
          <span className="font-semibold text-sm text-text-primary truncate">{sectionTitles[activeSection]}</span>
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="flex items-center justify-center rounded-lg size-7 hover:bg-surface-hover text-text-secondary shrink-0"
            aria-label="Collapse sidebar"
          >
            <ChevronDownIcon size={16} className="-rotate-90" />
          </button>
        </div>

        {/* Search input in sidebar */}
        <div className="relative shrink-0 w-full">
          <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search filters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-2 border-hairline rounded pl-8 pr-3 py-1 text-xs text-text-primary placeholder:text-text-muted outline-none"
          />
        </div>

        {/* Scrollable list items section */}
        <div className="flex-1 overflow-y-auto w-full">
          {renderContent()}
        </div>

        {/* User Info footer info */}
        <div className="pt-2 border-t border-border-custom shrink-0">
          <div className="flex items-center gap-2 px-1 py-1">
            <div className="relative rounded-full shrink-0 size-7 bg-surface-2">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="flex items-center justify-center size-full text-[10px] font-semibold text-text-primary">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="truncate min-w-0">
              <span className="block text-[11px] font-semibold text-text-primary truncate leading-tight">{user?.name || 'User Name'}</span>
              <span className="block text-[9px] text-text-secondary truncate leading-none mt-0.5">{user?.email || 'user@example.com'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-row h-full">
      <IconNavigation />
      <DetailSidebar />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar wrapper */}
      <aside className="hidden md:block h-full shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay using Framer Motion spring slides */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenMobile(false)}
              className="fixed inset-0 z-50 md:hidden bg-black/45 backdrop-blur-xs"
            />
            {/* Drawer panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed top-0 bottom-0 left-0 z-55 shadow-2xl h-full flex flex-row"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      <ProfileDialog isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <DeleteDialog
        isOpen={deleteTarget !== null}
        title={`Delete ${deleteTarget?.type === 'category' ? 'Notebook' : 'Tag'}`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? ${deleteTarget?.type === 'category' ? 'Notes in this notebook will become uncategorized.' : 'The tag will be removed from all notes.'}`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
