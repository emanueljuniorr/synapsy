import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { redirect } from 'next/navigation';
import FlashcardForm from './FlashcardForm.client';

type Props = {
  params: Promise<{ subjectId: string }>;
};

export default async function CreateFlashcardPage({ params }: Props) {
  const { subjectId } = await params;
  
  // Como estamos em um Server Component, mas o Firebase Auth é client-side,
  // vamos verificar o usuário no FlashcardForm.client.tsx
  // Aqui apenas carregamos os dados da matéria

  // Esta é uma solução temporária - em produção, você deve implementar
  // uma verificação de autenticação adequada para Server Components
  try {
    // Verificamos apenas se a matéria existe
    // A verificação de auth será feita no cliente
    const subjectRef = doc(db, 'users', auth.currentUser?.uid || 'anonymous', 'subjects', subjectId);
    const subjectDoc = await getDoc(subjectRef);
    
        if (!subjectDoc.exists()) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Matéria não encontrada</h1>
              <p className="text-muted-foreground mb-4">A matéria que você está procurando não existe ou você não tem permissão para acessá-la.</p>
            </div>
          </div>
        </div>
      );
        }
        
        const data = subjectDoc.data();
    const subject = {
          id: subjectDoc.id,
          name: data.name,
          color: data.color || "#4F46E5",
    };
    
    return <FlashcardForm subject={subject} subjectId={subjectId} />;
  } catch (error) {
    // Em caso de erro, passamos para o FlashcardForm
    // e deixamos que ele lide com a busca de dados no cliente
    const defaultSubject = {
      id: subjectId,
      name: 'Carregando...',
      color: "#4F46E5",
    };
    
    return <FlashcardForm subject={defaultSubject} subjectId={subjectId} />;
  }
} 