'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Frown, Meh, Smile, RotateCw } from 'lucide-react';

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

export default function StudySessionPage({ params }: { params: { subjectId: string } }) {
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
      try {
        // Buscar dados da matéria
        const subjectDoc = await getDoc(doc(db, 'subjects', params.subjectId));
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
        setSubject({
          id: subjectDoc.id,
          name: subjectData.name,
          color: subjectData.color || "#4F46E5",
        });

        // Buscar flashcards para revisão
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const flashcardsQuery = query(
          collection(db, 'subjects', params.subjectId, 'flashcards')
        );
        
        const flashcardsSnapshot = await getDocs(flashcardsQuery);
        
        const allCards = flashcardsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            question: data.question,
            answer: data.answer,
            nextReview: data.nextReview ? new Date(data.nextReview.toDate()) : null,
            repetitions: data.repetitions || 0,
            easeFactor: data.easeFactor || 2.5,
            interval: data.interval || 0,
          };
        });
        
        // Filtrar apenas os flashcards que devem ser revisados hoje ou novos
        const cardsForReview = allCards.filter(card => {
          if (!card.nextReview) return true; // Nunca revisado
          return card.nextReview <= today;
        });
        
        if (cardsForReview.length === 0) {
          toast({
            title: "Sem flashcards para revisar",
            description: "Não há flashcards para revisar hoje. Volte mais tarde!",
          });
          router.push(`/study/${params.subjectId}`);
          return;
        }
        
        // Embaralhar os flashcards para estudo
        const shuffledCards = cardsForReview.sort(() => Math.random() - 0.5);
        setFlashcards(shuffledCards);
        setTotalCards(shuffledCards.length);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados para estudo",
          variant: "destructive",
        });
        router.push(`/study/${params.subjectId}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.subjectId, router, toast]);

  // Lidar com a avaliação do flashcard
  const handleGrade = async (grade: number) => {
    try {
      const currentCard = flashcards[currentCardIndex];
      const updatedCard = calculateNextReview(grade, currentCard);
      
      // Atualizar no Firestore
      await updateDoc(doc(db, 'subjects', params.subjectId, 'flashcards', currentCard.id), {
        repetitions: updatedCard.repetitions,
        easeFactor: updatedCard.easeFactor,
        interval: updatedCard.interval,
        nextReview: Timestamp.fromDate(updatedCard.nextReview),
      });
      
      // Atualizar localmente
      const updatedFlashcards = [...flashcards];
      updatedFlashcards[currentCardIndex] = updatedCard;
      setFlashcards(updatedFlashcards);
      
      // Avançar para o próximo cartão
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(prevIndex => prevIndex + 1);
        setShowAnswer(false);
        setProgress(Math.round(((currentCardIndex + 1) / totalCards) * 100));
      } else {
        // Sessão concluída
        setSessionCompleted(true);
        setProgress(100);
        toast({
          title: "Sessão concluída!",
          description: "Você completou a revisão de todos os flashcards.",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar flashcard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar sua avaliação",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    router.push(`/study/${params.subjectId}`);
  };

  const handleRestart = () => {
    router.refresh();
  };

  // Mostrar página de carregamento
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Preparando seus flashcards...</p>
      </div>
    );
  }

  // Mostrar página de conclusão da sessão
  if (sessionCompleted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Sessão Concluída!</h1>
          <Card className="p-8 mb-8">
            <div className="mb-6">
              <p className="text-xl mb-4">Você revisou todos os {totalCards} flashcards programados para hoje!</p>
              <p className="text-muted-foreground">Volte amanhã para continuar aprendendo e revisando seu conhecimento.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button onClick={handleBack} variant="outline" className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a matéria
              </Button>
              
              <Button onClick={handleRestart} className="flex-1">
                <RotateCw className="mr-2 h-4 w-4" />
                Iniciar outra sessão
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Mostrar página de estudo
  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{subject?.name}</h1>
          <p className="text-muted-foreground">Sessão de estudo</p>
        </div>
      </div>
      
      {/* Progresso */}
      <div className="mb-6">
        <div className="flex justify-between mb-2 text-sm">
          <span>Progresso</span>
          <span>{currentCardIndex + 1} de {totalCards}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Cartão atual */}
      <Card className="p-8 mb-8 min-h-[300px] flex flex-col">
        <div className="flex-1 flex flex-col">
          <div className="mb-8 flex-1 flex flex-col justify-center">
            <h2 className="text-xl font-medium mb-2">Pergunta:</h2>
            <p className="text-xl">{currentCard.question}</p>
          </div>
          
          {showAnswer && (
            <div className="mt-4 border-t pt-6">
              <h2 className="text-xl font-medium mb-2">Resposta:</h2>
              <p className="text-xl">{currentCard.answer}</p>
            </div>
          )}
        </div>
        
        {!showAnswer ? (
          <Button 
            onClick={() => setShowAnswer(true)} 
            size="lg" 
            className="w-full mt-4"
          >
            Mostrar Resposta
          </Button>
        ) : (
          <div className="mt-6 border-t pt-6">
            <h3 className="mb-3 text-center">Como você avalia sua resposta?</h3>
            <div className="flex flex-col sm:flex-row gap-2 justify-between">
              <Button 
                onClick={() => handleGrade(1)} 
                variant="outline" 
                className="flex-1 flex flex-col items-center py-6"
              >
                <Frown className="h-8 w-8 mb-2 text-destructive" />
                <span>Difícil</span>
                <span className="text-xs text-muted-foreground">Não lembrei</span>
              </Button>
              
              <Button 
                onClick={() => handleGrade(3)} 
                variant="outline" 
                className="flex-1 flex flex-col items-center py-6"
              >
                <Meh className="h-8 w-8 mb-2 text-amber-500" />
                <span>Médio</span>
                <span className="text-xs text-muted-foreground">Lembrei com esforço</span>
              </Button>
              
              <Button 
                onClick={() => handleGrade(5)} 
                variant="outline" 
                className="flex-1 flex flex-col items-center py-6"
              >
                <Smile className="h-8 w-8 mb-2 text-green-500" />
                <span>Fácil</span>
                <span className="text-xs text-muted-foreground">Lembrei facilmente</span>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
} 