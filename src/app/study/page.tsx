'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, BookOpen, BrainCircuit, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';

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

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const subjectsRef = query(
          collection(db, 'subjects'),
          where('userId', '==', auth.currentUser.uid)
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
    
    fetchSubjects();
  }, [toast]);

  const filteredSubjects = subjects.filter(subject => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return subject.name.toLowerCase().includes(query) || 
           subject.description.toLowerCase().includes(query);
  });

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
          {/* Cabeçalho com gradiente e efeito de vidro */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl" />
            <div className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center">
                    <BrainCircuit className="mr-3 h-8 w-8" />
                    Estudos
                  </h1>
                  <p className="text-foreground/60 mt-1">
                    Gerencie suas matérias e flashcards com repetição espaçada
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/study/new')}
                  className="group relative px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nova Matéria</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
                </Button>
              </div>

              <div className="relative mt-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <Input
                  type="text"
                  placeholder="Buscar matérias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
              <p className="text-lg font-medium text-foreground/70">Carregando matérias...</p>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <Card className="p-6 text-center border border-white/10 backdrop-blur-lg bg-white/5">
              <h2 className="text-xl font-medium mb-4">Nenhuma matéria encontrada</h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? "Tente usar termos diferentes na busca" : "Adicione sua primeira matéria para começar a estudar com repetição espaçada."}
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push('/study/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Matéria
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubjects.map(subject => (
                <Link href={`/study/${subject.id}`} key={subject.id} className="block">
                  <Card className="p-5 h-full cursor-pointer hover:shadow-md transition-shadow bg-white/5 border border-white/10 backdrop-blur-lg">
                    <div className="flex items-center mb-4">
                      <div 
                        className={cn(
                          "w-3 h-10 rounded-sm mr-3",
                        )}
                        style={{ backgroundColor: subject.color }}
                      />
                      <div>
                        <h2 className="text-xl font-medium">{subject.name}</h2>
                        {subject.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {subject.description}
                          </p>
                        )}
                      </div>
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
      </div>
    </MainLayout>
  );
} 