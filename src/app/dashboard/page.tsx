'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardData } from '@/lib/firestore';
import { Task, Note, Event, StudyTopic } from '@/types';
import { formatDate } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import RecentTasks from '@/components/dashboard/RecentTasks';
import RecentNotes from '@/components/dashboard/RecentNotes';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import StudyTopics from '@/components/dashboard/StudyTopics';
import WorkflowCard from '@/components/dashboard/WorkflowCard';
import { 
  RiFileTextLine, RiCalendarLine, 
  RiTaskLine, RiBookOpenLine 
} from 'react-icons/ri';

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
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;
  
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

  const workflows = [
    {
      title: 'Anotações',
      description: 'Crie e organize suas anotações com um editor markdown poderoso',
      icon: RiFileTextLine,
      href: '/notes',
      gradient: 'bg-gradient-to-br from-purple-600 to-indigo-600'
    },
    {
      title: 'Calendário',
      description: 'Gerencie seus eventos e compromissos de forma eficiente',
      icon: RiCalendarLine,
      href: '/calendar',
      gradient: 'bg-gradient-to-br from-blue-600 to-cyan-600'
    },
    {
      title: 'Tarefas',
      description: 'Organize suas tarefas e projetos com listas e prioridades',
      icon: RiTaskLine,
      href: '/tasks',
      gradient: 'bg-gradient-to-br from-pink-600 to-rose-600'
    },
    {
      title: 'Estudos',
      description: 'Planeje seus estudos e crie materiais de revisão',
      icon: RiBookOpenLine,
      href: '/study',
      gradient: 'bg-gradient-to-br from-violet-600 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      {/* Cabeçalho */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Bem-vindo de volta, {user?.name || 'usuário'}!
        </h1>
        <p className="text-foreground/60">
          Continue de onde parou ou comece algo novo.
        </p>
      </header>

      {/* Grid de Workflows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workflows.map((workflow, index) => (
          <WorkflowCard key={index} {...workflow} />
        ))}
      </div>

      {/* Decoração de fundo */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background pointer-events-none" />
    </div>
  );
} 