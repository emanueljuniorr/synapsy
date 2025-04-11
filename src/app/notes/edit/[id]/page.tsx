"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getNoteById, updateNote } from '@/services/notes';
import { Note } from '@/types/notes';
import SynapsyMarkdownEditor from '@/components/notes/MarkdownEditor';
import { RiSaveLine, RiCloseLine } from 'react-icons/ri';
import MainLayout from '@/components/layout/MainLayout';

export default function EditNotePage({ params }: { params: any }) {
  const router = useRouter();
  const id = params.id;
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      getNoteById(id).then((fetchedNote) => {
        if (fetchedNote) {
          setNote(fetchedNote);
          setTitle(fetchedNote.title);
          setContent(fetchedNote.content || '');
          setTags(fetchedNote.tags || []);
          setIsLoading(false);
        } else {
          router.push('/notes');
        }
      }).catch(error => {
        console.error('Erro ao carregar nota:', error);
        router.push('/notes');
      });
    }
  }, [id, router]);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = async () => {
    if (!title || !content) {
      alert('Por favor, preencha o título e o conteúdo da nota.');
      return;
    }

    setIsSaving(true);

    try {
      await updateNote({ 
        id, 
        title, 
        content,
        tags 
      });
      router.push('/notes');
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      alert('Erro ao atualizar a nota. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10 shadow-lg transition-all duration-300 hover:bg-white/10">
          <div className="flex items-center justify-between mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  } else if (e.key === ',' || e.key === ' ') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Adicione tags (pressione Enter ou vírgula)..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-all duration-300 hover:bg-white/10 focus:bg-white/10 hover:placeholder-white/60 focus:placeholder-white/60"
              />
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="group flex items-center gap-1 px-2 py-1 text-sm rounded-lg bg-white/10 text-white/70 border border-white/10"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white/90"
                    >
                      <RiCloseLine size={16} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10 transition-all duration-300 hover:border-white/20">
            <SynapsyMarkdownEditor
              initialValue={content}
              onChange={(newContent) => setContent(newContent)}
              placeholder="Comece a escrever sua nota..."
              height="calc(100vh - 280px)"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 