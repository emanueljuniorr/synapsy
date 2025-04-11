'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db, auth } from '@/lib/firebase';
import { getDashboardData, checkSubscription } from '@/lib/firestore';
import { Task, Note, StudyTopic } from '@/types';
import { DashboardData } from '@/lib/firestore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { 
  CheckCircle, Clock, CalendarDays, BookOpen, ListTodo, FileText, 
  PieChart as PieChartIcon, BarChart2, Brain, Timer, Crown 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasProPlan, setHasProPlan] = useState(false);
  const router = useRouter();

  // Função para formatar segundos em formato legível
  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const min = minutes % 60;
    return `${hours}h${min > 0 ? ` ${min}min` : ''}`;
  };

  // Verificar autenticação e buscar dados do dashboard
  useEffect(() => {
    let authCheckTimeout: NodeJS.Timeout;
    let isSubscribed = true;
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      // Limpar qualquer timeout existente
      if (authCheckTimeout) {
        clearTimeout(authCheckTimeout);
      }
      
      if (!user) {
        console.log('Aguardando verificação de autenticação...');
        // Adicionar um atraso antes de redirecionar para dar tempo ao Firebase carregar o estado da autenticação
        authCheckTimeout = setTimeout(() => {
          // Verificar se o componente ainda está montado
          if (isSubscribed) {
            console.log('Usuário não autenticado após tempo de espera, redirecionando para login');
            router.push('/auth/login');
          }
        }, 1500); // Esperar 1.5 segundos antes de redirecionar
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Usuário autenticado, buscando dados do dashboard para:', user.uid);
        const data = await getDashboardData(user.uid);
        
        // Verificar se o componente ainda está montado antes de atualizar o estado
        if (!isSubscribed) return;
        
        if (!data) {
          console.error('Nenhum dado retornado da função getDashboardData');
          setError('Não foi possível carregar os dados do dashboard');
          // Criar dados vazios para evitar erros de renderização
          setDashboardData({
            tasks: [],
            notes: [],
            subjects: [],
            counts: {
              pendingTasks: 0,
              completedTasks: 0,
              totalNotes: 0,
              dueFlashcards: 0
            },
            focusSessions: []
          });
        } else {
          console.log('Dados do dashboard recebidos:', data);
          setDashboardData(data);
          await checkUserSubscription(user.uid);
        }
      } catch (error) {
        // Verificar se o componente ainda está montado antes de atualizar o estado
        if (!isSubscribed) return;
        
        console.error('Erro ao buscar dados do dashboard:', error);
        setError('Erro ao carregar os dados: ' + (error instanceof Error ? error.message : String(error)));
      } finally {
        // Verificar se o componente ainda está montado antes de atualizar o estado
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    });
    
    // Limpar o observador e timeouts quando o componente for desmontado
    return () => {
      isSubscribed = false;
      unsubscribe();
      if (authCheckTimeout) {
        clearTimeout(authCheckTimeout);
      }
    };
  }, [router]);

  // Verificar se o usuário tem assinatura Pro
  const checkUserSubscription = async (userId: string) => {
    try {
      const subscription = await checkSubscription(userId);
      setHasProPlan(subscription.isActive && subscription.plan === 'Pro');
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      setHasProPlan(false);
    }
  };

  // Se estiver carregando, mostrar um indicador
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium">Carregando dados do dashboard...</p>
          </div>
      </div>
      </MainLayout>
    );
  }

  // Se houver erro, mostrar mensagem
  if (error) {
    return (
      <MainLayout>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-lg font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const focusData = dashboardData?.focusSessions.map(session => {
    const date = new Date(session.date);
    return {
      name: weekDays[date.getDay()],
      minutes: session.minutes,
    };
  }) || [];

  // Dados para o gráfico de pizza (tarefas pendentes vs. concluídas)
  const taskCompletionData = [
    { name: 'Pendentes', value: dashboardData?.counts.pendingTasks || 0 },
    { name: 'Concluídas', value: dashboardData?.counts.completedTasks || 0 },
  ];

  const COLORS = ['#3b82f6', '#10b981']; // Azul para pendentes, verde para concluídas

  return (
    <MainLayout>
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Elementos decorativos espaciais */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary rounded-full animate-twinkle" />
        <div className="absolute top-40 right-1/3 w-1 h-1 bg-primary rounded-full animate-twinkle delay-100" />
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary rounded-full animate-twinkle delay-200" />
      </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {/* Cabeçalho do Dashboard */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl"></div>
            <div className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Dashboard
                  </h1>
                  <p className="text-foreground/60 mb-4">
                    Bem-vindo(a) ao seu espaço de produtividade e estudo.
                  </p>
                
                {/* Estatísticas Rápidas */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-background/20 rounded-xl p-4 flex items-center">
                      <ListTodo className="h-8 w-8 mr-3 text-blue-500" />
                      <div>
                    <p className="text-sm text-foreground/60">Tarefas Pendentes</p>
                    <p className="text-2xl font-bold">{dashboardData?.counts.pendingTasks || 0}</p>
                  </div>
                    </div>
                    <div className="bg-background/20 rounded-xl p-4 flex items-center">
                      <FileText className="h-8 w-8 mr-3 text-indigo-500" />
                      <div>
                        <p className="text-sm text-foreground/60">Notas</p>
                    <p className="text-2xl font-bold">{dashboardData?.counts.totalNotes || 0}</p>
                      </div>
                    </div>
                    <div className="bg-background/20 rounded-xl p-4 flex items-center">
                      <BookOpen className="h-8 w-8 mr-3 text-violet-500" />
                      <div>
                        <p className="text-sm text-foreground/60">Flashcards</p>
                        <p className="text-2xl font-bold">{dashboardData?.counts.dueFlashcards || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gráfico de tarefas */}
                <div className="flex flex-col justify-center">
                  <h3 className="text-sm font-medium text-center mb-3 text-foreground/60">Progresso de Tarefas</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskCompletionData}
                          cx="50%"
                          cy="50%"
                          labelLine
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {taskCompletionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} tarefas`, '']} />
                        <Legend 
                          layout="horizontal" 
                          verticalAlign="bottom" 
                          align="center"
                          formatter={(value, entry, index) => (
                            <span style={{ color: COLORS[index % COLORS.length] }}>
                              {value} {((taskCompletionData[index].value / 
                                (taskCompletionData[0].value + taskCompletionData[1].value)) * 100).toFixed(0)}%
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
              </div>

            {/* Verificar se o usuário tem assinatura Pro */}
            {!hasProPlan && (
              <div className="mb-8 relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-xl"></div>
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Atualize para o Plano Pro</h3>
                    <p className="text-foreground/70 mb-4">
                      Desbloqueie recursos avançados, notas ilimitadas e muito mais para maximizar sua produtividade.
                    </p>
                    <Link href="/plans">
                      <button className="group relative px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2">
                        <Crown className="h-4 w-4 mr-1" />
                        <span>Conheça o Plano Pro</span>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
                      </button>
                    </Link>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-40 h-40 rounded-full bg-primary/10 relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 animate-pulse blur-xl"></div>
                    <Crown className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Grid de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Card de Tarefas Recentes */}
            <Card className="bg-background/20 backdrop-blur-lg border border-white/10 hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-blue-500" />
                  <span>Tarefas Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.tasks && dashboardData.tasks.length > 0 ? (
                    dashboardData.tasks.map(task => (
                      <div key={task.id} className="flex items-start gap-3 pb-3 border-b border-white/5">
                        <div className={`mt-1 rounded-full p-1 ${
                          task.isDone 
                            ? 'text-green-500 bg-green-500/10' 
                            : 'text-blue-500 bg-blue-500/10'
                        }`}>
                          {task.isDone ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <h4 className={`font-medium ${task.isDone ? 'line-through text-foreground/50' : ''}`}>
                            {task.title}
                          </h4>
                          {task.dueDate && (
                            <p className="text-xs text-foreground/50">
                              Vence em: {format(task.dueDate, 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-foreground/50">
                      <p>Você ainda não tem tarefas.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <button
                  onClick={() => router.push('/tasks')}
                  className="w-full group relative px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <span>Ver todas as tarefas</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
                </button>
              </CardFooter>
            </Card>

            {/* Card de Notas Recentes */}
            <Card className="bg-background/20 backdrop-blur-lg border border-white/10 hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <span>Notas Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.notes && dashboardData.notes.length > 0 ? (
                    dashboardData.notes.map(note => (
                      <div key={note.id} className="pb-3 border-b border-white/5">
                        <h4 className="font-medium">{note.title}</h4>
                        <p className="text-xs text-foreground/50 mt-1">
                          {note.updatedAt ? format(note.updatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'Sem data'}
                        </p>
                        <p className="text-sm text-foreground/70 mt-1 line-clamp-2">
                          {note.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-foreground/50">
                      <p>Você ainda não tem notas.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <button
                  onClick={() => router.push('/notes')}
                  className="w-full group relative px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <span>Ver todas as notas</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
                </button>
              </CardFooter>
            </Card>

            {/* Card de Matérias para Revisar */}
            <Card className="bg-background/20 backdrop-blur-lg border border-white/10 hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-violet-500" />
                  <span>Matérias para Revisar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.subjects && dashboardData.subjects.length > 0 ? (
                    dashboardData.subjects
                      .map(subject => (
                        <div key={subject.id} className="pb-3 border-b border-white/5">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-8 rounded-sm bg-primary/50"
                            />
                            <div>
                              <h4 className="font-medium">{subject.title}</h4>
                              <p className="text-sm text-foreground/70">
                                {subject.progress}% completo
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4 text-foreground/50">
                      <p>Nenhuma matéria para revisar.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <button
                  onClick={() => router.push('/study')}
                  className="w-full group relative px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <span>Ver todas as matérias</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
                </button>
              </CardFooter>
            </Card>
              </div>

          {/* Gráfico de Focus Sessions */}
          <div className="mb-8">
            <Card className="bg-background/20 backdrop-blur-lg border border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-green-500" />
                  <span>Tempo de Foco (Últimos 7 dias)</span>
                </CardTitle>
                <CardDescription>
                  Tempo total: {formatMinutes(focusData.reduce((total, day) => total + day.minutes, 0))}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={focusData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatMinutes(value as number), 'Tempo']} />
                    <Bar dataKey="minutes" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter>
                <Link href="/focus" className="w-full">
                  <button
                    className="w-full group relative px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <span>Iniciar sessão de foco</span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
                  </button>
                </Link>
              </CardFooter>
            </Card>
            </div>

          {/* Seção de Ações Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/tasks">
              <button 
                className="p-6 h-auto w-full flex flex-col items-center gap-4 bg-background/20 backdrop-blur-lg border border-white/10 hover:border-primary/30 rounded-xl hover:shadow-md transition-all duration-300"
              >
                <ListTodo className="h-12 w-12 text-blue-500" />
                <span className="font-medium">Nova Tarefa</span>
              </button>
            </Link>
            
            <Link href="/notes/new">
              <button
                className="p-6 h-auto w-full flex flex-col items-center gap-4 bg-background/20 backdrop-blur-lg border border-white/10 hover:border-primary/30 rounded-xl hover:shadow-md transition-all duration-300"
              >
                <FileText className="h-12 w-12 text-indigo-500" />
                <span className="font-medium">Nova Nota</span>
              </button>
            </Link>
            
            <Link href="/study/new">
              <button
                className="p-6 h-auto w-full flex flex-col items-center gap-4 bg-background/20 backdrop-blur-lg border border-white/10 hover:border-primary/30 rounded-xl hover:shadow-md transition-all duration-300"
              >
                <BookOpen className="h-12 w-12 text-violet-500" />
                <span className="font-medium">Nova Matéria</span>
              </button>
            </Link>
            
            <Link href="/focus">
              <button
                className="p-6 h-auto w-full flex flex-col items-center gap-4 bg-background/20 backdrop-blur-lg border border-white/10 hover:border-primary/30 rounded-xl hover:shadow-md transition-all duration-300"
              >
                <Timer className="h-12 w-12 text-green-500" />
                <span className="font-medium">Iniciar Foco</span>
              </button>
            </Link>
              </div>
        </div>
      </div>
    </MainLayout>
  );
}