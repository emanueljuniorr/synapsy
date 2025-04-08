'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getRecentNotes } from '@/lib/firestore';
import { Note } from '@/types';
import { formatDate } from '@/lib/utils';

export default function RecentNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const recentNotes = await getRecentNotes(user.id, 5); // Busca as 5 notas mais recentes
        setNotes(recentNotes);
      } catch (error) {
        console.error('Erro ao buscar notas recentes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-foreground/60 mb-4">Nenhuma nota criada ainda</p>
        <Link 
          href="/notes/new" 
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
          Criar Nota
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <Link 
          key={note.id} 
          href={`/notes/${note.id}`}
          className="block p-4 rounded-lg bg-background/50 hover:bg-background/70 border border-white/5 hover:border-primary/30 transition-all"
        >
          <h3 className="font-medium mb-1 truncate">{note.title}</h3>
          <p className="text-sm text-foreground/60 truncate">{note.content}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-foreground/40">
              {formatDate(note.createdAt)}
            </span>
            {note.tags && note.tags.length > 0 && (
              <div className="flex gap-1">
                {note.tags.slice(0, 2).map((tag) => (
                  <span 
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
                {note.tags.length > 2 && (
                  <span className="text-xs text-foreground/40">
                    +{note.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
} 