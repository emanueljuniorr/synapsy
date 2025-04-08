'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getTasks } from '@/lib/firestore';
import { Task } from '@/types';
import { formatDate } from '@/lib/utils';

export default function RecentTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const recentTasks = await getTasks(user.id);
        // Filtra apenas tarefas não concluídas e ordena por data de vencimento
        const pendingTasks = recentTasks
          .filter(task => !task.isDone)
          .sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate.getTime() - b.dueDate.getTime();
          })
          .slice(0, 5); // Limita a 5 tarefas
        setTasks(pendingTasks);
      } catch (error) {
        console.error('Erro ao buscar tarefas recentes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-foreground/60 mb-4">Nenhuma tarefa pendente</p>
        <Link 
          href="/tasks/new" 
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
          Criar Tarefa
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Link 
          key={task.id} 
          href={`/tasks/${task.id}`}
          className="block p-4 rounded-lg bg-background/50 hover:bg-background/70 border border-white/5 hover:border-primary/30 transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium mb-1 truncate">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-foreground/60 truncate">{task.description}</p>
              )}
            </div>
            <div className={`px-2 py-1 text-xs rounded-full ${
              task.priority === 'high' 
                ? 'bg-red-500/10 text-red-500' 
                : task.priority === 'medium'
                ? 'bg-yellow-500/10 text-yellow-500'
                : 'bg-green-500/10 text-green-500'
            }`}>
              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-foreground/40">
              {task.dueDate ? `Vence em ${formatDate(task.dueDate)}` : 'Sem data definida'}
            </span>
            {task.tags && task.tags.length > 0 && (
              <div className="flex gap-1">
                {task.tags.slice(0, 2).map((tag) => (
                  <span 
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-foreground/40">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
} 