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
                Tarefas
              </h1>
              <p className="text-foreground/60 mt-1">
                Gerencie suas atividades e projetos
              </p>
            </div>
            <button className="group relative px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Nova Tarefa</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
            </button>
          </div>
          
          {/* Filtros */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <button
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white/5 text-foreground/70 hover:bg-white/10'
                }`}
                onClick={() => setFilter('all')}
              >
                Todas
              </button>
              <button
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  filter === 'active' 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white/5 text-foreground/70 hover:bg-white/10'
                }`}
                onClick={() => setFilter('active')}
              >
                Ativas
              </button>
              <button
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  filter === 'completed' 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white/5 text-foreground/70 hover:bg-white/10'
                }`}
                onClick={() => setFilter('completed')}
              >
                Concluídas
              </button>
            </div>
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
              <div className="text-center py-12 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl">
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
      </div>
    </MainLayout>
  );
} 