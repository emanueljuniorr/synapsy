'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TaskCard from '@/components/task/TaskCard';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  category?: string;
}

export default function TasksPage() {
  // Dados de exemplo para o MVP
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Desenvolver componente de calendário',
      description: 'Criar um componente de calendário que integre com tarefas e eventos.',
      dueDate: new Date(2023, 9, 15),
      priority: 'high',
      completed: false,
      category: 'Desenvolvimento',
    },
    {
      id: '2',
      title: 'Estudar APIs do Next.js',
      description: 'Revisar documentação e exemplos de rotas de API no Next.js 14.',
      dueDate: new Date(2023, 9, 12),
      priority: 'medium',
      completed: false,
      category: 'Estudo',
    },
    {
      id: '3',
      title: 'Criar wireframes para o módulo de anotações',
      dueDate: new Date(2023, 9, 10),
      priority: 'medium',
      completed: true,
      category: 'Design',
    },
    {
      id: '4',
      title: 'Reunião com stakeholders',
      description: 'Discutir próximos passos do projeto e coletar feedback.',
      dueDate: new Date(2023, 9, 18),
      priority: 'low',
      completed: false,
      category: 'Reunião',
    },
  ]);
  
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  // Funções para gerenciar tarefas
  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const handleEdit = (id: string) => {
    // Implementação futura: abrir modal de edição
    console.log(`Editar tarefa ${id}`);
  };
  
  const handleDelete = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  // Filtrar tarefas com base no filtro selecionado
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            Tarefas
          </h1>
          <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
            Nova Tarefa
          </button>
        </div>
        
        {/* Filtros */}
        <div className="flex items-center gap-4 mb-6">
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-neutral/20 text-foreground/70 hover:bg-neutral/30'}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'active' ? 'bg-primary text-white' : 'bg-neutral/20 text-foreground/70 hover:bg-neutral/30'}`}
            onClick={() => setFilter('active')}
          >
            Ativas
          </button>
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-primary text-white' : 'bg-neutral/20 text-foreground/70 hover:bg-neutral/30'}`}
            onClick={() => setFilter('completed')}
          >
            Concluídas
          </button>
        </div>
        
        {/* Lista de Tarefas */}
        <div className="grid gap-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                dueDate={task.dueDate}
                priority={task.priority}
                completed={task.completed}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-neutral/10 rounded-lg">
              <p className="text-foreground/60">
                {filter === 'all' 
                  ? 'Você não tem nenhuma tarefa ainda. Crie uma nova tarefa para começar!' 
                  : filter === 'active' 
                    ? 'Não há tarefas ativas. Todas as suas tarefas estão concluídas!'
                    : 'Não há tarefas concluídas. Complete algumas tarefas!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 