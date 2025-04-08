'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getNoteById, updateNote, createNote } from '@/services/notes';
import { Note } from '@/types/notes';
import SynapsyMarkdownEditor from '@/components/notes/MarkdownEditor';
import { RiSaveLine, RiCloseLine } from 'react-icons/ri';

interface NoteEditorProps {
  id: string;
}

export default function NoteEditor({ id }: NoteEditorProps) {
  const router = useRouter();
  const isNew = id === 'new';
  const [note, setNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    tags: []
  });
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadNote();
    }
  }, [id, isNew]);

  async function loadNote() {
    try {
      const loadedNote = await getNoteById(id);
      if (loadedNote) {
        setNote(loadedNote);
      } else {
        router.push('/notes');
      }
    } catch (error) {
      console.error('Erro ao carregar nota:', error);
      router.push('/notes');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!note.title || !note.content) {
      alert('Por favor, preencha o título e o conteúdo da nota.');
      return;
    }

    setIsSaving(true);

    try {
      if (isNew) {
        await createNote({
          title: note.title,
          content: note.content,
          tags: note.tags || []
        });
      } else {
        await updateNote({
          id,
          title: note.title,
          content: note.content,
          tags: note.tags
        });
      }
      router.push('/notes');
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      alert('Erro ao salvar a nota. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10 shadow-lg transition-all duration-300 hover:bg-white/10">
        <div className="flex items-center justify-between mb-6">
          <input
            type="text"
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
            placeholder="Título da nota..."
            className="text-3xl font-bold bg-transparent border-none focus:outline-none text-white placeholder-white/40 w-full transition-all duration-300 hover:placeholder-white/60 focus:placeholder-white/60"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/notes')}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20"
            >
              <RiCloseLine size={20} className="transition-transform duration-300 group-hover:rotate-90" />
              <span>Cancelar</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/20"
            >
              <RiSaveLine size={20} className="transition-transform duration-300 group-hover:scale-110" />
              <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={note.tags?.join(', ') || ''}
            onChange={(e) => setNote({ 
              ...note, 
              tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
            })}
            placeholder="Tags (separadas por vírgula)..."
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-all duration-300 hover:bg-white/10 focus:bg-white/10 hover:placeholder-white/60 focus:placeholder-white/60"
          />
        </div>

        <div className="rounded-xl overflow-hidden border border-white/10 transition-all duration-300 hover:border-white/20">
          <SynapsyMarkdownEditor
            initialValue={note.content}
            onChange={(content) => setNote({ ...note, content })}
            placeholder="Comece a escrever sua nota..."
            height="calc(100vh - 280px)"
          />
        </div>
      </div>
    </div>
  );
} 