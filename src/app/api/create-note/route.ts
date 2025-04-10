import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasReachedNotesLimit } from '@/lib/subscription';
import { FREE_PLAN_MESSAGES } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id as string;
    
    // Verifica se o usuário atingiu o limite de notas do plano Free
    const reachedLimit = await hasReachedNotesLimit(userId);
    
    if (reachedLimit) {
      return NextResponse.json(
        { error: FREE_PLAN_MESSAGES.notesLimitReached },
        { status: 403 }
      );
    }
    
    const { title = 'Nova Nota', content = '' } = await req.json();
    
    const noteData = {
      title,
      content,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'notes'), noteData);
    
    return NextResponse.json({
      id: docRef.id,
      ...noteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    return NextResponse.json(
      { error: 'Erro ao criar nota' },
      { status: 500 }
    );
  }
} 