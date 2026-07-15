'use client';

import { FiUser } from 'react-icons/fi';

interface CollabUser {
  userId: number;
  name: string;
  avatar: string | null;
}

interface CollaborationAvatarsProps {
  users: CollabUser[];
  isConnected: boolean;
}

export default function CollaborationAvatars({ users, isConnected }: CollaborationAvatarsProps) {
  if (!isConnected || users.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((user) => (
          <div
            key={user.userId}
            className="relative w-7 h-7 rounded-full border-2 border-surface-1 bg-fill-accent flex items-center justify-center"
            title={user.name}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-[10px] font-bold text-on-accent">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        ))}
        {users.length > 5 && (
          <div className="relative w-7 h-7 rounded-full border-2 border-surface-1 bg-surface-2 flex items-center justify-center">
            <span className="text-[9px] font-medium text-text-muted">+{users.length - 5}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 text-[10px] text-text-muted">
        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>{users.length} editing</span>
      </div>
    </div>
  );
}
