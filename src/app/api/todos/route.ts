// API que utiliza Firebase Admin, só pode ser executada em Node.js Runtime
export const runtime = 'nodejs';

import { NextResponse, NextRequest } from 'next/server';
import { hasReachedTodosLimit } from '@/lib/subscription';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/firebase-admin-init';
import { getToken } from 'next-auth/jwt';

export async function POST(request: Request) {
  try {
    // Verificar se o usuário possui um token de autenticação válido
    const authToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar o token com o Firebase
    const decodedToken = await getAuth().verifyIdToken(authToken);
    const userId = decodedToken.uid;
    
    // Verificar se o usuário atingiu o limite de tarefas no plano Free
    const reachedLimit = await hasReachedTodosLimit(userId);
    if (reachedLimit) {
      return NextResponse.json({
        error: 'Limite de tarefas atingido',
        message: 'Você atingiu o limite de tarefas do plano Free. Faça upgrade para o plano Pro para criar mais tarefas.',
        code: 'LIMIT_REACHED'
      }, { status: 403 });
    }

    // Obter dados da requisição
    const data = await request.json();
    const { title, description, dueDate, priority, completed = false } = data;

    if (!title) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
    }
    
    // Criar nova tarefa no Firestore
    const todosCollection = db.collection('todos');
    const newTodo = {
      userId,
      title,
      description: description || '',
      dueDate: dueDate || null,
      priority: priority || 'medium',
      completed,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await todosCollection.add(newTodo);
    
    return NextResponse.json({
      id: docRef.id,
      ...newTodo,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    if (!token || !token.sub) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const userId = token.sub;
    
    const todosSnapshot = await db.collection('users').doc(userId).collection('todos').get();
    
    const todos = todosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return new Response(JSON.stringify(todos), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao buscar todos:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar todos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 