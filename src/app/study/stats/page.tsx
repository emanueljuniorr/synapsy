'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award, Calendar, CheckCircle, CircleOff, Clock, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Interface para as estatísticas
interface Stats {
  totalFlashcards: number;
  reviewedToday: number;
  reviewedTotal: number;
  currentStreak: number;
  nextReviewCount: number;
  subjectsCount: number;
  reviewsByDate: { [date: string]: number };
}

// Ajudante para formatar datas
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function StatsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalFlashcards: 0,
    reviewedToday: 0,
    reviewedTotal: 0,
    currentStreak: 0,
    nextReviewCount: 0,
    subjectsCount: 0,
    reviewsByDate: {}
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Buscar todas as matérias do usuário
        const subjectsQuery = query(
          collection(db, 'subjects'),
          where('userId', '==', user.uid)
        );
        
        const subjectsSnapshot = await getDocs(subjectsQuery);
        const subjects = subjectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        let totalFlashcards = 0;
        let reviewedToday = 0;
        let reviewedTotal = 0;
        let nextReviewCount = 0;
        const reviewsByDate: { [date: string]: number } = {};
        
        // Data atual para comparações
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Data para verificar o streak (ontem)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Data limite para cartões a serem revisados em breve (próximos 7 dias)
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        // Preparar datas para o gráfico
        const dates: Date[] = [];
        const daysToShow = period === 'week' ? 7 : 30;
        
        for (let i = daysToShow - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          dates.push(date);
          reviewsByDate[formatDate(date)] = 0;
        }
        
        // Buscar todos os flashcards do usuário
        for (const subject of subjects) {
          const flashcardsQuery = query(
            collection(db, 'subjects', subject.id, 'flashcards')
          );
          
          const flashcardsSnapshot = await getDocs(flashcardsQuery);
          totalFlashcards += flashcardsSnapshot.size;
          
          // Analisar cada flashcard
          flashcardsSnapshot.forEach(doc => {
            const flashcard = doc.data();
            
            // Verificar se tem data da última revisão
            if (flashcard.lastReviewed) {
              const lastReviewedDate = new Date(flashcard.lastReviewed.toDate());
              reviewedTotal++;
              
              // Verificar se foi revisado hoje
              if (formatDate(lastReviewedDate) === formatDate(today)) {
                reviewedToday++;
              }
              
              // Adicionar à contagem de revisões por data para o gráfico
              const dateKey = formatDate(lastReviewedDate);
              if (reviewsByDate.hasOwnProperty(dateKey)) {
                reviewsByDate[dateKey]++;
              }
            }
            
            // Verificar cartões a serem revisados em breve
            if (flashcard.nextReview) {
              const nextReviewDate = new Date(flashcard.nextReview.toDate());
              if (nextReviewDate > today && nextReviewDate <= nextWeek) {
                nextReviewCount++;
              }
            }
          });
        }
        
        // Calcular streak atual
        // Aqui teríamos que buscar registros diários de atividade
        // Por simplicidade, vamos apenas mostrar um valor fixo
        const currentStreak = reviewedToday > 0 ? 1 : 0;
        
        setStats({
          totalFlashcards,
          reviewedToday,
          reviewedTotal,
          currentStreak,
          nextReviewCount,
          subjectsCount: subjects.length,
          reviewsByDate
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar suas estatísticas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user, toast, period]);
  
  // Gerar dados para o gráfico
  const chartData = () => {
    const dates = Object.keys(stats.reviewsByDate).sort();
    const values = dates.map(date => stats.reviewsByDate[date]);
    const maxValue = Math.max(...values, 10);
    
    const displayDates = period === 'week'
      ? dates.map(date => {
          const d = new Date(date);
          return d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3);
        })
      : dates.map(date => {
          const d = new Date(date);
          return d.getDate().toString();
        });
    
    return { dates: displayDates, values, maxValue };
  };
  
  const { dates, values, maxValue } = chartData();
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Carregando suas estatísticas...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/study')}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Estatísticas</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={period === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('week')}
          >
            Semana
          </Button>
          <Button 
            variant={period === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('month')}
          >
            Mês
          </Button>
        </div>
      </div>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Revisados Hoje</p>
              <p className="text-3xl font-bold">{stats.reviewedToday}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground flex items-center">
            <span>Total: {stats.reviewedTotal}</span>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Dias Consecutivos</p>
              <p className="text-3xl font-bold">{stats.currentStreak}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground flex items-center">
            <span>Continue estudando diariamente!</span>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Próxima Revisão</p>
              <p className="text-3xl font-bold">{stats.nextReviewCount}</p>
            </div>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground flex items-center">
            <span>Cartões nos próximos 7 dias</span>
          </div>
        </Card>
      </div>
      
      {/* Gráfico de revisões */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Revisões diárias</h2>
        
        <div className="h-[200px] flex items-end">
          {values.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
              <div 
                className="w-full max-w-[30px] bg-primary/80 rounded-t-sm transition-all"
                style={{ 
                  height: `${Math.max(15, (value / maxValue) * 100)}%`,
                  opacity: value ? 1 : 0.3 
                }}
              />
              <span className="text-xs text-muted-foreground mt-2">{dates[index]}</span>
              <span className="text-xs font-medium">{value > 0 ? value : ''}</span>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Resumo */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Resumo</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Matérias</span>
              <span className="font-medium">{stats.subjectsCount}</span>
            </div>
            <Progress value={Math.min(100, stats.subjectsCount * 10)} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Total de Flashcards</span>
              <span className="font-medium">{stats.totalFlashcards}</span>
            </div>
            <Progress value={Math.min(100, stats.totalFlashcards / 5)} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Progresso Hoje</span>
              <span className="font-medium">{stats.reviewedToday}/{stats.nextReviewCount}</span>
            </div>
            <Progress 
              value={stats.nextReviewCount ? (stats.reviewedToday / stats.nextReviewCount) * 100 : 0} 
              className="h-2" 
            />
          </div>
        </div>
      </Card>
      
      {/* Sugestões */}
      <Card className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium mb-2">Dica para maximizar o aprendizado</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Estudar diariamente por períodos curtos é mais eficaz do que estudar por longas horas em um único dia.
              Continue sua sequência diária para melhores resultados!
            </p>
            <Button onClick={() => router.push('/study')} variant="outline" size="sm">
              Iniciar estudos
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 