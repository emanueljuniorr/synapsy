'use client';

import { useState } from 'react';
import { RiEdit2Line, RiDeleteBinLine } from 'react-icons/ri';

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
    <div className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      {/* Efeito de brilho no hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
      
      <div className="p-6">
        <div className="flex justify-between items-start gap-4 mb-4">
          <h3 className="font-medium text-xl text-foreground/90 group-hover:text-foreground transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(id)}
              className="p-2 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
              aria-label="Editar nota"
            >
              <RiEdit2Line className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(id)}
              className="p-2 text-foreground/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              aria-label="Excluir nota"
            >
              <RiDeleteBinLine className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Preview do conteúdo */}
        <div className="text-base text-foreground/70 mt-2 mb-4 whitespace-pre-line leading-relaxed">
          {isExpanded ? content : previewContent}
        </div>
        
        {/* Botão expandir/recolher */}
        {content.length > 150 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary hover:text-primary-dark transition-colors mb-4"
          >
            {isExpanded ? 'Mostrar menos' : 'Mostrar mais'}
          </button>
        )}
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
              <span 
                key={tag} 
                className="text-sm px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Data de atualização */}
        <div className="text-sm text-foreground/40 mt-2">
          Atualizado em {formatDate(updatedAt)}
        </div>
      </div>
    </div>
  );
}

export default NoteCard; 