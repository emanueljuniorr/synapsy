'use client';

import { useState } from 'react';
import { RiEdit2Line, RiDeleteBinLine, RiPriceTag3Line } from 'react-icons/ri';

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  category?: string;
  onToggleComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function TaskCard({
  id,
  title,
  description,
  dueDate,
  priority,
  completed,
  category,
  onToggleComplete,
  onEdit,
  onDelete
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityStyles = {
    low: 'bg-green-500/10 text-green-500 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className={`group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${completed ? 'opacity-60' : ''}`}>
      {/* Efeito de brilho no hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
      
      <div className="p-6">
        <div className="flex items-start gap-4">
          <button
            className={`mt-1 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all duration-300
              ${completed 
                ? 'bg-primary border-primary text-white' 
                : 'border-white/20 group-hover:border-primary'}`}
            onClick={() => onToggleComplete(id)}
            aria-label={completed ? "Marcar como incompleta" : "Marcar como completa"}
          >
            {completed && (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className={`font-medium text-lg ${completed ? 'line-through text-foreground/40' : 'text-foreground/90'}`}>
                {title}
              </h3>
              {priority && (
                <span className={`text-xs px-3 py-1 rounded-xl border ${priorityStyles[priority]}`}>
                  {priority === 'low' ? 'Baixa' : priority === 'medium' ? 'Média' : 'Alta'}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {dueDate && (
                <div className="text-sm text-foreground/50">
                  Vencimento: {formatDate(dueDate)}
                </div>
              )}
              
              {category && (
                <div className="flex items-center text-sm text-primary/70">
                  <RiPriceTag3Line className="w-4 h-4 mr-1" />
                  {category}
                </div>
              )}
            </div>
            
            {description && (
              <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-48' : 'max-h-0'}`}>
                <p className="text-sm text-foreground/70 leading-relaxed">{description}</p>
              </div>
            )}
            
            <div className="flex items-center gap-4 mt-3">
              {description && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  {isExpanded ? 'Mostrar menos' : 'Mostrar mais'}
                </button>
              )}
              <div className="flex-1" />
              <button 
                onClick={() => onEdit(id)}
                className="p-2 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                aria-label="Editar tarefa"
              >
                <RiEdit2Line className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onDelete(id)}
                className="p-2 text-foreground/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                aria-label="Excluir tarefa"
              >
                <RiDeleteBinLine className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskCard; 