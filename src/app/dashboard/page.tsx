'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardData } from '@/lib/firestore';
import { Task, Note, Event, StudyTopic } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface DashboardData {
  tasks: Task[];
  notes: Note[];
  events: Event[];
  studyTopics: StudyTopic[];
  counts: {
    pendingTasks: number;
    totalNotes: number;
    upcomingEvents: number;
  };
}

// Componente Dashboard
export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Buscar dados do dashboard quando o usuário estiver autenticado
    if (isAuthenticated && user) {
      const fetchDashboardData = async () => {
        try {
          setIsLoading(true);
          const data = await getDashboardData(user.id);
          setDashboardData(data);
        } catch (error) {
          console.error('Erro ao buscar dados do dashboard:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading, router, user]);
  
  // Se estiver carregando, mostrar um indicador
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Contar tarefas para hoje
  const countTasksForToday = () => {
    if (!dashboardData?.tasks.length) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return dashboardData.tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    }).length;
  };
  
  // Contar notas criadas esta semana
  const countNotesThisWeek = () => {
    if (!dashboardData?.notes.length) return 0;
    
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return dashboardData.notes.filter(note => {
      const createdDate = new Date(note.createdAt);
      return createdDate >= oneWeekAgo;
    }).length;
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Barra de navegação superior */}
      <header className="bg-white dark:bg-neutral shadow-sm border-b border-neutral/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Synapsy
                </span>
              </Link>
            </div>
            
            {/* Barra de pesquisa */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  className="w-full py-2 pl-10 pr-4 bg-neutral/5 border border-neutral/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
            
            {/* Perfil do usuário */}
            <div className="flex items-center gap-4">
              <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium hidden sm:inline-block">
                  {user?.name || 'Usuário'}
                </span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-90 transition-opacity">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Barra lateral */}
        <aside className="hidden md:block w-64 bg-white dark:bg-neutral border-r border-neutral/20 p-4 overflow-y-auto">
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveSection('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                activeSection === 'dashboard' ? 'bg-primary text-white' : 'hover:bg-neutral/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Dashboard
            </button>
            
            <button 
              onClick={() => setActiveSection('tasks')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                activeSection === 'tasks' ? 'bg-primary text-white' : 'hover:bg-neutral/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4" /><path d="M12 18v4" /><path d="m4.93 4.93 2.83 2.83" /><path d="m16.24 16.24 2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="m4.93 19.07 2.83-2.83" /><path d="m16.24 7.76 2.83-2.83" />
              </svg>
              Tarefas
            </button>
            
            <button 
              onClick={() => setActiveSection('notes')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                activeSection === 'notes' ? 'bg-primary text-white' : 'hover:bg-neutral/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m22 2-20 20" />
              </svg>
              Anotações
            </button>
            
            <button 
              onClick={() => setActiveSection('calendar')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                activeSection === 'calendar' ? 'bg-primary text-white' : 'hover:bg-neutral/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              Calendário
            </button>
            
            <button 
              onClick={() => setActiveSection('study')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                activeSection === 'study' ? 'bg-primary text-white' : 'hover:bg-neutral/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              Estudos
            </button>
          </nav>
          
          <div className="mt-8 pt-6 border-t border-neutral/20">
            <h3 className="text-xs uppercase text-foreground/50 font-semibold px-3 mb-2">Projetos recentes</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-neutral/10">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm">Estudos para prova</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-neutral/10">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm">Projeto de pesquisa</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-neutral/10">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-sm">Trabalho de faculdade</span>
              </button>
            </div>
          </div>
        </aside>
        
        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Título da página */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Bem-vindo, {user?.name || 'Usuário'}!</h1>
                <p className="text-foreground/70">
                  Aqui está um resumo das suas atividades recentes e próximos compromissos.
                </p>
              </div>
              
              <button className="hidden md:flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Nova tarefa
              </button>
            </div>
          </div>
          
          {/* Cards de resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Tarefas */}
            <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Tarefas</h2>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 2v4" /><path d="M12 18v4" /><path d="m4.93 4.93 2.83 2.83" /><path d="m16.24 16.24 2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="m4.93 19.07 2.83-2.83" /><path d="m16.24 7.76 2.83-2.83" />
                  </svg>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold">{dashboardData?.counts.pendingTasks || 0}</span>
                  <span className="text-foreground/60 text-sm ml-2">pendentes</span>
                </div>
                <div className="text-right">
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {countTasksForToday()} para hoje
                  </span>
                </div>
              </div>
            </div>
            
            {/* Anotações */}
            <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Anotações</h2>
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m22 2-20 20" />
                  </svg>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold">{dashboardData?.counts.totalNotes || 0}</span>
                  <span className="text-foreground/60 text-sm ml-2">total</span>
                </div>
                <div className="text-right">
                  <span className="text-sm bg-accent/10 text-accent px-2 py-1 rounded-full">
                    +{countNotesThisWeek()} esta semana
                  </span>
                </div>
              </div>
            </div>
            
            {/* Calendário */}
            <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Eventos</h2>
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold">{dashboardData?.counts.upcomingEvents || 0}</span>
                  <span className="text-foreground/60 text-sm ml-2">próximos</span>
                </div>
                <div className="text-right">
                  <span className="text-sm bg-purple-500/10 text-purple-500 px-2 py-1 rounded-full">
                    {dashboardData?.events.length ? 1 : 0} amanhã
                  </span>
                </div>
              </div>
            </div>
            
            {/* Estudos */}
            <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Estudos</h2>
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold">{dashboardData?.studyTopics.length || 0}</span>
                  <span className="text-foreground/60 text-sm ml-2">tópicos</span>
                </div>
                <div className="text-right">
                  <span className="text-sm bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                    {dashboardData?.studyTopics[0]?.progress || 0}% completo
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Botão de nova tarefa no mobile */}
          <div className="md:hidden mb-6">
            <button className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Nova tarefa
            </button>
          </div>
          
          {/* Conteúdo principal em duas colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna principal (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tarefas recentes */}
              <div className="bg-white dark:bg-neutral rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral/20 flex items-center justify-between">
                  <h2 className="font-semibold">Tarefas recentes</h2>
                  <button onClick={() => router.push('/tasks')} className="text-primary text-sm hover:underline">Ver todas</button>
                </div>
                
                <div className="divide-y divide-neutral/10">
                  {dashboardData?.tasks && dashboardData.tasks.length > 0 ? (
                    dashboardData.tasks.slice(0, 5).map(task => (
                      <div key={task.id} className="flex items-center justify-between px-6 py-4 hover:bg-neutral/5 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            task.priority === 'high' ? 'bg-red-500' : 
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <span className="font-medium group-hover:text-primary transition-colors">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-foreground/60">
                            {task.dueDate ? formatDate(task.dueDate) : 'Sem data'}
                          </span>
                          <button className="text-foreground/40 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-foreground/60">
                      <p>Nenhuma tarefa encontrada</p>
                      <button className="mt-2 text-primary hover:underline">Criar uma tarefa</button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Notas recentes */}
              <div className="bg-white dark:bg-neutral rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral/20 flex items-center justify-between">
                  <h2 className="font-semibold">Notas recentes</h2>
                  <button onClick={() => router.push('/notes')} className="text-primary text-sm hover:underline">Ver todas</button>
                </div>
                
                <div className="divide-y divide-neutral/10">
                  {dashboardData?.notes && dashboardData.notes.length > 0 ? (
                    dashboardData.notes.slice(0, 3).map(note => (
                      <div key={note.id} className="px-6 py-4 hover:bg-neutral/5 transition-colors group">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium group-hover:text-primary transition-colors">{note.title}</h3>
                          <span className="text-xs text-foreground/60">{formatDate(note.createdAt)}</span>
                        </div>
                        <p className="text-sm text-foreground/70 line-clamp-2">{note.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-foreground/60">
                      <p>Nenhuma nota encontrada</p>
                      <button className="mt-2 text-primary hover:underline">Criar uma nota</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Coluna secundária (1/3) */}
            <div className="space-y-8">
              {/* Próximos eventos */}
              <div className="bg-white dark:bg-neutral rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral/20 flex items-center justify-between">
                  <h2 className="font-semibold">Próximos eventos</h2>
                  <button onClick={() => router.push('/calendar')} className="text-primary text-sm hover:underline">Ver calendário</button>
                </div>
                
                <div className="divide-y divide-neutral/10">
                  {dashboardData?.events && dashboardData.events.length > 0 ? (
                    dashboardData.events.slice(0, 3).map(event => (
                      <div key={event.id} className="px-6 py-4 hover:bg-neutral/5 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center justify-center bg-purple-500/10 rounded-lg p-2 text-purple-500 min-w-[48px]">
                            <span className="text-sm font-bold">{new Date(event.startDate).getDate()}</span>
                            <span className="text-xs">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                          </div>
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <p className="text-xs text-foreground/60 mt-1">
                              {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-foreground/60">
                      <p>Nenhum evento próximo</p>
                      <button className="mt-2 text-primary hover:underline">Criar um evento</button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progresso de estudos */}
              <div className="bg-white dark:bg-neutral rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral/20">
                  <h2 className="font-semibold">Progresso de estudos</h2>
                </div>
                
                <div className="p-6 space-y-4">
                  {dashboardData?.studyTopics && dashboardData.studyTopics.length > 0 ? (
                    dashboardData.studyTopics.slice(0, 3).map(topic => (
                      <div key={topic.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">{topic.title}</h3>
                          <span className="text-xs text-foreground/60">{topic.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-neutral/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: `${topic.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-foreground/60">
                      <p>Nenhum tópico de estudo</p>
                      <button className="mt-2 text-primary hover:underline">Adicionar tópico</button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Dica do dia */}
              <div className="bg-gradient-to-br from-primary/80 to-accent/80 rounded-xl shadow-sm p-6 text-white">
                <h2 className="font-semibold mb-3">💡 Dica do dia</h2>
                <p className="text-white/90 text-sm">
                  Use a técnica Pomodoro para aumentar sua produtividade: trabalhe por 25 minutos e descanse por 5 minutos.
                </p>
                <button className="mt-4 text-sm hover:underline">Ver mais dicas</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 