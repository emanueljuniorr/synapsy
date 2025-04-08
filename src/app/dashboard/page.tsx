'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardData } from '@/lib/firestore';
import { Task, Note, Event, StudyTopic } from '@/types';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import RecentTasks from '@/components/dashboard/RecentTasks';
import RecentNotes from '@/components/dashboard/RecentNotes';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import StudyTopics from '@/components/dashboard/StudyTopics';
import ActivityChart from '@/components/dashboard/ActivityChart';
import ProductivityChart from '@/components/dashboard/ProductivityChart';

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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Elementos decorativos espaciais */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary rounded-full animate-twinkle" />
        <div className="absolute top-40 right-1/3 w-1 h-1 bg-primary rounded-full animate-twinkle delay-100" />
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary rounded-full animate-twinkle delay-200" />
      </div>

      <div className="relative z-10">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 space-y-6">
            {/* Seção de Boas-vindas e Estatísticas */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card de Boas-vindas */}
              <div className="md:col-span-2 bg-background/40 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
                <h1 className="text-2xl font-bold mb-2">Bem-vindo de volta, {user?.name}!</h1>
                <p className="text-foreground/60 mb-4">Aqui está um resumo das suas atividades recentes.</p>
                
                {/* Estatísticas Rápidas */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-background/20 rounded-xl p-4">
                    <p className="text-sm text-foreground/60">Tarefas Pendentes</p>
                    <p className="text-2xl font-bold">{dashboardData?.counts.pendingTasks || 0}</p>
                  </div>
                  <div className="bg-background/20 rounded-xl p-4">
                    <p className="text-sm text-foreground/60">Notas Totais</p>
                    <p className="text-2xl font-bold">{dashboardData?.counts.totalNotes || 0}</p>
                  </div>
                  <div className="bg-background/20 rounded-xl p-4">
                    <p className="text-sm text-foreground/60">Eventos Próximos</p>
                    <p className="text-2xl font-bold">{dashboardData?.counts.upcomingEvents || 0}</p>
                  </div>
                </div>
              </div>

              {/* Card de Produtividade */}
              <div className="bg-background/40 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Produtividade</h2>
                <ProductivityChart data={dashboardData} />
              </div>
            </section>

            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card de Tarefas */}
              <div className="bg-background/40 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Tarefas Recentes</h2>
                  <Link href="/tasks" className="text-primary hover:opacity-80 transition-opacity">
                    Ver todas
                  </Link>
                </div>
                <RecentTasks tasks={dashboardData?.tasks || []} />
              </div>

              {/* Card de Notas */}
              <div className="bg-background/40 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Notas Recentes</h2>
                  <Link href="/notes" className="text-primary hover:opacity-80 transition-opacity">
                    Ver todas
                  </Link>
                </div>
                <RecentNotes notes={dashboardData?.notes || []} />
              </div>

              {/* Card de Eventos */}
              <div className="bg-background/40 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Próximos Eventos</h2>
                  <Link href="/calendar" className="text-primary hover:opacity-80 transition-opacity">
                    Ver todos
                  </Link>
                </div>
                <UpcomingEvents events={dashboardData?.events || []} />
              </div>
            </div>

            {/* Gráfico de Atividades */}
            <section className="bg-background/40 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Atividades da Semana</h2>
              </div>
              <ActivityChart data={dashboardData} />
            </section>

            {/* Seção de Estudos */}
            <section className="bg-background/40 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Tópicos de Estudo</h2>
                <Link href="/study" className="text-primary hover:opacity-80 transition-opacity">
                  Ver todos
                </Link>
              </div>
              <StudyTopics topics={dashboardData?.studyTopics || []} />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}