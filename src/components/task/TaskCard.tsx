'use client';

import { useState } from 'react';

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
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
  onToggleComplete,
  onEdit,
  onDelete
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityStyles = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className={`bg-white dark:bg-neutral rounded-lg shadow-sm border border-neutral/20 transition-all ${completed ? 'opacity-60' : ''}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="pt-1">
            <button
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors 
              ${completed 
                ? 'bg-primary border-primary text-white' 
                : 'border-neutral-dark hover:border-primary'}`}
              onClick={() => onToggleComplete(id)}
              aria-label={completed ? "Marcar como incompleta" : "Marcar como completa"}
            >
              {completed && (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className={`font-medium ${completed ? 'line-through text-foreground/60' : 'text-foreground'}`}>
                {title}
              </h3>
              {priority && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityStyles[priority]}`}>
                  {priority === 'low' ? 'Baixa' : priority === 'medium' ? 'Média' : 'Alta'}
                </span>
              )}
            </div>
            
            {dueDate && (
              <div className="text-sm text-foreground/60 mb-2">
                Vencimento: {formatDate(dueDate)}
              </div>
            )}
            
            {description && (
              <div className={`overflow-hidden transition-all ${isExpanded ? 'max-h-24' : 'max-h-0'}`}>
                <p className="text-sm text-foreground/70 mt-2">{description}</p>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              {description && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-primary hover:text-primary-dark"
                >
                  {isExpanded ? 'Menos' : 'Mais'}
                </button>
              )}
              <div className="flex-1"></div>
              <button 
                onClick={() => onEdit(id)}
                className="text-foreground/60 hover:text-primary p-1"
                aria-label="Editar tarefa"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button 
                onClick={() => onDelete(id)}
                className="text-foreground/60 hover:text-red-500 p-1"
                aria-label="Excluir tarefa"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskCard; 