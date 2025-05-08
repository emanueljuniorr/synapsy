'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Palette, BookOpen } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const COLORS = [
  '#4F46E5', // indigo
  '#8B5CF6', // violet
  '#D946EF', // fuchsia
  '#EC4899', // pink
  '#F43F5E', // rose
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#10B981', // emerald
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#6366F1', // indigo
];

export default function NewSubjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica se o usuário está logado através do contexto
    if (!user) {
      console.log("Usuário não encontrado no contexto. Tentando verificar auth.currentUser...");
      
      // Verifica se existe um usuário logado diretamente pelo auth do Firebase
      if (!auth.currentUser) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar uma matéria",
          variant: "destructive",
        });
        router.push('auth/login');
        return;
      }
    }
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da matéria é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Tentar obter o ID por todas as formas possíveis
      const userId = user?.uid || user?.id || auth.currentUser?.uid;
      
      console.log("Dados do usuário:", {
        userFromContext: user ? { id: user.id, uid: user.uid } : null,
        userFromAuth: auth.currentUser ? { uid: auth.currentUser.uid } : null,
        resolvedUserId: userId
      });
      
      // Se ainda assim não tiver o ID, exibir um erro mais detalhado
      if (!userId) {
        console.error("Falha ao obter ID do usuário:", { 
          contextUser: user, 
          firebaseUser: auth.currentUser 
        });
        throw new Error("ID de usuário não disponível. Verifique se você está corretamente logado.");
      }
      
      // Criar nova matéria
      const subjectData = {
        name,
        description: description || '',
        color: color || COLORS[0],
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        flashcardsCount: 0,
      };
      
      //console.log("Criando matéria com dados:", subjectData);
      
      const docRef = await addDoc(collection(db, 'subjects'), subjectData);
      
      toast({
        title: "Sucesso",
        description: "Matéria criada com sucesso",
      });
      
      // Navegar para a página da matéria
      router.push(`/study/${docRef.id}`);
    } catch (error) {
      console.error('Erro ao criar matéria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a matéria",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Elementos decorativos espaciais */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary rounded-full animate-twinkle" />
          <div className="absolute top-40 right-1/3 w-1 h-1 bg-primary rounded-full animate-twinkle delay-100" />
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary rounded-full animate-twinkle delay-200" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Cabeçalho com gradiente e efeito de vidro */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl" />
            <div className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.push('/study')}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center">
                    <BookOpen className="mr-3 h-6 w-6" />
                    Nova Matéria
                  </h1>
                  <p className="text-foreground/60 mt-1">
                    Crie uma matéria para organizar seus flashcards de estudo
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="p-6 bg-background/20 backdrop-blur-lg border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Matéria</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Matemática, Biologia, Inglês..."
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descrição do conteúdo da matéria..."
                  rows={3}
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette size={16} />
                  <Label>Cor</Label>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((colorOption) => (
                    <button
                      key={colorOption}
                      type="button"
                      onClick={() => setColor(colorOption)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        color === colorOption 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-background' 
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: colorOption }}
                      aria-label={`Cor ${colorOption}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => router.push('/study')}
                  variant="outline"
                  className="bg-white/5 hover:bg-white/10 border-white/10"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !name.trim()}
                  className="bg-primary/80 hover:bg-primary text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Criando...
                    </>
                  ) : (
                    'Criar Matéria'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 