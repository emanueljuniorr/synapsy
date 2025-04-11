'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Frown, Meh, Smile, RotateCw } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

// Interface para os flashcards
interface Flashcard {
  id: string;
  question: string;
  answer: string;
  nextReview: Date | null;
  repetitions: number;
  easeFactor: number;
  interval: number;
}

// Interface para a matéria
interface Subject {
  id: string;
  name: string;
  color: string;
}

// Interface para os props do componente
interface StudySessionProps {
  subjectId: string;
}

// Algoritmo SM-2 para repetição espaçada
function calculateNextReview(grade: number, card: Flashcard) {
  // Grade vai de 0 a 5, onde:
  // 0-2: falha na memorização (recomeçar)
  // 3: difícil mas lembrou
  // 4: bom, lembrou com esforço
  // 5: excelente, lembrou facilmente
  
  let nextCard = { ...card };
  
  if (grade >= 3) {
    // Resposta correta
    if (nextCard.repetitions === 0) {
      nextCard.interval = 1; // 1 dia
    } else if (nextCard.repetitions === 1) {
      nextCard.interval = 6; // 6 dias
    } else {
      nextCard.interval = Math.round(nextCard.interval * nextCard.easeFactor);
    }
    
    nextCard.repetitions += 1;
    
    // Ajuste do fator de facilidade (EF)
    nextCard.easeFactor = nextCard.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    
    // Limites para o EF (entre 1.3 e 2.5)
    if (nextCard.easeFactor < 1.3) nextCard.easeFactor = 1.3;
    if (nextCard.easeFactor > 2.5) nextCard.easeFactor = 2.5;
  } else {
    // Resposta incorreta - recomeçar
    nextCard.repetitions = 0;
    nextCard.interval = 1;
    
    // Pequena penalidade no fator de facilidade, mas não abaixo de 1.3
    nextCard.easeFactor = Math.max(1.3, nextCard.easeFactor - 0.2);
  }
  
  // Calcular próxima data de revisão
  const today = new Date();
  const nextReview = new Date(today);
  nextReview.setDate(today.getDate() + nextCard.interval);
  
  return {
    ...nextCard,
    nextReview
  };
}

export default function StudySession({ subjectId }: StudySessionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  
  // Carregar dados da matéria e flashcards
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para acessar esta página",
          variant: "destructive",
        });
        router.push('auth/login');
        return;
      }
      
      try {
        // Obter parâmetros da URL
        const searchParams = new URLSearchParams(window.location.search);
        const mode = searchParams.get('mode');
        
        // Buscar dados da matéria
        const subjectRef = doc(db, 'subjects', subjectId);
        const subjectDoc = await getDoc(subjectRef);
        
        if (!subjectDoc.exists()) {
          toast({
            title: "Erro",
            description: "Matéria não encontrada",
            variant: "destructive",
          });
          router.push('/study');
          return;
        }
        
        const subjectData = subjectDoc.data();
        
        // Verificar se a matéria pertence ao usuário atual
        if (subjectData.userId !== auth.currentUser.uid) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta matéria",
            variant: "destructive"
          });
          router.push('/study');
          return;
        }
        
        setSubject({
          id: subjectDoc.id,
          name: subjectData.name,
          color: subjectData.color || "#4F46E5",
        });

        // Buscar flashcards para revisão
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Fim do dia de hoje
        
        const flashcardsRef = query(
          collection(db, 'flashcards'),
          where('subjectId', '==', subjectId),
          where('userId', '==', auth.currentUser.uid)
        );
        const flashcardsSnapshot = await getDocs(flashcardsRef);
        
        const allCards = flashcardsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            question: data.question,
            answer: data.answer,
            nextReview: data.nextReview ? data.nextReview.toDate?.() || new Date(data.nextReview) : null,
            repetitions: data.repetitions || 0,
            easeFactor: data.easeFactor || 2.5,
            interval: data.interval || 0,
          };
        });
        
        // Determinar quais cartões mostrar com base no modo
        let cardsToShow = [];
        
        if (mode === 'all') {
          // Mostrar todos os cartões no modo 'all'
          cardsToShow = allCards;
        } else {
          // Filtrar apenas os flashcards que devem ser revisados hoje ou novos
          cardsToShow = allCards.filter(card => {
            if (!card.nextReview) return true; // Nunca revisado
            return card.nextReview <= today;
          });
        }
        
        if (cardsToShow.length === 0) {
          toast({
            title: "Sem flashcards para revisar",
            description: "Não há flashcards para revisar. Adicione alguns ou volte mais tarde!",
          });
          router.push(`/study/${subjectId}`);
          return;
        }
        
        // Embaralhar os flashcards para estudo
        const shuffledCards = cardsToShow.sort(() => Math.random() - 0.5);
        setFlashcards(shuffledCards);
        setTotalCards(shuffledCards.length);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados para estudo",
          variant: "destructive",
        });
        router.push(`/study/${subjectId}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [subjectId, router, toast]);

  // Lidar com a avaliação do flashcard
  const handleGrade = async (grade: number) => {
    if (!auth.currentUser) return;
    
    try {
      const currentCard = flashcards[currentCardIndex];
      const updatedCard = calculateNextReview(grade, currentCard);
      
      // Atualizar dados no Firestore
      const flashcardRef = doc(db, 'flashcards', currentCard.id);
      await updateDoc(flashcardRef, {
        nextReview: updatedCard.nextReview,
        repetitions: updatedCard.repetitions,
        easeFactor: updatedCard.easeFactor,
        interval: updatedCard.interval,
        lastReviewed: new Date()
      });
      
      // Atualizar lista de flashcards localmente
      const updatedFlashcards = [...flashcards];
      updatedFlashcards[currentCardIndex] = updatedCard;
      setFlashcards(updatedFlashcards);
      
      // Avançar para o próximo cartão ou finalizar a sessão
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
        setProgress(Math.round(((currentCardIndex + 1) / totalCards) * 100));
      } else {
        setSessionCompleted(true);
        setProgress(100);
      }
      
    } catch (error) {
      console.error('Erro ao atualizar flashcard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar seu progresso",
        variant: "destructive",
      });
    }
  };

  // Voltar para a tela da matéria
  const handleBack = () => {
    router.push(`/study/${subjectId}`);
  };

  // Reiniciar sessão
  const handleRestart = () => {
    setSessionCompleted(false);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setProgress(0);
    
    // Embaralhar novamente
    const shuffledCards = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffledCards);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium">Carregando detalhes da matéria...</p>
          </div>
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
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          {/* Cabeçalho */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl" />
            <div className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleBack} 
                  className="mr-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  {subject?.name}: Revisão
                </h1>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progresso</span>
                  <span>{currentCardIndex + 1} de {totalCards}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>

          {!sessionCompleted ? (
            <div className="space-y-8">
              {flashcards.length > 0 && (
                <Card className="relative overflow-hidden flex-1 flex flex-col p-8 mb-4 bg-white/5 border border-white/10 backdrop-blur-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-20"></div>
                  <div className="relative flex-1 flex flex-col">
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-3 text-white/80">Pergunta:</h3>
                      <div className="text-2xl font-medium">
                        {flashcards[currentCardIndex].question}
                      </div>
                    </div>

                    {showAnswer ? (
                      <div className="mt-auto">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6"></div>
                        <h3 className="text-lg font-medium mb-3 text-white/80">Resposta:</h3>
                        <div className="text-xl whitespace-pre-wrap">
                          {flashcards[currentCardIndex].answer}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-auto pt-6 flex justify-center">
                        <Button 
                          onClick={() => setShowAnswer(true)} 
                          className="bg-primary/80 hover:bg-primary text-white px-6 py-2 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-primary/20"
                        >
                          Mostrar Resposta
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {showAnswer && (
                <div className="space-y-6">
                  <h3 className="text-center font-medium text-lg">Como você se saiu?</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <Button 
                      onClick={() => handleGrade(1)} 
                      variant="outline" 
                      className="flex flex-col items-center py-6 bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                    >
                      <Frown className="h-10 w-10 mb-3 text-red-500" />
                      <span>Esqueci</span>
                    </Button>
                    
                    <Button 
                      onClick={() => handleGrade(3)} 
                      variant="outline" 
                      className="flex flex-col items-center py-6 bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-all"
                    >
                      <Meh className="h-10 w-10 mb-3 text-yellow-500" />
                      <span>Difícil</span>
                    </Button>
                    
                    <Button 
                      onClick={() => handleGrade(5)} 
                      variant="outline" 
                      className="flex flex-col items-center py-6 bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-green-500/10 hover:border-green-500/30 transition-all"
                    >
                      <Smile className="h-10 w-10 mb-3 text-green-500" />
                      <span>Fácil</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl"></div>
              <Card className="relative bg-background/30 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center p-10 mt-4 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Sessão Concluída!</h2>
                <p className="text-foreground/70 mb-8 max-w-md">
                  Você revisou todos os {totalCards} flashcards programados para hoje. Continue estudando regularmente para melhores resultados.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="border-white/10 hover:bg-white/10">
                    Voltar
                  </Button>
                  <Button onClick={handleRestart} className="flex items-center bg-primary/80 hover:bg-primary transition-all">
                    <RotateCw className="w-4 h-4 mr-2" />
                    Revisar Novamente
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 