'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types/notes';
import { getNotes, deleteNote } from '@/services/notes';
import NoteCard from '@/components/notes/NoteCard';
import { RiAddLine, RiSearchLine } from 'react-icons/ri';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const fetchedNotes = await getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteNote(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta nota?')) return;

    try {
      await deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
    }
  }

  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header com gradiente e efeito de vidro */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl" />
          <div className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Minhas Notas
              </h1>
              <Link
                href="/notes/new"
                className="flex items-center gap-2 px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl transition-all duration-300 backdrop-blur-lg"
              >
                <RiAddLine size={20} />
                <span>Nova Nota</span>
              </Link>
            </div>

            <div className="relative mt-6">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="text"
                placeholder="Buscar notas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={() => handleDeleteNote(note.id)}
              />
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl" />
            <div className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-white/60">
              <p className="text-xl mb-2">Nenhuma nota encontrada</p>
              <p className="text-sm">
                {searchQuery
                  ? 'Tente usar termos diferentes na busca'
                  : 'Comece criando uma nova nota'}
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 