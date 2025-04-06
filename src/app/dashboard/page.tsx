'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardData } from '@/lib/firestore';
import { Task, Note, Event, StudyTopic } from '@/types';
import { formatDate } from '@/lib/utils';

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
    <div className="min-h-screen bg-background">
      {/* Barra de navegação superior */}
      <header className="bg-white dark:bg-neutral shadow-sm border-b border-neutral/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Synapsy
              </span>
            </div>
            
            {/* Perfil do usuário */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden sm:inline-block">
                {user?.name || 'Usuário'}
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Título da página */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Bem-vindo, {user?.name || 'Usuário'}!</h1>
          <p className="text-foreground/70">
            Aqui está um resumo das suas atividades recentes e próximos compromissos.
          </p>
        </div>
        
        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Tarefas */}
          <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6">
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
          <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6">
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
          <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Eventos</h2>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
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
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {dashboardData?.events.length ? 1 : 0} amanhã
                </span>
              </div>
            </div>
          </div>
          
          {/* Estudos */}
          <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Estudos</h2>
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
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
                <span className="text-sm bg-accent/10 text-accent px-2 py-1 rounded-full">
                  {dashboardData?.studyTopics[0]?.progress || 0}% completo
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Conteúdo principal em duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tarefas recentes */}
            <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Tarefas recentes</h2>
                <button onClick={() => router.push('/tasks')} className="text-primary text-sm hover:underline">Ver todas</button>
              </div>
              
              <div className="space-y-3">
                {dashboardData?.tasks && dashboardData.tasks.length > 0 ? (
                  dashboardData.tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 border border-neutral/20 rounded-lg hover:bg-neutral/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' : 
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <span>{task.title}</span>
                      </div>
                      <span className="text-sm text-foreground/60">
                        {task.dueDate ? formatDate(task.dueDate) : 'Sem data'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-foreground/60">
                    Nenhuma tarefa pendente
                  </div>
                )}
              </div>
            </div>
            
            {/* Anotações recentes */}
            <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Anotações recentes</h2>
                <button onClick={() => router.push('/notes')} className="text-primary text-sm hover:underline">Ver todas</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData?.notes && dashboardData.notes.length > 0 ? (
                  dashboardData.notes.map(note => (
                    <div key={note.id} className="p-4 border border-neutral/20 rounded-lg hover:bg-neutral/5 transition-colors">
                      <h3 className="font-medium mb-2">{note.title}</h3>
                      <p className="text-sm text-foreground/70 mb-3 line-clamp-2">
                        {note.content}
                      </p>
                      <span className="text-xs text-foreground/60">
                        Atualizado: {formatDate(note.updatedAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-4 text-foreground/60">
                    Nenhuma anotação encontrada
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Coluna lateral (1/3) */}
          <div className="space-y-8">
            {/* Próximos eventos */}
            <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Próximos eventos</h2>
                <button onClick={() => router.push('/calendar')} className="text-primary text-sm hover:underline">Calendário</button>
              </div>
              
              <div className="space-y-4">
                {dashboardData?.events && dashboardData.events.length > 0 ? (
                  dashboardData.events.map(event => (
                    <div key={event.id} className="border-l-4 border-primary pl-3">
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-foreground/70">
                        {formatDate(event.startDate)}
                        {event.isFullDay ? '' : ` ${new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                      </p>
                      {event.location && (
                        <p className="text-xs text-foreground/60">{event.location}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-foreground/60">
                    Nenhum evento próximo
                  </div>
                )}
              </div>
            </div>
            
            {/* Progresso de estudos */}
            <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Progresso de estudos</h2>
                <button onClick={() => router.push('/study')} className="text-primary text-sm hover:underline">Ver detalhes</button>
              </div>
              
              <div className="space-y-4">
                {dashboardData?.studyTopics && dashboardData.studyTopics.length > 0 ? (
                  dashboardData.studyTopics.map(topic => (
                    <div key={topic.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{topic.title}</span>
                        <span className="text-xs font-medium">{topic.progress}%</span>
                      </div>
                      <div className="w-full bg-neutral/30 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${topic.progress}%` }}></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-foreground/60">
                    Nenhum tópico de estudo encontrado
                  </div>
                )}
              </div>
            </div>
            
            {/* Dicas e recursos */}
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl shadow-sm p-6">
              <h2 className="font-semibold mb-3">Dica do dia</h2>
              <p className="text-sm text-foreground/80 mb-4">
                Você sabia que pode vincular tarefas a anotações para manter tudo organizado? Experimente clicar no botão de conexão ao criar uma nova tarefa!
              </p>
              <button onClick={() => router.push('/help')} className="text-primary text-sm font-medium hover:underline">Ver mais dicas</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 