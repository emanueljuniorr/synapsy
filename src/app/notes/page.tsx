'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types/notes';
import { getNotes, deleteNote } from '@/services/notes';
import NoteCard from '@/components/notes/NoteCard';
import { RiAddLine, RiSearchLine } from 'react-icons/ri';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';
import ConfirmationDialog from '@/components/ui/confirmationDialog';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  
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

  function handleDeleteNote(id: string) {
    setNoteToDelete(id);
    setIsDeleteDialogOpen(true);
  }

  async function confirmDeleteNote() {
    if (!noteToDelete) return;

    try {
      setIsDeleting(true);
      await deleteNote(noteToDelete);
      setNotes(notes.filter(note => note.id !== noteToDelete));
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  }

  function cancelDeleteNote() {
    setIsDeleteDialogOpen(false);
    setNoteToDelete(null);
  }

  const handleEditNote = (id: string) => {
    router.push(`/notes/edit/${id}`);
  };

  // Obter todas as categorias e tags para filtro
  const allTags = Array.from(new Set(notes.flatMap(note => 
    (note.categories || []).concat(note.tags || [])
  )));

  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase();
    // Combinar categorias e tags para pesquisa
    const noteTags = (note.categories || []).concat(note.tags || []);
    
    const matchesQuery =
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      noteTags.some(tag => tag.toLowerCase().includes(query));
    
    const matchesTag = selectedTag 
      ? noteTags.includes(selectedTag) 
      : true;
    
    return matchesQuery && matchesTag;
  });

  return (
    <MainLayout>
      <div className="mx-auto px-2 sm:px-4">
        {/* Seção de Tags */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4 overflow-x-auto pb-2 -mx-2 px-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs ${selectedTag === tag ? 'bg-primary text-white' : 'bg-white/10 text-white/70'} transition-colors whitespace-nowrap`}
            >
              {tag}
            </button>
          ))}
          {selectedTag && (
          <button 
              onClick={() => setSelectedTag(null)}
              className="px-2 sm:px-3 py-1 rounded-full text-xs bg-red-500 text-white transition-colors whitespace-nowrap"
          >
              Limpar Filtro
          </button>
          )}
        </div>
        
        {/* Header com gradiente e efeito de vidro */}
        <div className="relative mb-3 sm:mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl" />
          <div className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-6">
            <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Minhas Notas
              </h1>
              <Link
                href="/notes/new"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-primary/80 hover:bg-primary text-white rounded-xl transition-all duration-300 backdrop-blur-lg text-xs sm:text-base"
              >
                <RiAddLine size={16} className="sm:text-lg" />
                <span>Nova Nota</span>
              </Link>
              </div>

            <div className="relative mt-3 sm:mt-6">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                placeholder="Buscar notas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 text-sm"
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                id={note.id}
                title={note.title}
                content={note.content}
                tags={note.tags}
                createdAt={note.createdAt}
                updatedAt={note.updatedAt}
                onEdit={() => handleEditNote(note.id)}
                onDelete={() => handleDeleteNote(note.id)}
              />
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl" />
            <div className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-12 flex flex-col items-center justify-center text-white/60">
              <p className="text-lg sm:text-xl mb-2">Nenhuma nota encontrada</p>
              <p className="text-xs sm:text-sm">
                {searchQuery
                  ? 'Tente usar termos diferentes na busca'
                  : 'Comece criando uma nova nota'}
              </p>
            </div>
          </div>
        )}

        {/* Diálogo de confirmação para exclusão */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title="Excluir Nota"
          message="Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          isDestructive={true}
          isSubmitting={isDeleting}
          onConfirm={confirmDeleteNote}
          onCancel={cancelDeleteNote}
        />
      </div>
    </MainLayout>
  );
} 