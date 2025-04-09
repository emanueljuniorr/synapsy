'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TaskCard from '@/components/task/TaskCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Form states para criar/editar tarefa
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [formCategory, setFormCategory] = useState('');

  // Categorias comuns para o dropdown
  const commonCategories = ['Desenvolvimento', 'Estudo', 'Design', 'Reunião', 'Pessoal', 'Trabalho'];
  
  // Funções para gerenciar tarefas
  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const openTaskModal = (task?: Task) => {
    if (task) {
      // Modo edição
      setCurrentTask(task);
      setFormTitle(task.title);
      setFormDescription(task.description || '');
      setFormDueDate(task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '');
      setFormPriority(task.priority);
      setFormCategory(task.category || '');
    } else {
      // Modo criação
      setCurrentTask(null);
      setFormTitle('');
      setFormDescription('');
      setFormDueDate('');
      setFormPriority('medium');
      setFormCategory('');
    }
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setCurrentTask(null);
  };
  
  const handleEdit = (id: string) => {
    const taskToEdit = tasks.find(task => task.id === id);
    if (taskToEdit) {
      openTaskModal(taskToEdit);
    }
  };
  
  const openDeleteModal = (id: string) => {
    setTaskToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(task => task.id !== taskToDelete));
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: Omit<Task, 'id'> = {
      title: formTitle,
      description: formDescription || undefined,
      dueDate: formDueDate ? new Date(formDueDate) : undefined,
      priority: formPriority,
      completed: currentTask ? currentTask.completed : false,
      category: formCategory || undefined,
    };

    if (currentTask) {
      // Atualizar tarefa existente
      setTasks(tasks.map(task => 
        task.id === currentTask.id ? { ...task, ...taskData } : task
      ));
    } else {
      // Criar nova tarefa
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(), // ID temporário simples
      };
      setTasks([...tasks, newTask]);
    }

    closeTaskModal();
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
            <button 
              onClick={() => openTaskModal()}
              className="group relative px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2"
            >
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
                  category={task.category}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEdit}
                  onDelete={openDeleteModal}
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

        {/* Modal de Criar/Editar Tarefa */}
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div 
              className="bg-background border border-white/10 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 bg-gradient-to-r from-primary/10 to-accent/10">
                <h3 className="text-xl font-bold text-white">
                  {currentTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                </h3>
              </div>

              <form onSubmit={handleSaveTask} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Digite o título da tarefa"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Adicione detalhes sobre a tarefa"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">
                      Data de Vencimento
                    </label>
                    <input
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">
                      Prioridade
                    </label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Ex: Trabalho, Pessoal, Estudo"
                    list="categories"
                  />
                  <datalist id="categories">
                    {commonCategories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeTaskModal}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all shadow-lg shadow-primary/20"
                  >
                    {currentTask ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-background border border-white/10 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-red-500/20 to-red-600/20">
                <h3 className="text-xl font-bold text-white">Confirmar Exclusão</h3>
              </div>

              <div className="p-5">
                <p className="text-foreground/80 mb-6">
                  Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all shadow-lg shadow-red-500/20"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 