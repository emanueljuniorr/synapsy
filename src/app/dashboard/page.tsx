'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db, auth } from '@/lib/firebase';
import { getDashboardData, Task, Note, StudyTopic, DashboardData } from '@/lib/firestore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  CheckCircle, Clock, CalendarDays, BookOpen, ListTodo, FileText, 
  PieChart as PieChartIcon, BarChart2, Brain, Timer 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const router = useRouter();

  // Função para formatar segundos em formato legível
  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const min = minutes % 60;
    return `${hours}h${min > 0 ? ` ${min}min` : ''}`;
  };

  // Buscar dados do dashboard
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) {
        router.push('auth/login');
      return;
    }
    
        try {
          setIsLoading(true);
        const data = await getDashboardData();
          setDashboardData(data);
        } catch (error) {
          console.error('Erro ao buscar dados do dashboard:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
    fetchData();
  }, [router]);

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
                          labelLine={false}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {taskCompletionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} tarefas`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
              </div>

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
                          task.completed 
                            ? 'text-green-500 bg-green-500/10' 
                            : 'text-blue-500 bg-blue-500/10'
                        }`}>
                          {task.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <h4 className={`font-medium ${task.completed ? 'line-through text-foreground/50' : ''}`}>
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
                    <p className="text-foreground/50 text-center py-4">Nenhuma tarefa encontrada</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full" size="sm">
                  <Link href="/tasks">Ver todas as tarefas</Link>
                </Button>
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
                        <h4 className="font-medium line-clamp-1">{note.title}</h4>
                        <p className="text-sm text-foreground/60 line-clamp-2">{note.content}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                              {tag}
                            </span>
                          ))}
                        </div>
              </div>
                    ))
                  ) : (
                    <p className="text-foreground/50 text-center py-4">Nenhuma nota encontrada</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full" size="sm">
                  <Link href="/notes">Ver todas as notas</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Card de Tópicos de Estudo */}
            <Card className="bg-background/20 backdrop-blur-lg border border-white/10 hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-violet-500" />
                  <span>Matérias para Revisar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.subjects && dashboardData.subjects.filter(subject => subject.dueFlashcards > 0).length > 0 ? (
                    dashboardData.subjects
                      .filter(subject => subject.dueFlashcards > 0)
                      .slice(0, 5)
                      .map(subject => (
                        <div key={subject.id} className="flex items-center justify-between pb-3 border-b border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-10 rounded-sm" style={{ backgroundColor: subject.color }} />
                            <div>
                              <h4 className="font-medium">{subject.name}</h4>
                              <p className="text-xs text-foreground/50">
                                {subject.dueFlashcards} flashcards para revisar
                              </p>
                            </div>
                          </div>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/study/${subject.id}/study`}>Estudar</Link>
                          </Button>
              </div>
                      ))
                  ) : (
                    <p className="text-foreground/50 text-center py-4">Nenhuma matéria com flashcards para revisar</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full" size="sm">
                  <Link href="/study">Ver todas as matérias</Link>
                </Button>
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
                <Button asChild variant="ghost" className="w-full" size="sm">
                  <Link href="/focus">Iniciar sessão de foco</Link>
                </Button>
              </CardFooter>
            </Card>
            </div>

          {/* Seção de Ações Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              asChild 
              variant="outline" 
              className="p-6 h-auto flex flex-col items-center gap-4 border-white/10 bg-background/20 backdrop-blur-lg hover:border-primary/30"
            >
              <Link href="/tasks">
                <ListTodo className="h-12 w-12 text-blue-500" />
                <span className="font-medium">Nova Tarefa</span>
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              className="p-6 h-auto flex flex-col items-center gap-4 border-white/10 bg-background/20 backdrop-blur-lg hover:border-primary/30"
            >
              <Link href="/notes/new">
                <FileText className="h-12 w-12 text-indigo-500" />
                <span className="font-medium">Nova Nota</span>
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              className="p-6 h-auto flex flex-col items-center gap-4 border-white/10 bg-background/20 backdrop-blur-lg hover:border-primary/30"
            >
              <Link href="/study/new">
                <BookOpen className="h-12 w-12 text-violet-500" />
                <span className="font-medium">Nova Matéria</span>
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              className="p-6 h-auto flex flex-col items-center gap-4 border-white/10 bg-background/20 backdrop-blur-lg hover:border-primary/30"
            >
              <Link href="/focus">
                <Timer className="h-12 w-12 text-green-500" />
                <span className="font-medium">Iniciar Foco</span>
                </Link>
            </Button>
              </div>
        </div>
      </div>
    </MainLayout>
  );
}