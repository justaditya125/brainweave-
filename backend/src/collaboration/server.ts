import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User, Note } from '../models';

interface UserPresence {
  userId: number;
  name: string;
  avatar: string | null;
  socketId: string;
  lastSeen: Date;
}

interface NoteRoom {
  noteId: number;
  users: Map<string, UserPresence>;
}

const noteRooms = new Map<number, NoteRoom>();
// Track which noteId each socket has joined
const socketRooms = new Map<string, Set<number>>();

export const setupCollaboration = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      if (!process.env.JWT_SECRET) {
        return next(new Error('Server configuration error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      (socket as any).userId = user.id;
      (socket as any).userName = user.name;
      (socket as any).userAvatar = user.avatar;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const userName = (socket as any).userName;
    const userAvatar = (socket as any).userAvatar;

    // Initialize socket room tracking
    socketRooms.set(socket.id, new Set());

    // Join a note room (with ownership check)
    socket.on('join-note', async (noteId: number) => {
      // Verify user has access to this note
      const note = await Note.findOne({
        where: { id: noteId, userId },
        attributes: ['id'],
      });

      if (!note) {
        socket.emit('error', { message: 'Note not found or access denied' });
        return;
      }

      socket.join(`note-${noteId}`);
      socketRooms.get(socket.id)?.add(noteId);

      if (!noteRooms.has(noteId)) {
        noteRooms.set(noteId, { noteId, users: new Map() });
      }

      const room = noteRooms.get(noteId)!;
      room.users.set(socket.id, {
        userId,
        name: userName,
        avatar: userAvatar,
        socketId: socket.id,
        lastSeen: new Date(),
      });

      // Notify others in the room
      socket.to(`note-${noteId}`).emit('user-joined', {
        userId,
        name: userName,
        avatar: userAvatar,
      });

      // Send current users to the joining user
      const currentUsers = Array.from(room.users.values()).filter(
        (u) => u.userId !== userId
      );
      socket.emit('current-users', currentUsers);
    });

    // Leave a note room
    socket.on('leave-note', (noteId: number) => {
      socket.leave(`note-${noteId}`);
      socketRooms.get(socket.id)?.delete(noteId);

      const room = noteRooms.get(noteId);
      if (room) {
        room.users.delete(socket.id);

        socket.to(`note-${noteId}`).emit('user-left', { userId });

        if (room.users.size === 0) {
          noteRooms.delete(noteId);
        }
      }
    });

    // Helper: verify socket is in the note room
    const isInRoom = (noteId: number): boolean => {
      return socketRooms.get(socket.id)?.has(noteId) ?? false;
    };

    // Note content update
    socket.on('note-update', (data: { noteId: number; title: string; content: string }) => {
      if (!isInRoom(data.noteId)) return;
      socket.to(`note-${data.noteId}`).emit('note-updated', {
        userId,
        name: userName,
        title: data.title,
        content: data.content,
        timestamp: new Date(),
      });
    });

    // Cursor position update
    socket.on('cursor-move', (data: { noteId: number; position: number; selection?: { start: number; end: number } }) => {
      if (!isInRoom(data.noteId)) return;
      socket.to(`note-${data.noteId}`).emit('cursor-moved', {
        userId,
        name: userName,
        avatar: userAvatar,
        position: data.position,
        selection: data.selection,
      });
    });

    // Typing indicator
    socket.on('typing-start', (noteId: number) => {
      if (!isInRoom(noteId)) return;
      socket.to(`note-${noteId}`).emit('user-typing', { userId, name: userName });
    });

    socket.on('typing-stop', (noteId: number) => {
      if (!isInRoom(noteId)) return;
      socket.to(`note-${noteId}`).emit('user-stopped-typing', { userId });
    });

    // Disconnect
    socket.on('disconnect', () => {
      // Remove user from all rooms
      for (const [noteId, room] of noteRooms.entries()) {
        if (room.users.has(socket.id)) {
          room.users.delete(socket.id);
          socket.to(`note-${noteId}`).emit('user-left', { userId });

          if (room.users.size === 0) {
            noteRooms.delete(noteId);
          }
        }
      }
      socketRooms.delete(socket.id);
    });
  });

  return io;
};
