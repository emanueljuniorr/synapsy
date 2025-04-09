'use client';

import { useState } from 'react';
import { RiEdit2Line, RiDeleteBinLine, RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  categories?: string[];
  isPinned?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function NoteCard({
  id,
  title,
  content = '',
  tags = [],
  categories = [],
  isPinned = false,
  createdAt,
  updatedAt,
  onEdit,
  onDelete
}: NoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10 shadow-lg transition-all duration-300 hover:bg-white/10">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(id)}
              className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              <RiEdit2Line size={20} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="p-2 text-white/60 hover:text-red-400 transition-colors rounded-lg hover:bg-white/10"
            >
              <RiDeleteBinLine size={20} />
            </button>
          )}
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-24'}`}>
        <div className="prose prose-invert max-w-none opacity-70">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>

      {content.length > 100 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              <RiArrowUpSLine /> Mostrar menos
            </>
          ) : (
            <>
              <RiArrowDownSLine /> Continuar lendo
            </>
          )}
        </button>
      )}

      {/* Exibir categorias e tags */}
      {(Array.isArray(categories) && categories.length > 0) || (Array.isArray(tags) && tags.length > 0) ? (
        <div className="flex flex-wrap gap-2 mt-4">
          {/* Exibir categorias */}
          {Array.isArray(categories) && categories.length > 0 && categories.map((category, index) => (
            <span
              key={`category-${index}`}
              className="px-2 py-1 text-xs rounded-lg bg-primary/20 text-primary border border-primary/20"
            >
              {category}
            </span>
          ))}
          
          {/* Exibir tags */}
          {Array.isArray(tags) && tags.length > 0 && tags.map((tag, index) => (
            <span
              key={`tag-${index}`}
              className="px-2 py-1 text-xs rounded-lg bg-white/10 text-white/70 border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {(createdAt || updatedAt) && (
        <div className="mt-4 text-xs text-white/40">
          {createdAt && <p>Criado em: {format(createdAt, 'dd/MM/yyyy HH:mm')}</p>}
          {updatedAt && <p>Atualizado em: {format(updatedAt, 'dd/MM/yyyy HH:mm')}</p>}
        </div>
      )}
    </div>
  );
} 