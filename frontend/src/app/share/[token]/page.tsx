'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { FiFolder, FiTag, FiClock, FiFileText, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { sanitizeHtml } from '@/lib/sanitize';

interface PublicNote {
  id: number;
  title: string;
  content: string;
  isPublic: boolean;
  category: { id: number; name: string } | null;
  tags: Array<{ id: number; name: string }>;
  createdAt: string;
  updatedAt: string;
}

export default function PublicSharePage() {
  const params = useParams();
  const token = params.token as string;

  const [note, setNote] = useState<PublicNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchPublicNote = async () => {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      try {
        setLoading(true);
        const response = await axios.get(`${apiBase}/notes/share/${token}`);
        setNote(response.data);
      } catch (err: any) {
        console.error('Failed to load shared note', err);
        setError(err.response?.data?.message || 'This note is not public or does not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicNote();
  }, [token]);

  const getHtmlContent = () => {
    if (!note) return { __html: '' };
    try {
      return { __html: sanitizeHtml(note.content || '') };
    } catch (e) {
      return { __html: sanitizeHtml(note.content || '') };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] text-[#f3f4f6] relative flex flex-col justify-center items-center font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-0" />
        <div className="z-10 flex flex-col items-center gap-3 animate-pulse-custom">
          <div className="w-10 h-10 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg">
            <FiFileText className="animate-bounce" />
          </div>
          <span className="text-xs text-gray-400 font-medium">Loading public workspace...</span>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-[#070b13] text-[#f3f4f6] relative flex flex-col justify-center items-center font-sans px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-0" />
        <div className="z-10 max-w-sm border border-white/[0.08] bg-[#0c121e]/50 p-8 rounded-xl backdrop-blur-md shadow-xl w-full">
          <div className="w-12 h-12 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xl mx-auto mb-4">
            <FiX />
          </div>
          <h2 className="text-lg font-semibold text-white font-medium">Access Denied</h2>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            {error || 'This note sharing link is invalid or has been disabled by the author.'}
          </p>
          <div className="mt-6">
            <Link href="/" className="btn-primary bg-blue-500 hover:bg-blue-600 text-white border-none py-2 px-5 text-xs rounded font-medium shadow-xs inline-block">
              Go to NotionNotes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-[#f3f4f6] relative flex flex-col selection:bg-blue-500/30 overflow-x-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/5 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-0" />

      {/* Header bar */}
      <header className="border-b border-white/[0.06] bg-[#070b13]/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white font-medium text-xs shadow-sm">
              N
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">NotionNotes</span>
          </Link>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded font-medium">
            Public Document
          </span>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-12 z-10 flex flex-col gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border border-white/[0.08] bg-[#0c121e]/30 backdrop-blur-md rounded-xl p-6 md:p-10 shadow-2xl flex flex-col gap-5"
        >
          {/* Metadata: Category, Date */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
            {note.category && (
              <span className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] px-2.5 py-1 rounded text-gray-300 font-medium">
                <FiFolder className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                <span>{note.category.name}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <FiClock className="w-3.5 h-3.5 shrink-0 text-gray-500" />
              <span>Published on {formatDate(note.createdAt)}</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white border-b border-white/[0.06] pb-4">
            {note.title}
          </h1>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-2">
              {note.tags.map((tag) => (
                <span key={tag.id} className="text-[10px] font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Parsed Markdown Body */}
          <div 
            className="markdown-preview text-gray-300 leading-relaxed pt-2"
            dangerouslySetInnerHTML={getHtmlContent()}
          />
        </motion.div>
      </main>

      {/* Mini Footer */}
      <footer className="py-8 px-6 text-center text-gray-500 text-xs border-t border-white/[0.06] bg-[#05080e] relative z-10">
        <p className="font-medium text-gray-500">© 2026 NotionNotes. Shared document space.</p>
        <p className="mt-1 text-[10px] text-gray-600">Create, organize, and share your own workspace notes at NotionNotes.</p>
      </footer>
    </div>
  );
}
