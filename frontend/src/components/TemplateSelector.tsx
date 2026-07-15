'use client';

import { useState } from 'react';
import { noteTemplates, NoteTemplate } from '@/lib/templates';
import { FiFileText, FiX, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string, title?: string) => void;
}

export default function TemplateSelector({ isOpen, onClose, onSelect }: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const handleSelect = (template: NoteTemplate) => {
    const title = template.id === 'blank' ? 'Untitled Note' : template.name;
    onSelect(template.content, title);
    onClose();
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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-surface-1 border border-border-custom rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-fill-accent text-on-accent">
                  <FiFileText className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-text-primary">Choose a Template</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Templates Grid */}
            <div className="p-4 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {noteTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelect(template)}
                    onMouseEnter={() => setHoveredTemplate(template.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                    className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${
                      hoveredTemplate === template.id
                        ? 'bg-surface-2 border-border-strong shadow-sm'
                        : 'bg-surface-1 border-border-custom hover:bg-surface-hover'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-text-primary truncate">
                        {template.name}
                      </div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        {template.description}
                      </div>
                    </div>
                    <FiChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-colors ${
                      hoveredTemplate === template.id ? 'text-fill-primary' : 'text-text-muted'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
