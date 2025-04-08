'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import NoteCard from '@/components/notes/NoteCard';
import { useRouter } from 'next/navigation';
import { RiAddLine, RiSearchLine, RiHashtag } from 'react-icons/ri';

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
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Elementos decorativos espaciais */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary rounded-full animate-twinkle" />
          <div className="absolute top-40 right-1/3 w-1 h-1 bg-primary rounded-full animate-twinkle delay-100" />
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary rounded-full animate-twinkle delay-200" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Anotações
              </h1>
              <p className="text-foreground/60 mt-1">
                Organize suas ideias e conhecimentos
              </p>
            </div>
            <button 
              onClick={createNewNote}
              className="group relative px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2"
            >
              <RiAddLine className="w-5 h-5" />
              <span>Nova Nota</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
            </button>
          </div>
          
          {/* Barra de pesquisa e filtros */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <RiSearchLine className="w-5 h-5 text-foreground/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar anotações..."
                    className="pl-10 pr-4 py-2 w-full bg-white/5 backdrop-blur border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Tags */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <RiHashtag className="w-5 h-5 text-foreground/40" />
                  <button
                    className={`text-sm px-4 py-1.5 rounded-xl transition-all ${
                      selectedTag === null 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-white/5 text-foreground/70 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedTag(null)}
                  >
                    Todas
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      className={`text-sm px-4 py-1.5 rounded-xl transition-all ${
                        selectedTag === tag 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-white/5 text-foreground/70 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedTag(tag)}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Lista de Notas */}
          <div className="grid gap-6">
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
              <div className="text-center py-12 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl">
                <p className="text-foreground/60">
                  {searchTerm || selectedTag
                    ? 'Nenhuma anotação encontrada com os filtros selecionados.'
                    : 'Você não tem nenhuma anotação ainda. Crie uma nova nota para começar!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 