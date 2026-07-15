'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiPlus, FiX, FiMoreVertical } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useNoteStore, Note } from '@/store/noteStore';
import NoteCard from './NoteCard';

interface BoardColumnData {
  id: number;
  name: string;
  position: number;
}

interface KanbanBoardProps {
  onSelectNote: (note: Note) => void;
  onDeleteRequest: (noteId: number) => void;
}

function SortableColumn({
  column,
  notes,
  onAddNote,
  onSelectNote,
  onDeleteRequest,
  onDeleteColumn,
}: {
  column: BoardColumnData;
  notes: Note[];
  onAddNote: (columnId: number) => void;
  onSelectNote: (note: Note) => void;
  onDeleteRequest: (noteId: number) => void;
  onDeleteColumn: (columnId: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `column-${column.id}`,
    data: { type: 'column', column },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col bg-surface-2/50 rounded-xl border border-border-custom min-w-[280px] max-w-[320px] h-full"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-custom">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="text-text-muted hover:text-text-primary cursor-grab"
          >
            <FiMoreVertical className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-semibold text-text-primary">{column.name}</h3>
          <span className="text-xs text-text-muted bg-surface-1 px-1.5 py-0.5 rounded">
            {notes.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddNote(column.id)}
            className="p-1 text-text-muted hover:text-fill-primary transition-colors"
            title="Add note"
          >
            <FiPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="p-1 text-text-muted hover:text-red-500 transition-colors"
            title="Delete column"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 min-h-[100px]">
        <SortableContext items={notes.map((n) => `note-${n.id}`)} strategy={verticalListSortingStrategy}>
          {notes.map((note) => (
            <KanbanCard
              key={note.id}
              note={note}
              onSelect={() => onSelectNote(note)}
              onDelete={() => onDeleteRequest(note.id)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function KanbanCard({
  note,
  onSelect,
  onDelete,
}: {
  note: Note;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `note-${note.id}`,
    data: { type: 'note', note },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      className="bg-surface-1 border border-border-custom rounded-lg p-3 cursor-pointer hover:border-fill-primary/50 transition-colors group"
    >
      <div className="flex items-start justify-between">
        <h4 className="text-xs font-medium text-text-primary line-clamp-2 flex-1">{note.title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-0.5 text-text-muted opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
        >
          <FiX className="w-3 h-3" />
        </button>
      </div>
      {note.content && (
        <p className="text-[11px] text-text-muted mt-1 line-clamp-2">{note.content.slice(0, 80)}</p>
      )}
      <div className="flex items-center gap-1 mt-2">
        {note.category && (
          <span className="text-[9px] px-1.5 py-0.5 bg-fill-accent/10 text-fill-accent rounded">
            {note.category.name}
          </span>
        )}
        {note.tags.slice(0, 2).map((tag) => (
          <span key={tag.id} className="text-[9px] px-1.5 py-0.5 bg-surface-2 text-text-muted rounded">
            #{tag.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard({ onSelectNote, onDeleteRequest }: KanbanBoardProps) {
  const [columns, setColumns] = useState<BoardColumnData[]>([]);
  const [boardNotes, setBoardNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [showNewColumnInput, setShowNewColumnInput] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const fetchBoard = useCallback(async () => {
    try {
      const [colsRes, notesRes] = await Promise.all([
        api.get('/board/columns'),
        api.get('/board/notes'),
      ]);
      setColumns(colsRes.data);
      setBoardNotes(notesRes.data);
    } catch (err) {
      console.error('Failed to fetch board', err);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const getNotesForColumn = (columnId: number) =>
    boardNotes.filter((n) => n.boardColumnId === columnId).sort((a, b) => a.sortOrder - b.sortOrder);

  const getUnassignedNotes = () =>
    boardNotes.filter((n) => !n.boardColumnId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'note') {
      const noteId = parseInt(active.id.toString().replace('note-', ''), 10);
      let targetColumnId: number | null = null;
      let targetPosition = 0;

      if (overData?.type === 'column') {
        targetColumnId = overData.column.id;
        // Position at end of column
        const colNotes = boardNotes.filter((n) => n.boardColumnId === targetColumnId && n.id !== noteId);
        targetPosition = colNotes.length;
      } else if (overData?.type === 'note') {
        const targetNote = boardNotes.find((n) => n.id === parseInt(over.id.toString().replace('note-', ''), 10));
        if (targetNote) {
          targetColumnId = targetNote.boardColumnId;
          targetPosition = targetNote.sortOrder;
        }
      }

      if (targetColumnId === null && activeData?.note?.boardColumnId === null) return;

      try {
        await api.put(`/board/notes/${noteId}/move`, {
          columnId: targetColumnId,
          position: targetPosition,
        });

        setBoardNotes((prev) =>
          prev.map((n) =>
            n.id === noteId ? { ...n, boardColumnId: targetColumnId ?? n.boardColumnId, sortOrder: targetPosition } : n
          )
        );
      } catch (err) {
        console.error('Failed to move note', err);
      }
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;

    try {
      const response = await api.post('/board/columns', { name: newColumnName.trim() });
      setColumns((prev) => [...prev, response.data]);
      setNewColumnName('');
      setShowNewColumnInput(false);
    } catch (err) {
      console.error('Failed to create column', err);
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    try {
      await api.delete(`/board/columns/${columnId}`);
      setColumns((prev) => prev.filter((c) => c.id !== columnId));
      setBoardNotes((prev) =>
        prev.map((n) => (n.boardColumnId === columnId ? { ...n, boardColumnId: null } : n))
      );
    } catch (err) {
      console.error('Failed to delete column', err);
    }
  };

  const handleAddNote = async (columnId: number) => {
    try {
      const response = await api.post('/notes', {
        title: 'Untitled Note',
        content: '',
      });
      const newNote = { ...response.data, boardColumnId: columnId };
      await api.put(`/board/notes/${response.data.id}/move`, { columnId, position: 0 });
      setBoardNotes((prev) => [newNote, ...prev]);
      onSelectNote(newNote);
    } catch (err) {
      console.error('Failed to create note', err);
    }
  };

  const unassignedNotes = getUnassignedNotes();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border-custom bg-surface-1/80 backdrop-blur-md">
        <h2 className="text-sm font-semibold text-text-primary">Board View</h2>
        <div className="flex items-center gap-2">
          {showNewColumnInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                placeholder="Column name..."
                className="px-3 py-1 text-xs bg-surface-2 border border-border-custom rounded-lg focus:outline-none focus:border-fill-primary"
                autoFocus
              />
              <button
                onClick={handleAddColumn}
                className="px-3 py-1 text-xs bg-fill-primary text-white rounded-lg hover:bg-fill-primary/90"
              >
                Add
              </button>
              <button
                onClick={() => { setShowNewColumnInput(false); setNewColumnName(''); }}
                className="p-1 text-text-muted hover:text-text-primary"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewColumnInput(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface-2 text-text-muted hover:text-text-primary border border-border-custom rounded-lg transition-colors"
            >
              <FiPlus className="w-3.5 h-3.5" />
              Add Column
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            {/* Unassigned column */}
            {unassignedNotes.length > 0 && (
              <div className="flex flex-col bg-surface-2/30 rounded-xl border border-dashed border-border-custom min-w-[280px] h-full">
                <div className="px-4 py-3 border-b border-border-custom">
                  <h3 className="text-xs font-medium text-text-muted">Unassigned</h3>
                </div>
                <div className="flex-1 p-3 overflow-y-auto space-y-2">
                  <SortableContext items={unassignedNotes.map((n) => `note-${n.id}`)} strategy={verticalListSortingStrategy}>
                    {unassignedNotes.map((note) => (
                      <KanbanCard
                        key={note.id}
                        note={note}
                        onSelect={() => onSelectNote(note)}
                        onDelete={() => onDeleteRequest(note.id)}
                      />
                    ))}
                  </SortableContext>
                </div>
              </div>
            )}

            {/* Board columns */}
            <SortableContext items={columns.map((c) => `column-${c.id}`)} strategy={verticalListSortingStrategy}>
              {columns.map((column) => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  notes={getNotesForColumn(column.id)}
                  onAddNote={handleAddNote}
                  onSelectNote={onSelectNote}
                  onDeleteRequest={onDeleteRequest}
                  onDeleteColumn={handleDeleteColumn}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
