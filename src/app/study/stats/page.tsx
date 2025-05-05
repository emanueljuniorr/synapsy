'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award, Calendar, CheckCircle, CircleOff, Clock, TrendingUp, BrainCircuit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import MainLayout from '@/components/layout/MainLayout';

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
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Garantir que o usuário tem um uid válido
        const userId = user?.uid;
        if (!userId) {
          console.error("ID de usuário não disponível");
          setLoading(false);
          return;
        }
        
        // Buscar todas as matérias do usuário
        const subjectsQuery = query(
          collection(db, 'subjects'),
          where('userId', '==', userId)
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
            collection(db, 'flashcards'),
            where('subjectId', '==', subject.id)
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
      <MainLayout>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-foreground/70">Carregando suas estatísticas...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Elementos decorativos espaciais */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary rounded-full animate-twinkle" />
          <div className="absolute top-40 right-1/3 w-1 h-1 bg-primary rounded-full animate-twinkle delay-100" />
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary rounded-full animate-twinkle delay-200" />
        </div>

        <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Cabeçalho com gradiente e efeito de vidro */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl" />
            <div className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => router.push('/study')}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center">
                      <BrainCircuit className="mr-3 h-8 w-8" />
                      Estatísticas
                    </h1>
                    <p className="text-foreground/60 mt-1">
                      Acompanhe seu progresso nos estudos com repetição espaçada
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={period === 'week' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setPeriod('week')}
                    className={period === 'week' ? 'bg-primary hover:bg-primary/90' : 'bg-white/5 hover:bg-white/10 border-white/10'}
                  >
                    Semana
                  </Button>
                  <Button 
                    variant={period === 'month' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setPeriod('month')}
                    className={period === 'month' ? 'bg-primary hover:bg-primary/90' : 'bg-white/5 hover:bg-white/10 border-white/10'}
                  >
                    Mês
                  </Button>
                </div>
              </div>
            </div>
          </div>
      
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 bg-background/20 backdrop-blur-lg border border-white/10 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-foreground/60 text-sm mb-1">Revisados Hoje</p>
                  <p className="text-3xl font-bold">{stats.reviewedToday}</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-foreground/60 flex items-center">
                <span>Total: {stats.reviewedTotal}</span>
              </div>
            </Card>
          
            <Card className="p-6 bg-background/20 backdrop-blur-lg border border-white/10 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-foreground/60 text-sm mb-1">Dias Consecutivos</p>
                  <p className="text-3xl font-bold">{stats.currentStreak}</p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-full">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-foreground/60 flex items-center">
                <span>Continue estudando diariamente!</span>
              </div>
            </Card>
          
            <Card className="p-6 bg-background/20 backdrop-blur-lg border border-white/10 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-foreground/60 text-sm mb-1">Próxima Revisão</p>
                  <p className="text-3xl font-bold">{stats.nextReviewCount}</p>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-full">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-foreground/60 flex items-center">
                <span>Cartões nos próximos 7 dias</span>
              </div>
            </Card>
          </div>
        
          {/* Gráfico de revisões */}
          <Card className="p-6 mb-8 bg-background/20 backdrop-blur-lg border border-white/10">
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
                  <span className="text-xs text-foreground/60 mt-2">{dates[index]}</span>
                  <span className="text-xs font-medium">{value > 0 ? value : ''}</span>
                </div>
              ))}
            </div>
          </Card>
        
          {/* Resumo */}
          <Card className="p-6 mb-8 bg-background/20 backdrop-blur-lg border border-white/10">
            <h2 className="text-lg font-medium mb-4">Resumo</h2>
          
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-foreground/60">Matérias</span>
                  <span className="font-medium">{stats.subjectsCount}</span>
                </div>
                <Progress value={Math.min(100, stats.subjectsCount * 10)} className="h-2 bg-white/5" />
              </div>
            
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-foreground/60">Total de Flashcards</span>
                  <span className="font-medium">{stats.totalFlashcards}</span>
                </div>
                <Progress value={Math.min(100, stats.totalFlashcards / 5)} className="h-2 bg-white/5" />
              </div>
            
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-foreground/60">Progresso Hoje</span>
                  <span className="font-medium">{stats.reviewedToday}/{stats.nextReviewCount}</span>
                </div>
                <Progress 
                  value={stats.nextReviewCount ? (stats.reviewedToday / stats.nextReviewCount) * 100 : 0} 
                  className="h-2 bg-white/5" 
                />
              </div>
            </div>
          </Card>
        
          {/* Sugestões */}
          <Card className="p-6 bg-background/20 backdrop-blur-lg border border-white/10 hover:border-primary/30 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Dica para maximizar o aprendizado</h3>
                <p className="text-foreground/60 text-sm mb-4">
                  Estudar diariamente por períodos curtos é mais eficaz do que estudar por longas horas em um único dia.
                  Continue sua sequência diária para melhores resultados!
                </p>
                <Button onClick={() => router.push('/study')} className="bg-primary/80 hover:bg-primary text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                  Iniciar estudos
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 