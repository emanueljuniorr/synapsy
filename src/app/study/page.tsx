'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, BookOpen, BrainCircuit, Search, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import Input from '@/components/ui/Input';
import ConfirmationDialog from '@/components/ui/confirmationDialog';

interface Subject {
  id: string;
  name: string;
  color: string;
  description: string;
  totalFlashcards: number;
  dueFlashcards: number;
}

export default function StudyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, [toast, router]);

  const fetchSubjects = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para visualizar suas matérias",
        variant: "destructive",
      });
      router.push('/auth/login');
      setLoading(false);
      return;
    }
    
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error("ID de usuário não disponível");
        setLoading(false);
        return;
      }
      
      const subjectsRef = query(
        collection(db, 'subjects'),
        where('userId', '==', userId)
      );
      const subjectsSnapshot = await getDocs(subjectsRef);
      
      const subjectsPromises = subjectsSnapshot.docs.map(async (docSnap) => {
        const subjectData = docSnap.data();
        const flashcardsRef = collection(db, 'flashcards');
        const flashcardsQuery = query(
          flashcardsRef,
          where('subjectId', '==', docSnap.id)
        );
        const flashcardsSnapshot = await getDocs(flashcardsQuery);
    
    const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        let dueCount = 0;
        flashcardsSnapshot.docs.forEach(flashcardDoc => {
          const flashcard = flashcardDoc.data();
          if (!flashcard.nextReview) {
            dueCount++;
  } else {
            const nextReview = flashcard.nextReview.toDate ? 
                  flashcard.nextReview.toDate() : 
                  new Date(flashcard.nextReview);
            if (nextReview <= today) {
              dueCount++;
            }
          }
        });
        
        return {
          id: docSnap.id,
            name: subjectData.name, 
          description: subjectData.description || '',
          color: subjectData.color || '#4F46E5',
          totalFlashcards: flashcardsSnapshot.size,
          dueFlashcards: dueCount
        };
      });
      
      const subjectsData = await Promise.all(subjectsPromises);
      setSubjects(subjectsData);
      
    } catch (error) {
      console.error('Erro ao carregar matérias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas matérias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = (id: string) => {
    setSubjectToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;

    try {
      setIsDeleting(true);
      // Primeiro exclui os flashcards associados à matéria
      const flashcardsRef = collection(db, 'flashcards');
      const flashcardsQuery = query(
        flashcardsRef,
        where('subjectId', '==', subjectToDelete)
      );
      const flashcardsSnapshot = await getDocs(flashcardsQuery);

      // Exclusão em lote dos flashcards
      const deletePromises = flashcardsSnapshot.docs.map(docSnap => 
        deleteDoc(doc(db, 'flashcards', docSnap.id))
      );
      await Promise.all(deletePromises);

      // Depois exclui a matéria
      await deleteDoc(doc(db, 'subjects', subjectToDelete));
      
      // Atualiza o estado
      setSubjects(subjects.filter(subject => subject.id !== subjectToDelete));
      
      toast({
        title: "Matéria excluída",
        description: "A matéria e todos os seus flashcards foram excluídos com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir matéria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a matéria",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSubjectToDelete(null);
    }
  };

  const cancelDeleteSubject = () => {
    setIsDeleteDialogOpen(false);
    setSubjectToDelete(null);
  };

  const filteredSubjects = subjects.filter(subject => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return subject.name.toLowerCase().includes(query) || 
           subject.description.toLowerCase().includes(query);
  });

  return (
    <MainLayout>
      <div className="mx-auto px-2 sm:px-4">
        {/* Header com gradiente e efeito de vidro */}
        <div className="relative mb-3 sm:mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl" />
          <div className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-6">
            <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Estudos
              </h1>
              <Link
                href="/study/new"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-primary/80 hover:bg-primary text-white rounded-xl transition-all duration-300 backdrop-blur-lg text-xs sm:text-base"
              >
                <Plus size={16} className="sm:text-lg" />
                <span>Nova Matéria</span>
              </Link>
            </div>
            
            <div className="relative mt-3 sm:mt-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                placeholder="Buscar matérias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 text-sm"
              />
            </div>
          </div>
        </div>
          
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl" />
            <div className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-12 flex flex-col items-center justify-center text-white/60">
              <p className="text-lg sm:text-xl mb-2">Nenhuma matéria encontrada</p>
              <p className="text-xs sm:text-sm">
                {searchQuery
                  ? 'Tente usar termos diferentes na busca'
                  : 'Comece criando uma nova matéria'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredSubjects.map(subject => (
              <Card 
                key={subject.id}
                className="p-4 h-full cursor-pointer hover:shadow-md transition-shadow bg-white/5 border border-white/10 backdrop-blur-lg"
                onClick={(e) => {
                  // Evitar que o clique no botão de excluir navegue para a matéria
                  if ((e.target as HTMLElement).closest('.delete-button')) return;
                  router.push(`/study/${subject.id}`);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base md:text-lg font-bold" style={{ color: subject.color }}>
                    {subject.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="delete-button h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubject(subject.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {subject.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {subject.description}
                  </p>
                )}
                
                <div className="flex mt-auto pt-3 border-t border-white/10">
                  <div className="text-xs md:text-sm">
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-medium">{subject.totalFlashcards} flashcards</span>
                  </div>
                  <div className="ml-auto text-xs md:text-sm">
                    <span className="text-muted-foreground">Para revisar: </span>
                    <span className={cn("font-medium", subject.dueFlashcards > 0 ? "text-amber-500" : "text-green-500")}>
                      {subject.dueFlashcards}
                    </span>
                  </div>
                </div>
                
                {subject.dueFlashcards > 0 && (
                  <Link 
                    href={`/study/${subject.id}/study`}
                    onClick={(e) => e.stopPropagation()}
                    className="block mt-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary-foreground p-2 rounded-md text-center text-sm transition-colors"
                  >
                    <BookOpen className="h-4 w-4 inline-block mr-1 opacity-80" />
                    Estudar agora
                  </Link>
                )}
              </Card>
            ))}
          </div>
        )}

        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title="Excluir Matéria"
          message="Tem certeza que deseja excluir esta matéria? Todos os flashcards associados também serão excluídos. Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          isDestructive={true}
          isSubmitting={isDeleting}
          onConfirm={confirmDeleteSubject}
          onCancel={cancelDeleteSubject}
        />
      </div>
    </MainLayout>
  );
} 