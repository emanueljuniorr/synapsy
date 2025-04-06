'use client';

import { useState } from 'react';

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function NoteCard({
  id,
  title,
  content,
  tags = [],
  createdAt,
  updatedAt,
  onEdit,
  onDelete
}: NoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Truncar conteúdo para preview
  const previewContent = content.length > 150 
    ? content.substring(0, 150) + '...'
    : content;
  
  return (
    <div className="bg-white dark:bg-neutral rounded-lg shadow-sm border border-neutral/20 transition-all hover:border-primary/20 hover:shadow-md">
      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-medium text-lg">{title}</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(id)}
              className="text-foreground/60 hover:text-primary p-1"
              aria-label="Editar nota"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              onClick={() => onDelete(id)}
              className="text-foreground/60 hover:text-red-500 p-1"
              aria-label="Excluir nota"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Preview do conteúdo */}
        <div className="text-sm text-foreground/70 mt-2 mb-3 whitespace-pre-line">
          {isExpanded ? content : previewContent}
        </div>
        
        {/* Botão expandir/recolher */}
        {content.length > 150 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-primary hover:text-primary-dark mb-3"
          >
            {isExpanded ? 'Mostrar menos' : 'Mostrar mais'}
          </button>
        )}
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <span 
                key={tag} 
                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Data de atualização */}
        <div className="text-xs text-foreground/50 mt-2">
          Atualizado em {formatDate(updatedAt)}
        </div>
      </div>
    </div>
  );
}

export default NoteCard; 