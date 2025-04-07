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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">
            {isNewNote ? 'Nova Nota' : 'Editar Nota'}
          </h1>
          <div className="flex gap-2">
            <button 
              onClick={() => router.push('/notes')}
              className="px-4 py-2 border border-neutral/30 text-foreground/70 rounded-lg hover:bg-neutral/10 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={saveNote}
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvando...' : 'Salvar Nota'}
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Título
              </label>
              <input
                type="text"
                id="title"
                value={note.title}
                onChange={handleTitleChange}
                placeholder="Digite o título da nota..."
                className="w-full px-4 py-2 border border-neutral/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-neutral"
              />
            </div>
            
            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-1">
                Tags
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Adicione tags (pressione Enter)..."
                  className="flex-1 px-4 py-2 border border-neutral/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-neutral"
                />
                <button
                  onClick={() => addTag(tagInput.trim())}
                  disabled={!tagInput.trim()}
                  className="ml-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Adicionar
                </button>
              </div>
              
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {note.tags.map(tag => (
                    <div 
                      key={tag} 
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary"
                    >
                      <span>#{tag}</span>
                      <button 
                        onClick={() => removeTag(tag)}
                        className="text-primary hover:text-red-500"
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
            <div>
              <label className="block text-sm font-medium mb-1">
                Conteúdo
              </label>
              <div className="border-0 rounded-lg overflow-hidden">
                <SynapsyMarkdownEditor
                  initialValue={note.content}
                  onChange={handleContentChange}
                  height="500px"
                />
              </div>
            </div>
            
            {/* Botões de ação (rodapé da página) */}
            <div className="flex justify-end gap-2 pt-4">
              <button 
                onClick={() => router.push('/notes')}
                className="px-4 py-2 border border-neutral/30 text-foreground/70 rounded-lg hover:bg-neutral/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={saveNote}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Salvando...' : 'Salvar Nota'}
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 