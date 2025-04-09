'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TaskCard from '@/components/task/TaskCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  category?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function TasksPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // Estado de tarefas inicializado vazio
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states para criar/editar tarefa
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [formCategory, setFormCategory] = useState('');

  // Categorias comuns para o dropdown
  const commonCategories = ['Desenvolvimento', 'Estudo', 'Design', 'Reunião', 'Pessoal', 'Trabalho'];
  
  // Buscar tarefas do Firebase ao carregar a página
  useEffect(() => {
    const fetchTasks = async () => {
      if (authLoading) return;
      
      if (!user) {
        // Se o usuário não estiver autenticado, redirecionar para o login
        toast({
          title: "Acesso negado",
          description: "Você precisa estar logado para acessar suas tarefas",
          variant: "destructive"
        });
        router.push('/auth/login');
        return;
      }
      
      try {
        setLoading(true);
        
        // Buscar tarefas do usuário atual
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.id)
        );
        
        const querySnapshot = await getDocs(tasksQuery);
        const tasksData: Task[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tasksData.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            dueDate: data.dueDate ? new Date(data.dueDate.toDate()) : undefined,
            priority: data.priority || 'medium',
            completed: data.completed || false,
            category: data.category,
            createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : undefined,
            updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : undefined,
          });
        });
        
        // Ordenar tarefas (não concluídas primeiro, depois por data de vencimento)
        tasksData.sort((a, b) => {
          // Primeiro por status de conclusão
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          
          // Depois por data de vencimento (se existir)
          if (a.dueDate && b.dueDate) {
            return a.dueDate.getTime() - b.dueDate.getTime();
          }
          
          // Tarefas sem data de vencimento ficam por último
          if (a.dueDate) return -1;
          if (b.dueDate) return 1;
          
          return 0;
        });
        
        setTasks(tasksData);
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar suas tarefas",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [user, authLoading, router, toast]);
  
  // Funções para gerenciar tarefas
  const handleToggleComplete = async (id: string) => {
    if (!user) return;
    
    try {
      // Encontrar a tarefa
      const taskToUpdate = tasks.find(task => task.id === id);
      if (!taskToUpdate) return;
      
      // Atualizar estado local primeiro (para UI responsiva)
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
      
      // Atualizar no Firebase
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, {
        completed: !taskToUpdate.completed,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa",
        variant: "destructive"
      });
      
      // Reverter mudança local em caso de erro
      setTasks(prevTasks => [...prevTasks]);
    }
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

  const handleDelete = async () => {
    if (!taskToDelete || !user) return;
    
    try {
      setIsSubmitting(true);
      
      // Excluir a tarefa do Firebase
      await deleteDoc(doc(db, 'tasks', taskToDelete));
      
      // Atualizar estado local
      setTasks(tasks.filter(task => task.id !== taskToDelete));
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tarefa",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar tarefas",
        variant: "destructive"
      });
      return;
    }
    
    if (!formTitle.trim()) {
      toast({
        title: "Erro",
        description: "O título da tarefa é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const taskData: Omit<Task, 'id'> = {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        dueDate: formDueDate ? new Date(formDueDate) : undefined,
        priority: formPriority,
        completed: currentTask ? currentTask.completed : false,
        category: formCategory.trim() || undefined,
        userId: user.id,
      };

      if (currentTask) {
        // Atualizar tarefa existente
        const taskRef = doc(db, 'tasks', currentTask.id);
        await updateDoc(taskRef, {
          ...taskData,
          updatedAt: serverTimestamp()
        });
        
        // Atualizar estado local
        setTasks(tasks.map(task => 
          task.id === currentTask.id ? { ...task, ...taskData } : task
        ));
        
        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso"
        });
      } else {
        // Criar nova tarefa
        const docRef = await addDoc(collection(db, 'tasks'), {
          ...taskData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Adicionar ao estado local
        const newTask: Task = {
          ...taskData,
          id: docRef.id,
        };
        
        setTasks([...tasks, newTask]);
        
        toast({
          title: "Tarefa criada",
          description: "Uma nova tarefa foi adicionada com sucesso"
        });
      }

      closeTaskModal();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a tarefa",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
              disabled={loading || !user}
              className="group relative px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {loading ? (
              <div className="text-center py-12 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-foreground/60">Carregando tarefas...</p>
              </div>
            ) : filteredTasks.length > 0 ? (
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
              className="bg-background border border-white/10 rounded-2xl shadow-xl w-full max-w-md"
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
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Salvando...
                      </>
                    ) : currentTask ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-background border border-white/10 rounded-2xl shadow-xl w-full max-w-md">
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
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Excluindo...
                      </>
                    ) : (
                      'Excluir'
                    )}
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