import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasReachedTodosLimit } from '@/lib/subscription';
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
    
    // Verifica se o usuário atingiu o limite de tarefas do plano Free
    const reachedLimit = await hasReachedTodosLimit(userId);
    
    if (reachedLimit) {
      return NextResponse.json(
        { error: FREE_PLAN_MESSAGES.todosLimitReached },
        { status: 403 }
      );
    }
    
    const { title = 'Nova Tarefa', completed = false } = await req.json();
    
    const todoData = {
      title,
      completed,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'todos'), todoData);
    
    return NextResponse.json({
      id: docRef.id,
      ...todoData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao criar tarefa' },
      { status: 500 }
    );
  }
} 