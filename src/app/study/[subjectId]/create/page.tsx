'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, addDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Save } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  color: string;
}

type PageProps = {
  params: {
    subjectId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function CreateFlashcardPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const subjectId = params.subjectId;
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cards, setCards] = useState<{ question: string; answer: string }[]>([]);

  // Carregar dados da matéria
  useEffect(() => {
    const fetchSubject = async () => {
      if (!auth.currentUser) return;
      
      try {
        const subjectDoc = await getDoc(doc(db, 'users', auth.currentUser.uid, 'subjects', subjectId));
        if (!subjectDoc.exists()) {
          toast({
            title: "Erro",
            description: "Matéria não encontrada",
            variant: "destructive",
          });
          router.push('/study');
          return;
        }
        
        const data = subjectDoc.data();
        setSubject({
          id: subjectDoc.id,
          name: data.name,
          color: data.color || "#4F46E5",
        });
      } catch (error) {
        console.error('Erro ao carregar matéria:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da matéria",
          variant: "destructive",
        });
      }
    };
    
    fetchSubject();
  }, [subjectId, toast, router]);

  // Adicionar card à lista temporária
  const addCardToList = () => {
    if (!question.trim() || !answer.trim()) {
      toast({
        title: "Campos incompletos",
        description: "Preencha a pergunta e a resposta para adicionar o flashcard",
        variant: "destructive",
      });
      return;
    }
    
    setCards([...cards, { question, answer }]);
    setQuestion('');
    setAnswer('');
  };

  // Salvar todos os flashcards
  const saveFlashcards = async () => {
    if (!auth.currentUser) return;
    
    if (cards.length === 0 && (!question.trim() || !answer.trim())) {
      toast({
        title: "Nenhum flashcard para salvar",
        description: "Adicione pelo menos um flashcard antes de salvar",
        variant: "destructive",
      });
      return;
    }
    
    // Adicionar o card atual à lista se estiver preenchido
    const cardsToSave = [...cards];
    if (question.trim() && answer.trim()) {
      cardsToSave.push({ question, answer });
    }
    
    setIsSubmitting(true);
    
    try {
      const flashcardsRef = collection(db, 'users', auth.currentUser.uid, 'subjects', subjectId, 'flashcards');
      
      // Adicionar cada flashcard ao Firestore
      const promises = cardsToSave.map(card => 
        addDoc(flashcardsRef, {
          question: card.question,
          answer: card.answer,
          createdAt: new Date(),
          repetitions: 0,
          easeFactor: 2.5,
          interval: 0,
          nextReview: new Date()
        })
      );
      
      await Promise.all(promises);
      
      toast({
        title: "Flashcards salvos",
        description: `${cardsToSave.length} flashcards foram adicionados com sucesso`,
      });
      
      // Redirecionar para a página da matéria
      router.push(`/study/${subjectId}`);
    } catch (error) {
      console.error('Erro ao salvar flashcards:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar os flashcards",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push(`/study/${subjectId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold">{subject?.name || 'Criar Flashcards'}</h1>
      </div>
      
      <Card className="mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Novo Flashcard</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Pergunta</label>
          <Textarea 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Digite a pergunta do flashcard"
            className="resize-none"
            rows={3}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Resposta</label>
          <Textarea 
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Digite a resposta do flashcard"
            className="resize-none"
            rows={4}
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            onClick={addCardToList}
            variant="secondary"
            disabled={isSubmitting || !question.trim() || !answer.trim()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar à lista
          </Button>
          
          <Button
            onClick={saveFlashcards}
            disabled={isSubmitting && cards.length === 0 && (!question.trim() || !answer.trim())}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar todos
          </Button>
        </div>
      </Card>
      
      {cards.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Flashcards adicionados ({cards.length})</h2>
          
          <div className="space-y-4">
            {cards.map((card, index) => (
              <Card key={index} className="p-4 border-l-4" style={{ borderLeftColor: subject?.color || '#4F46E5' }}>
                <p className="font-medium mb-2">{card.question}</p>
                <p className="text-muted-foreground">{card.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 