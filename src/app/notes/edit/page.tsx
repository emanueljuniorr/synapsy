'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import SynapsyMarkdownEditor from '@/components/notes/MarkdownEditor';

interface NoteData {
  id?: string;
  title: string;
  content: string;
  tags: string[];
}

export default function EditNotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = searchParams.get('id');
  
  const [note, setNote] = useState<NoteData>({
    title: '',
    content: '',
    tags: [],
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isNewNote = !noteId;
  
  // Simula a busca de uma nota existente
  useEffect(() => {
    if (noteId) {
      setIsLoading(true);
      // Em uma implementação real, aqui buscaria a nota do Firestore
      // Simulando uma chamada com setTimeout
      setTimeout(() => {
        // Dados de exemplo
        const mockNote = {
          id: noteId,
          title: 'Exemplo de Nota',
          content: '# Título da Nota\n\nEste é um exemplo de conteúdo em **Markdown**.\n\n- Item 1\n- Item 2\n- Item 3\n\n> Uma citação interessante.\n\n```javascript\nconst hello = "world";\nconsole.log(hello);\n```',
          tags: ['exemplo', 'markdown'],
        };
        
        setNote(mockNote);
        setIsLoading(false);
      }, 500);
    }
  }, [noteId]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(prev => ({ ...prev, title: e.target.value }));
  };
  
  const handleContentChange = (markdown: string) => {
    setNote(prev => ({ ...prev, content: markdown }));
  };
  
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };
  
  const addTag = (tag: string) => {
    if (!tag) return;
    
    // Verifique se a tag já existe
    if (!note.tags.includes(tag)) {
      setNote(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
    
    setTagInput('');
  };
  
  const removeTag = (tagToRemove: string) => {
    setNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };
  
  const saveNote = async () => {
    if (!note.title.trim()) {
      alert('Por favor, adicione um título à sua nota.');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Em uma implementação real, aqui salvaria a nota no Firestore
      console.log('Salvando nota:', note);
      
      // Simular uma operação assíncrona
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirecionar para a página de notas
      router.push('/notes');
    } catch (error) {
      console.error('Erro ao salvar a nota:', error);
      alert('Erro ao salvar a nota. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4">
        {/* Header com gradiente e efeito de vidro */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl" />
          <div className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                {isNewNote ? 'Nova Nota' : 'Editar Nota'}
              </h1>
              <div className="flex gap-3">
                <button 
                  onClick={() => router.push('/notes')}
                  className="px-4 py-2 rounded-xl border border-white/10 text-foreground/70 hover:bg-white/5 transition-all duration-300"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveNote}
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed backdrop-blur-lg"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Nota'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Título */}
            <div className="bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <label htmlFor="title" className="block text-sm font-medium mb-2 text-foreground/70">
                Título
              </label>
              <input
                type="text"
                id="title"
                value={note.title}
                onChange={handleTitleChange}
                placeholder="Digite o título da nota..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-foreground/30 text-lg transition-all duration-300"
              />
            </div>
            
            {/* Tags */}
            <div className="bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <label htmlFor="tags" className="block text-sm font-medium mb-2 text-foreground/70">
                Tags
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Adicione tags (pressione Enter)..."
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder-foreground/30 transition-all duration-300"
                />
                <button
                  onClick={() => addTag(tagInput.trim())}
                  disabled={!tagInput.trim()}
                  className="px-4 py-3 bg-primary/80 hover:bg-primary text-white rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed backdrop-blur-lg whitespace-nowrap"
                >
                  Adicionar Tag
                </button>
              </div>
              
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {note.tags.map(tag => (
                    <div 
                      key={tag} 
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      <span className="text-sm">#{tag}</span>
                      <button 
                        onClick={() => removeTag(tag)}
                        className="text-primary hover:text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Editor Markdown */}
            <div className="bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <label className="block text-sm font-medium mb-2 text-foreground/70">
                Conteúdo
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-xl blur-3xl" />
                <div className="relative">
                  <SynapsyMarkdownEditor
                    initialValue={note.content}
                    onChange={handleContentChange}
                    height="600px"
                    placeholder="Comece a escrever... Use Markdown para formatar seu texto"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 