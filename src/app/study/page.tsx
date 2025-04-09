'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, BookOpen, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

interface Subject {
  id: string;
  name: string;
  color: string;
  totalFlashcards: number;
  dueFlashcards: number;
}

export default function StudyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const subjectsRef = collection(db, 'users', auth.currentUser.uid, 'subjects');
        const subjectsSnapshot = await getDocs(subjectsRef);
        
        const subjectsPromises = subjectsSnapshot.docs.map(async (docSnap) => {
          const subjectData = docSnap.data();
          const flashcardsRef = collection(db, 'users', auth.currentUser.uid, 'subjects', docSnap.id, 'flashcards');
          const flashcardsSnapshot = await getDocs(flashcardsRef);
          
          // Contar flashcards com revisão para hoje
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          let dueCount = 0;
          flashcardsSnapshot.docs.forEach(flashcardDoc => {
            const flashcard = flashcardDoc.data();
            if (!flashcard.nextReview) {
              dueCount++; // Novo flashcard nunca revisado
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
    
    fetchSubjects();
  }, [toast]);

  return (
    <div className="flex min-h-screen flex-col p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <BrainCircuit className="mr-2 h-6 w-6" />
          Estudos
        </h1>
        <Button onClick={() => router.push('/study/new')} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Matéria
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium">Carregando matérias...</p>
        </div>
      ) : subjects.length === 0 ? (
        <Card className="p-6 text-center">
          <h2 className="text-xl font-medium mb-4">Nenhuma matéria encontrada</h2>
          <p className="text-muted-foreground mb-6">
            Adicione sua primeira matéria para começar a estudar com repetição espaçada.
          </p>
          <Button onClick={() => router.push('/study/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Matéria
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <Link href={`/study/${subject.id}`} key={subject.id}>
              <Card className="p-5 h-full cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div 
                    className={cn(
                      "w-3 h-10 rounded-sm mr-3",
                    )}
                    style={{ backgroundColor: subject.color }}
                  />
                  <h2 className="text-xl font-medium">{subject.name}</h2>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm">
                    <p>
                      <span className="font-medium text-primary">{subject.dueFlashcards}</span>
                      {' '}para revisar hoje
                    </p>
                    <p className="text-muted-foreground">
                      Total: {subject.totalFlashcards} flashcards
                    </p>
                  </div>
                  
                  {subject.dueFlashcards > 0 && (
                    <Button variant="ghost" size="sm" className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Estudar
                    </Button>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 