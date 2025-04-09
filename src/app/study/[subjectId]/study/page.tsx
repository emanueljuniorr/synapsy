'use client';

import { useState, useEffect, use } from 'react';
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
  const unwrappedParams = use(params);
  const subjectId = unwrappedParams.subjectId;
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
        const subjectDoc = await getDoc(doc(db, 'subjects', subjectId));
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
          collection(db, 'subjects', subjectId, 'flashcards')
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
          router.push(`/study/${subjectId}`);
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
        router.push(`/study/${subjectId}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [subjectId, router, toast]);

  // Lidar com a avaliação do flashcard
  const handleGrade = async (grade: number) => {
    try {
      const currentCard = flashcards[currentCardIndex];
      const updatedCard = calculateNextReview(grade, currentCard);
      
      // Atualizar no Firestore
      await updateDoc(doc(db, 'subjects', subjectId, 'flashcards', currentCard.id), {
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
          title: "Sessão concluída",
          description: "Você revisou todos os flashcards para hoje!",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar flashcard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o flashcard",
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
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <p className="text-lg font-medium">Carregando sessão de estudo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack} 
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">
          {subject?.name}: Revisão
        </h1>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progresso</span>
          <span>{currentCardIndex + 1} de {totalCards}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {!sessionCompleted ? (
        <>
          {flashcards.length > 0 && (
            <Card className="flex-1 flex flex-col p-6 mb-4">
              <div className="flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Pergunta:</h3>
                  <div className="text-xl">
                    {flashcards[currentCardIndex].question}
                  </div>
                </div>

                {showAnswer ? (
                  <div className="mt-auto">
                    <h3 className="text-lg font-medium mb-2">Resposta:</h3>
                    <div className="text-xl whitespace-pre-wrap">
                      {flashcards[currentCardIndex].answer}
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto pt-4 border-t">
                    <Button 
                      onClick={() => setShowAnswer(true)} 
                      className="w-full"
                    >
                      Mostrar Resposta
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {showAnswer && (
            <div className="space-y-4">
              <h3 className="text-center font-medium">Como você se saiu?</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <Button 
                  onClick={() => handleGrade(1)} 
                  variant="outline" 
                  className="flex flex-col items-center py-4"
                >
                  <Frown className="h-8 w-8 mb-2 text-red-500" />
                  <span>Esqueci</span>
                </Button>
                
                <Button 
                  onClick={() => handleGrade(3)} 
                  variant="outline" 
                  className="flex flex-col items-center py-4"
                >
                  <Meh className="h-8 w-8 mb-2 text-yellow-500" />
                  <span>Difícil</span>
                </Button>
                
                <Button 
                  onClick={() => handleGrade(5)} 
                  variant="outline" 
                  className="flex flex-col items-center py-4"
                >
                  <Smile className="h-8 w-8 mb-2 text-green-500" />
                  <span>Fácil</span>
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card className="flex flex-col items-center justify-center p-6 mt-4">
          <h2 className="text-2xl font-bold mb-4">Sessão Concluída!</h2>
          <p className="text-center mb-6">
            Você revisou todos os {totalCards} flashcards programados para hoje.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleBack}>
              Voltar
            </Button>
            <Button onClick={handleRestart} className="flex items-center">
              <RotateCw className="w-4 h-4 mr-2" />
              Revisar Novamente
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
} 