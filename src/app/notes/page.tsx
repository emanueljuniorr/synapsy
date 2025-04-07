'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import NoteCard from '@/components/notes/NoteCard';
import { useRouter } from 'next/navigation';

interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export default function NotesPage() {
  // Dados de exemplo para o MVP
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Recursos do Synapsy',
      content: 'O Synapsy deve incluir:\n- Gerenciamento de tarefas\n- Sistema de anotações com Markdown\n- Calendário integrado\n- Módulo de estudos\n- Sistema de tags e categorização\n\nPrecisamos analisar a melhor forma de implementar a conexão entre notas para criar um sistema de conhecimento interligado.',
      tags: ['planejamento', 'desenvolvimento', 'mvp'],
      createdAt: new Date(2023, 8, 15),
      updatedAt: new Date(2023, 8, 20),
    },
    {
      id: '2',
      title: 'Referência de Markdown',
      content: '# Título 1\n## Título 2\n### Título 3\n\n**Negrito** ou __Negrito__\n*Itálico* ou _Itálico_\n\n- Lista item 1\n- Lista item 2\n\n1. Lista numerada 1\n2. Lista numerada 2\n\n`código inline`\n\n```\nBloco de código\n```\n\n> Citação\n\n[Link](https://example.com)\n\n![Imagem](https://example.com/image.jpg)',
      tags: ['markdown', 'referência'],
      createdAt: new Date(2023, 8, 16),
      updatedAt: new Date(2023, 8, 16),
    },
    {
      id: '3',
      title: 'Ideias para módulo de estudos',
      content: 'Funcionalidades para o módulo de estudos:\n- Criação de flashcards\n- Sistema de repetição espaçada\n- Progresso de memorização\n- Organização por matérias e tópicos\n- Cronogramas de estudo\n- Integração com o calendário e tarefas',
      tags: ['estudos', 'ideias', 'flashcards'],
      createdAt: new Date(2023, 8, 17),
      updatedAt: new Date(2023, 8, 18),
    },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Extrair todas as tags únicas
  const allTags = [...new Set(notes.flatMap(note => note.tags || []))];
  
  const router = useRouter();
  
  // Funções para gerenciar notas
  const handleEdit = (id: string) => {
    router.push(`/notes/edit?id=${id}`);
  };
  
  const handleDelete = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };
  
  const createNewNote = () => {
    router.push('/notes/edit');
  };
  
  // Filtrar notas por termo de busca e tag selecionada
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === null || 
      (note.tags && note.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">
            Anotações
          </h1>
          <button 
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors w-full sm:w-auto"
            onClick={createNewNote}
          >
            Nova Nota
          </button>
        </div>
        
        {/* Barra de pesquisa e filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-foreground/40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Pesquisar anotações..."
                className="pl-10 pr-4 py-2 border border-neutral/20 rounded-lg w-full bg-white dark:bg-neutral focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                selectedTag === null 
                  ? 'bg-primary text-white' 
                  : 'bg-neutral/20 text-foreground/70 hover:bg-neutral/30'
              }`}
              onClick={() => setSelectedTag(null)}
            >
              Todas
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  selectedTag === tag 
                    ? 'bg-primary text-white' 
                    : 'bg-neutral/20 text-foreground/70 hover:bg-neutral/30'
                }`}
                onClick={() => setSelectedTag(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
        
        {/* Lista de Notas */}
        <div className="grid gap-4">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                id={note.id}
                title={note.title}
                content={note.content}
                tags={note.tags}
                createdAt={note.createdAt}
                updatedAt={note.updatedAt}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-neutral/10 rounded-lg">
              <p className="text-foreground/60">
                {searchTerm || selectedTag
                  ? 'Nenhuma anotação encontrada com os filtros selecionados.'
                  : 'Você não tem nenhuma anotação ainda. Crie uma nova nota para começar!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 