'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

interface CollabUser {
  userId: number;
  name: string;
  avatar: string | null;
}

interface CursorPosition {
  position: number;
  selection?: { start: number; end: number };
}

export const useCollaboration = (noteId: number | null) => {
  const { token } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<CollabUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteCursors, setRemoteCursors] = useState<Map<number, CursorPosition>>(new Map());
  const noteIdRef = useRef(noteId);
  noteIdRef.current = noteId;

  useEffect(() => {
    if (!noteId || !token) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (noteIdRef.current) {
        socket.emit('join-note', noteIdRef.current);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('reconnect', () => {
      if (noteIdRef.current) {
        socket.emit('join-note', noteIdRef.current);
      }
    });

    socket.on('current-users', (users: CollabUser[]) => {
      setConnectedUsers(users);
    });

    socket.on('user-joined', (user: CollabUser) => {
      setConnectedUsers((prev) => [...prev.filter((u) => u.userId !== user.userId), user]);
    });

    socket.on('user-left', (data: { userId: number }) => {
      setConnectedUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      setRemoteCursors((prev) => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
    });

    socket.on('cursor-moved', (data: CollabUser & CursorPosition) => {
      setRemoteCursors((prev) => {
        const next = new Map(prev);
        next.set(data.userId, {
          position: data.position,
          selection: data.selection,
        });
        return next;
      });
    });

    return () => {
      socket.emit('leave-note', noteId);
      socket.disconnect();
      socketRef.current = null;
      setConnectedUsers([]);
      setRemoteCursors(new Map());
    };
  }, [noteId, token]);

  const emitNoteUpdate = useCallback(
    (title: string, content: string) => {
      if (socketRef.current?.connected && noteIdRef.current) {
        socketRef.current.emit('note-update', { noteId: noteIdRef.current, title, content });
      }
    },
    []
  );

  const emitCursorMove = useCallback(
    (position: number, selection?: { start: number; end: number }) => {
      if (socketRef.current?.connected && noteIdRef.current) {
        socketRef.current.emit('cursor-move', { noteId: noteIdRef.current, position, selection });
      }
    },
    []
  );

  const emitTypingStart = useCallback(() => {
    if (socketRef.current?.connected && noteIdRef.current) {
      socketRef.current.emit('typing-start', noteIdRef.current);
    }
  }, []);

  const emitTypingStop = useCallback(() => {
    if (socketRef.current?.connected && noteIdRef.current) {
      socketRef.current.emit('typing-stop', noteIdRef.current);
    }
  }, []);

  return {
    isConnected,
    connectedUsers,
    remoteCursors,
    emitNoteUpdate,
    emitCursorMove,
    emitTypingStart,
    emitTypingStop,
  };
};
