'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Componente Dashboard
export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else {
      // Simular carregamento de dados
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, router]);
  
  // Se estiver carregando, mostrar um indicador
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
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
            
            {/* Menu de navegação */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="/dashboard" className="text-primary font-medium">Dashboard</a>
              <a href="/tasks" className="text-foreground/70 hover:text-primary transition-colors">Tarefas</a>
              <a href="/notes" className="text-foreground/70 hover:text-primary transition-colors">Anotações</a>
              <a href="/calendar" className="text-foreground/70 hover:text-primary transition-colors">Calendário</a>
              <a href="/study" className="text-foreground/70 hover:text-primary transition-colors">Estudos</a>
            </nav>
            
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
                <span className="text-3xl font-bold">5</span>
                <span className="text-foreground/60 text-sm ml-2">pendentes</span>
              </div>
              <div className="text-right">
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                  2 para hoje
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
                <span className="text-3xl font-bold">12</span>
                <span className="text-foreground/60 text-sm ml-2">total</span>
              </div>
              <div className="text-right">
                <span className="text-sm bg-accent/10 text-accent px-2 py-1 rounded-full">
                  +3 esta semana
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
                <span className="text-3xl font-bold">2</span>
                <span className="text-foreground/60 text-sm ml-2">próximos</span>
              </div>
              <div className="text-right">
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                  1 amanhã
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
                <span className="text-3xl font-bold">8</span>
                <span className="text-foreground/60 text-sm ml-2">tópicos</span>
              </div>
              <div className="text-right">
                <span className="text-sm bg-accent/10 text-accent px-2 py-1 rounded-full">
                  80% completo
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
                <a href="/tasks" className="text-primary text-sm hover:underline">Ver todas</a>
              </div>
              
              <div className="space-y-3">
                {[
                  { id: 1, title: 'Finalizar relatório mensal', priority: 'high', due: 'Hoje, 18:00' },
                  { id: 2, title: 'Preparar apresentação para reunião', priority: 'medium', due: 'Amanhã, 10:00' },
                  { id: 3, title: 'Revisar documentação do projeto', priority: 'low', due: 'Em 2 dias' },
                ].map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 border border-neutral/20 rounded-lg hover:bg-neutral/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' : 
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span>{task.title}</span>
                    </div>
                    <span className="text-sm text-foreground/60">{task.due}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Anotações recentes */}
            <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Anotações recentes</h2>
                <a href="/notes" className="text-primary text-sm hover:underline">Ver todas</a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 1, title: 'Ideias para novos projetos', excerpt: 'Lista de possíveis projetos para o próximo trimestre...', updated: 'Hoje' },
                  { id: 2, title: 'Resumo da reunião semanal', excerpt: 'Pontos discutidos: orçamento, cronograma e recursos...', updated: 'Ontem' },
                ].map(note => (
                  <div key={note.id} className="p-4 border border-neutral/20 rounded-lg hover:bg-neutral/5 transition-colors">
                    <h3 className="font-medium mb-2">{note.title}</h3>
                    <p className="text-sm text-foreground/70 mb-3 line-clamp-2">{note.excerpt}</p>
                    <span className="text-xs text-foreground/60">Atualizado: {note.updated}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Coluna lateral (1/3) */}
          <div className="space-y-8">
            {/* Próximos eventos */}
            <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Próximos eventos</h2>
                <a href="/calendar" className="text-primary text-sm hover:underline">Calendário</a>
              </div>
              
              <div className="space-y-4">
                {[
                  { id: 1, title: 'Reunião de equipe', date: 'Hoje, 14:00 - 15:30', location: 'Sala de reuniões' },
                  { id: 2, title: 'Deadline do projeto Alpha', date: 'Amanhã, 18:00', location: null },
                ].map(event => (
                  <div key={event.id} className="border-l-4 border-primary pl-3">
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-foreground/70">{event.date}</p>
                    {event.location && (
                      <p className="text-xs text-foreground/60">{event.location}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Progresso de estudos */}
            <div className="bg-white dark:bg-neutral rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Progresso de estudos</h2>
                <a href="/study" className="text-primary text-sm hover:underline">Ver detalhes</a>
              </div>
              
              <div className="space-y-4">
                {[
                  { id: 1, title: 'Desenvolvimento Web Avançado', progress: 80 },
                  { id: 2, title: 'Gestão de Projetos', progress: 60 },
                  { id: 3, title: 'Inteligência Artificial', progress: 30 },
                ].map(topic => (
                  <div key={topic.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{topic.title}</span>
                      <span className="text-xs font-medium">{topic.progress}%</span>
                    </div>
                    <div className="w-full bg-neutral/30 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${topic.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dicas e recursos */}
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl shadow-sm p-6">
              <h2 className="font-semibold mb-3">Dica do dia</h2>
              <p className="text-sm text-foreground/80 mb-4">
                Você sabia que pode vincular tarefas a anotações para manter tudo organizado? Experimente clicar no botão de conexão ao criar uma nova tarefa!
              </p>
              <a href="/help" className="text-primary text-sm font-medium hover:underline">Ver mais dicas</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 