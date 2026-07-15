'use client';

import { useState } from 'react';
import { FiFilter, FiX, FiCalendar } from 'react-icons/fi';
import { useNoteStore } from '@/store/noteStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchFilters() {
  const { categories, tags, searchFilters, setSearchFilters, searchNotes, searchQuery } = useNoteStore();
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    searchFilters.category !== 'all' ||
    searchFilters.tag !== 'all' ||
    searchFilters.dateFrom !== '' ||
    searchFilters.dateTo !== '';

  const handleFilterChange = (key: string, value: string) => {
    setSearchFilters({ [key]: value });
    if (searchQuery.trim().length >= 2) {
      setTimeout(() => searchNotes(searchQuery), 0);
    }
  };

  const clearFilters = () => {
    setSearchFilters({ category: 'all', tag: 'all', dateFrom: '', dateTo: '' });
    if (searchQuery.trim().length >= 2) {
      setTimeout(() => searchNotes(searchQuery), 0);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
          hasActiveFilters
            ? 'bg-fill-primary text-white'
            : 'bg-surface-2 text-text-muted hover:text-text-primary border border-border-custom'
        }`}
        title="Search filters"
      >
        <FiFilter className="w-3.5 h-3.5" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="ml-1 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
            {[searchFilters.category !== 'all', searchFilters.tag !== 'all', searchFilters.dateFrom !== '', searchFilters.dateTo !== ''].filter(Boolean).length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 bg-surface-1 border border-border-custom rounded-xl shadow-xl z-50 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Search Filters</h3>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-text-muted hover:text-red-500 transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Category Filter */}
              <div>
                <label className="block text-xs text-text-muted mb-1">Category</label>
                <select
                  value={searchFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-surface-2 border border-border-custom rounded-lg text-text-primary focus:outline-none focus:border-fill-primary"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Filter */}
              <div>
                <label className="block text-xs text-text-muted mb-1">Tag</label>
                <select
                  value={searchFilters.tag}
                  onChange={(e) => handleFilterChange('tag', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-surface-2 border border-border-custom rounded-lg text-text-primary focus:outline-none focus:border-fill-primary"
                >
                  <option value="all">All Tags</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-xs text-text-muted mb-1">
                  <FiCalendar className="w-3 h-3 inline mr-1" />
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={searchFilters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="flex-1 px-2 py-1.5 text-xs bg-surface-2 border border-border-custom rounded-lg text-text-primary focus:outline-none focus:border-fill-primary"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={searchFilters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="flex-1 px-2 py-1.5 text-xs bg-surface-2 border border-border-custom rounded-lg text-text-primary focus:outline-none focus:border-fill-primary"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
