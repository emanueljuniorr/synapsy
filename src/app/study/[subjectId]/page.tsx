import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, Plus, Edit, Trash2, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  lastReviewed: Date | null;
  nextReview: Date | null;
  reviewCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Subject {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  totalCards: number;
  color: string;
}

export default function SubjectDetailsPage({ params }: { params: { subjectId: string } }) {
  const { toast } = useToast();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCardOpen, setNewCardOpen] = useState(false);
  const [editCardOpen, setEditCardOpen] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [studySessionOpen, setStudySessionOpen] = useState(false);
  const [currentStudyIndex, setCurrentStudyIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);

  // Carregar dados da matéria
  useEffect(() => {
    const fetchSubjectDetails = async () => {
      if (!auth.currentUser) return;
      
      try {
        setLoading(true);
        const subjectRef = doc(db, "users", auth.currentUser.uid, "subjects", params.subjectId);
        const subjectDoc = await getDoc(subjectRef);
        
        if (subjectDoc.exists()) {
          const subjectData = subjectDoc.data();
          setSubject({
            id: subjectDoc.id,
            name: subjectData.name,
            description: subjectData.description,
            createdAt: subjectData.createdAt.toDate(),
            totalCards: subjectData.totalCards || 0,
            color: subjectData.color || "#4f46e5"
          });
          
          // Buscar flashcards
          const flashcardsRef = collection(db, "users", auth.currentUser.uid, "subjects", params.subjectId, "flashcards");
          const flashcardsSnap = await getDocs(flashcardsRef);
          
          const loadedFlashcards: Flashcard[] = [];
          flashcardsSnap.forEach((doc) => {
            const data = doc.data();
            loadedFlashcards.push({
              id: doc.id,
              question: data.question,
              answer: data.answer,
              lastReviewed: data.lastReviewed ? data.lastReviewed.toDate() : null,
              nextReview: data.nextReview ? data.nextReview.toDate() : null,
              reviewCount: data.reviewCount || 0,
              difficulty: data.difficulty || 'medium'
            });
          });
          
          setFlashcards(loadedFlashcards);
        } else {
          toast({
            title: "Erro",
            description: "Matéria não encontrada",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes da matéria:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da matéria",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjectDetails();
  }, [params.subjectId, toast]);

  // Adicionar novo flashcard
  const handleAddFlashcard = async () => {
    if (!auth.currentUser || !newQuestion.trim() || !newAnswer.trim()) return;
    
    try {
      const flashcardData = {
        question: newQuestion,
        answer: newAnswer,
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // próxima revisão em 1 dia
        reviewCount: 0,
        difficulty: 'medium'
      };
      
      const flashcardsRef = collection(db, "users", auth.currentUser.uid, "subjects", params.subjectId, "flashcards");
      const docRef = await addDoc(flashcardsRef, flashcardData);
      
      const newFlashcard = {
        id: docRef.id,
        ...flashcardData,
        difficulty: 'medium' as 'easy' | 'medium' | 'hard'
      };
      
      setFlashcards([...flashcards, newFlashcard]);
      
      // Atualizar contador de cards na matéria
      if (subject) {
        const subjectRef = doc(db, "users", auth.currentUser.uid, "subjects", params.subjectId);
        await updateDoc(subjectRef, {
          totalCards: (subject.totalCards || 0) + 1
        });
        
        setSubject({
          ...subject,
          totalCards: (subject.totalCards || 0) + 1
        });
      }
      
      setNewQuestion('');
      setNewAnswer('');
      setNewCardOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Flashcard adicionado com sucesso"
      });
    } catch (error) {
      console.error("Erro ao adicionar flashcard:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o flashcard",
        variant: "destructive"
      });
    }
  };

  // Editar flashcard
  const handleEditFlashcard = async () => {
    if (!auth.currentUser || !currentFlashcard || !newQuestion.trim() || !newAnswer.trim()) return;
    
    try {
      const flashcardRef = doc(db, "users", auth.currentUser.uid, "subjects", params.subjectId, "flashcards", currentFlashcard.id);
      
      await updateDoc(flashcardRef, {
        question: newQuestion,
        answer: newAnswer,
        updatedAt: new Date()
      });
      
      const updatedFlashcards = flashcards.map(card => 
        card.id === currentFlashcard.id 
          ? { ...card, question: newQuestion, answer: newAnswer }
          : card
      );
      
      setFlashcards(updatedFlashcards);
      setEditCardOpen(false);
      setCurrentFlashcard(null);
      setNewQuestion('');
      setNewAnswer('');
      
      toast({
        title: "Sucesso",
        description: "Flashcard atualizado com sucesso"
      });
    } catch (error) {
      console.error("Erro ao editar flashcard:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o flashcard",
        variant: "destructive"
      });
    }
  };

  // Excluir flashcard
  const handleDeleteFlashcard = async (id: string) => {
    if (!auth.currentUser) return;
    
    try {
      const flashcardRef = doc(db, "users", auth.currentUser.uid, "subjects", params.subjectId, "flashcards", id);
      await deleteDoc(flashcardRef);
      
      const updatedFlashcards = flashcards.filter(card => card.id !== id);
      setFlashcards(updatedFlashcards);
      
      // Atualizar contador de cards na matéria
      if (subject) {
        const subjectRef = doc(db, "users", auth.currentUser.uid, "subjects", params.subjectId);
        await updateDoc(subjectRef, {
          totalCards: Math.max((subject.totalCards || 0) - 1, 0)
        });
        
        setSubject({
          ...subject,
          totalCards: Math.max((subject.totalCards || 0) - 1, 0)
        });
      }
      
      toast({
        title: "Sucesso",
        description: "Flashcard excluído com sucesso"
      });
    } catch (error) {
      console.error("Erro ao excluir flashcard:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o flashcard",
        variant: "destructive"
      });
    }
  };

  // Iniciar sessão de estudo
  const startStudySession = () => {
    const cardsForStudy = [...flashcards]
      .sort((a, b) => {
        if (!a.nextReview) return -1;
        if (!b.nextReview) return 1;
        return a.nextReview.getTime() - b.nextReview.getTime();
      })
      .slice(0, 10); // Limitar a 10 cards por sessão
    
    setStudyCards(cardsForStudy);
    setCurrentStudyIndex(0);
    setShowAnswer(false);
    setStudySessionOpen(true);
  };

  // Atualizar progresso do flashcard após estudo
  const updateFlashcardProgress = async (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!auth.currentUser || !studyCards[currentStudyIndex]) return;
    
    const card = studyCards[currentStudyIndex];
    const today = new Date();
    
    // Algoritmo simples de espaçamento de repetição
    const daysToAdd = 
      difficulty === 'easy' ? Math.pow(2, card.reviewCount + 1) : 
      difficulty === 'medium' ? Math.pow(1.5, card.reviewCount + 1) : 
      1; // Para 'hard', revisão no dia seguinte
    
    const nextReviewDate = new Date();
    nextReviewDate.setDate(today.getDate() + Math.max(1, Math.floor(daysToAdd)));
    
    try {
      const flashcardRef = doc(db, "users", auth.currentUser.uid, "subjects", params.subjectId, "flashcards", card.id);
      
      await updateDoc(flashcardRef, {
        lastReviewed: today,
        nextReview: nextReviewDate,
        reviewCount: (card.reviewCount || 0) + 1,
        difficulty: difficulty
      });
      
      // Atualizar estado local
      const updatedFlashcards = flashcards.map(f => 
        f.id === card.id 
          ? { 
              ...f, 
              lastReviewed: today, 
              nextReview: nextReviewDate, 
              reviewCount: (f.reviewCount || 0) + 1,
              difficulty: difficulty 
            }
          : f
      );
      
      setFlashcards(updatedFlashcards);
      
      // Avançar para o próximo card
      if (currentStudyIndex < studyCards.length - 1) {
        setCurrentStudyIndex(currentStudyIndex + 1);
        setShowAnswer(false);
      } else {
        // Finalizar sessão de estudo
        toast({
          title: "Sessão concluída",
          description: `Você revisou ${studyCards.length} flashcards com sucesso!`
        });
        setStudySessionOpen(false);
      }
    } catch (error) {
      console.error("Erro ao atualizar progresso do flashcard:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso do estudo",
        variant: "destructive"
      });
    }
  };

  // Renderizar badge de dificuldade
  const renderDifficultyBadge = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy':
        return <Badge className="bg-green-500 hover:bg-green-600">Fácil</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Médio</Badge>;
      case 'hard':
        return <Badge className="bg-red-500 hover:bg-red-600">Difícil</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Carregando detalhes da matéria...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="container py-10">
        <div className="p-6 bg-card rounded-lg flex flex-col items-center gap-4">
          <h1 className="text-xl font-semibold">Matéria não encontrada</h1>
          <Link href="/study">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar para matérias
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center">
        <Link href="/study">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback style={{ backgroundColor: subject.color }}>
                  {subject.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{subject.name}</CardTitle>
                <CardDescription>{subject.description}</CardDescription>
              </div>
            </div>
            <Button 
              variant="default" 
              onClick={startStudySession}
              disabled={flashcards.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Estudo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex gap-4 flex-wrap">
            <div className="bg-card border rounded-lg p-4 flex flex-col items-center">
              <span className="text-muted-foreground text-sm">Total de Flashcards</span>
              <span className="text-2xl font-bold">{subject.totalCards}</span>
            </div>
            <div className="bg-card border rounded-lg p-4 flex flex-col items-center">
              <span className="text-muted-foreground text-sm">Para revisar hoje</span>
              <span className="text-2xl font-bold">
                {flashcards.filter(card => card.nextReview && card.nextReview <= new Date()).length}
              </span>
            </div>
            <div className="bg-card border rounded-lg p-4 flex flex-col items-center">
              <span className="text-muted-foreground text-sm">Próximas 24h</span>
              <span className="text-2xl font-bold">
                {flashcards.filter(card => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  return card.nextReview && card.nextReview > new Date() && card.nextReview <= tomorrow;
                }).length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Flashcards</h2>
        <Button onClick={() => setNewCardOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Flashcard
        </Button>
      </div>
      
      {flashcards.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Nenhum flashcard encontrado para esta matéria.</p>
          <Button variant="outline" onClick={() => setNewCardOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar primeiro flashcard
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcards.map((card) => (
            <Card key={card.id} className="flex flex-col h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{card.question}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2 grow">
                <p className="text-muted-foreground line-clamp-3">{card.answer}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  {renderDifficultyBadge(card.difficulty)}
                  {card.nextReview && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <RotateCcw className="h-3 w-3" />
                            {new Date(card.nextReview).toLocaleDateString()}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Próxima revisão</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setCurrentFlashcard(card);
                      setNewQuestion(card.question);
                      setNewAnswer(card.answer);
                      setEditCardOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteFlashcard(card.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Modal para adicionar flashcard */}
      <Dialog open={newCardOpen} onOpenChange={setNewCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Flashcard</DialogTitle>
            <DialogDescription>
              Adicione um novo flashcard à matéria {subject.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="question">Pergunta</Label>
              <Textarea 
                id="question" 
                placeholder="Digite a pergunta" 
                value={newQuestion} 
                onChange={(e) => setNewQuestion(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="answer">Resposta</Label>
              <Textarea 
                id="answer" 
                placeholder="Digite a resposta" 
                value={newAnswer} 
                onChange={(e) => setNewAnswer(e.target.value)}
                className="resize-none"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCardOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddFlashcard}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para editar flashcard */}
      <Dialog open={editCardOpen} onOpenChange={setEditCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Flashcard</DialogTitle>
            <DialogDescription>
              Atualize as informações do flashcard
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-question">Pergunta</Label>
              <Textarea 
                id="edit-question" 
                placeholder="Digite a pergunta" 
                value={newQuestion} 
                onChange={(e) => setNewQuestion(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-answer">Resposta</Label>
              <Textarea 
                id="edit-answer" 
                placeholder="Digite a resposta" 
                value={newAnswer} 
                onChange={(e) => setNewAnswer(e.target.value)}
                className="resize-none"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCardOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditFlashcard}>Atualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de sessão de estudo */}
      <Dialog open={studySessionOpen} onOpenChange={setStudySessionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sessão de Estudo</DialogTitle>
            <DialogDescription>
              Card {currentStudyIndex + 1} de {studyCards.length}
            </DialogDescription>
          </DialogHeader>
          
          {studyCards.length > 0 && studyCards[currentStudyIndex] && (
            <div className="py-4">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-xl">Pergunta</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{studyCards[currentStudyIndex].question}</p>
                </CardContent>
              </Card>
              
              {showAnswer ? (
                <>
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-xl">Resposta</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{studyCards[currentStudyIndex].answer}</p>
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-center gap-3 mt-4">
                    <Button 
                      onClick={() => updateFlashcardProgress('hard')}
                      variant="outline"
                      className="border-red-500 hover:bg-red-500/10 text-red-500"
                    >
                      Difícil
                    </Button>
                    <Button 
                      onClick={() => updateFlashcardProgress('medium')}
                      variant="outline"
                      className="border-yellow-500 hover:bg-yellow-500/10 text-yellow-500"
                    >
                      Médio
                    </Button>
                    <Button 
                      onClick={() => updateFlashcardProgress('easy')}
                      variant="outline"
                      className="border-green-500 hover:bg-green-500/10 text-green-500"
                    >
                      Fácil
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex justify-center">
                  <Button onClick={() => setShowAnswer(true)}>
                    Mostrar Resposta
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudySessionOpen(false)}>
              Encerrar Sessão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 