'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, Plus, Edit, BookOpen, Clock, Calendar, Layers, CalendarClock, RotateCcw, Trash } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import MainLayout from '@/components/layout/MainLayout';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  lastReviewed: Date | null;
  nextReview: Date | null;
  reviewCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  repetitions: number;
  easeFactor: number;
  interval: number;
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
  const unwrappedParams = use(params);
  const subjectId = unwrappedParams.subjectId;
  
  const { toast } = useToast();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCardOpen, setNewCardOpen] = useState(false);
  const [editCardOpen, setEditCardOpen] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [flashcardToDelete, setFlashcardToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Carregar dados da matéria
  useEffect(() => {
    let isComponentMounted = true;
    
    const fetchSubjectDetails = async () => {
      // Definir safetyTimer fora do bloco try para estar acessível no finally
      let safetyTimer: NodeJS.Timeout;
      
      try {
        setLoading(true);
        
        // Timer de segurança para evitar carregamento infinito
        safetyTimer = setTimeout(() => {
          if (isComponentMounted) {
            console.log("Timer de segurança acionado: carregamento excedeu tempo limite");
            setLoading(false);
            toast({
              title: "Erro de tempo limite",
              description: "O carregamento demorou muito. Tente novamente.",
              variant: "destructive"
            });
            router.push('/study');
          }
        }, 10000); // 10 segundos
        
        // Verificar se o usuário está autenticado
        if (!auth.currentUser) {
          clearTimeout(safetyTimer);
          console.log("Usuário não autenticado ao tentar acessar matéria");
          toast({
            title: "Acesso negado",
            description: "Você precisa estar logado para acessar esta página",
            variant: "destructive"
          });
          router.push('/auth/login');
          return;
        }
        
        // Buscar a matéria diretamente da coleção 'subjects'
        const subjectRef = doc(db, "subjects", subjectId);
        const subjectDoc = await getDoc(subjectRef);
        
        if (subjectDoc.exists()) {
          const subjectData = subjectDoc.data();
          
          // Verificar se a matéria pertence ao usuário atual
          if (subjectData.userId !== auth.currentUser.uid) {
            toast({
              title: "Erro",
              description: "Você não tem permissão para acessar esta matéria",
              variant: "destructive"
            });
            router.push('/study');
            return;
          }
          
          setSubject({
            id: subjectDoc.id,
            name: subjectData.name,
            description: subjectData.description || '',
            createdAt: subjectData.createdAt.toDate(),
            totalCards: subjectData.flashcardsCount || 0,
            color: subjectData.color || "#4f46e5"
          });
          
          // Buscar flashcards relacionados a esta matéria
          const flashcardsRef = collection(db, "flashcards");
          const flashcardsQuery = query(
            flashcardsRef,
            where('subjectId', '==', subjectId),
            where('userId', '==', auth.currentUser.uid)
          );
          const flashcardsSnap = await getDocs(flashcardsQuery);
          
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
              difficulty: data.difficulty || 'medium',
              repetitions: data.repetitions || 0,
              easeFactor: data.easeFactor || 2.5,
              interval: data.interval || 0,
            });
          });
          
          setFlashcards(loadedFlashcards);
        } else {
          toast({
            title: "Erro",
            description: "Matéria não encontrada",
            variant: "destructive"
          });
          router.push('/study');
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes da matéria:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da matéria",
          variant: "destructive"
        });
        router.push('/study');
      } finally {
        clearTimeout(safetyTimer);
        if (isComponentMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchSubjectDetails();
    
    // Cleanup
    return () => {
      isComponentMounted = false;
    };
  }, [subjectId, toast, router]);

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
        difficulty: 'medium',
        repetitions: 0,
        easeFactor: 2.5,
        interval: 0,
        subjectId: subjectId,
        userId: auth.currentUser.uid
      };
      
      // Adicionar à coleção 'flashcards'
      const flashcardsRef = collection(db, "flashcards");
      const docRef = await addDoc(flashcardsRef, flashcardData);
      
      const newFlashcard = {
        id: docRef.id,
        ...flashcardData,
        difficulty: 'medium' as 'easy' | 'medium' | 'hard'
      };
      
      setFlashcards([...flashcards, newFlashcard]);
      
      // Atualizar contador de cards na matéria
      if (subject) {
        // Atualizar a matéria na coleção 'subjects'
        const subjectRef = doc(db, "subjects", subjectId);
        await updateDoc(subjectRef, {
          flashcardsCount: (subject.totalCards || 0) + 1
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
      // Atualizar na coleção flashcards
      const flashcardRef = doc(db, "flashcards", currentFlashcard.id);
      
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

  // Deletar flashcard
  const confirmDeleteFlashcard = (flashcardId: string) => {
    setFlashcardToDelete(flashcardId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteFlashcardConfirm = async () => {
    if (!flashcardToDelete || !auth.currentUser) return;
    
    try {
      // Excluir da coleção flashcards
      await deleteDoc(doc(db, 'flashcards', flashcardToDelete));
      
      // Atualizar a lista removendo o flashcard deletado
      setFlashcards(flashcards.filter(card => card.id !== flashcardToDelete));
      
      toast({
        title: "Flashcard deletado",
        description: "O flashcard foi removido com sucesso",
      });
      
      // Atualizar contador de cards na matéria
      if (subject) {
        // Atualizar na coleção subjects
        const subjectRef = doc(db, "subjects", subjectId);
        await updateDoc(subjectRef, {
          flashcardsCount: Math.max((subject.totalCards || 0) - 1, 0)
        });
        
        setSubject({
          ...subject,
          totalCards: Math.max((subject.totalCards || 0) - 1, 0)
        });
      }
    } catch (error) {
      console.error('Erro ao deletar flashcard:', error);
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível remover o flashcard",
        variant: "destructive",
      });
    } finally {
      setFlashcardToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Calcular quantos flashcards estão para revisão hoje
  const calculateDueCards = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Fim do dia de hoje
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dueToday = flashcards.filter(card => {
      if (!card.nextReview) return true; // Nunca revisado
      const reviewDate = new Date(card.nextReview);
      return reviewDate <= today;
    }).length;
    
    const dueTomorrow = flashcards.filter(card => {
      if (!card.nextReview) return false;
      const reviewDate = new Date(card.nextReview);
      return reviewDate > today && reviewDate <= tomorrow;
    }).length;
    
    return { dueToday, dueTomorrow };
  };

  const { dueToday, dueTomorrow } = calculateDueCards();

  // Iniciar sessão de estudo
  const startStudySession = () => {
    if (dueToday === 0) {
      toast({
        title: "Sem flashcards para revisar",
        description: "Não há flashcards para revisar agora. Tente mais tarde ou adicione novos flashcards.",
      });
      return;
    }
    
    router.push(`/study/${subjectId}/study`);
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

  // Filtrar flashcards pela busca
  const filteredFlashcards = flashcards.filter(card => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return card.question.toLowerCase().includes(query) || 
           card.answer.toLowerCase().includes(query);
  });

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

  if (!subject) {
    return (
      <MainLayout>
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header com informações da matéria */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl" />
            <div className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <button 
                      onClick={() => router.push('/study')}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                      {subject?.name}
                    </h1>
                  </div>
                  <p className="text-foreground/60">{subject?.description}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {dueToday > 0 && (
                    <Button 
                      onClick={startStudySession}
                      className="group relative px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2"
                    >
                      <BookOpen size={18} />
                      Iniciar Estudo ({dueToday})
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
                    </Button>
                  )}
                  <Button 
                    onClick={() => setNewCardOpen(true)}
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Novo Flashcard
                  </Button>
                </div>
              </div>

              <div className="relative mt-6">
                <div className="flex items-center absolute inset-y-0 left-0 pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-white/40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                </div>
                <Input
                  type="text"
                  placeholder="Buscar flashcards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Estatísticas de estudo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-white/5 border border-white/10 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Flashcards</p>
                  <p className="text-2xl font-bold">{flashcards.length}</p>
                </div>
                <Layers className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
            
            <Card className="p-4 bg-white/5 border border-white/10 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Para revisar hoje</p>
                  <p className="text-2xl font-bold">{dueToday}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
            
            <Card className="p-4 bg-white/5 border border-white/10 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Próximas 24h</p>
                  <p className="text-2xl font-bold">{dueTomorrow}</p>
                </div>
                <CalendarClock className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
            
            <Card className="p-4 bg-white/5 border border-white/10 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="text-2xl font-bold">{subject?.createdAt ? format(new Date(subject.createdAt), 'dd/MM/yyyy') : '-'}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Flashcards</h2>
          </div>
          
          {filteredFlashcards.length === 0 ? (
            <Card className="p-6 text-center bg-white/5 border border-white/10 backdrop-blur-lg">
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Nenhum flashcard encontrado para esta busca." 
                  : "Nenhum flashcard encontrado para esta matéria."}
              </p>
              {!searchQuery && (
                <Button variant="outline" onClick={() => setNewCardOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro flashcard
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFlashcards.map((card) => (
                <Card key={card.id} className="flex flex-col h-full bg-white/5 border border-white/10 backdrop-blur-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{card.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2 grow">
                    <p className="text-muted-foreground line-clamp-3">{card.answer}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      {renderDifficultyBadge(card.difficulty)}
                      {card.nextReview && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="flex items-center gap-1 border-white/20">
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
                        onClick={() => confirmDeleteFlashcard(card.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {/* Modal para adicionar flashcard */}
          <Dialog open={newCardOpen} onOpenChange={setNewCardOpen}>
            <DialogContent className="bg-background/95 backdrop-blur-lg border border-white/10">
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
                    className="resize-none bg-white/5 border-white/10"
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
                    className="resize-none bg-white/5 border-white/10"
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
            <DialogContent className="bg-background/95 backdrop-blur-lg border border-white/10">
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
                    className="resize-none bg-white/5 border-white/10"
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
                    className="resize-none bg-white/5 border-white/10"
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
          
          {/* Dialog de confirmação para deletar flashcard */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="bg-background/95 backdrop-blur-lg border border-white/10">
              <DialogHeader>
                <DialogTitle>Confirmar exclusão</DialogTitle>
              </DialogHeader>
              <p>Tem certeza que deseja excluir este flashcard? Esta ação não pode ser desfeita.</p>
              <div className="flex justify-end gap-3 mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDeleteFlashcardConfirm}>
                  Excluir
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </MainLayout>
  );
} 