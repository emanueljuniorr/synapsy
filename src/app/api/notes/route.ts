import { NextResponse } from 'next/server';
import { hasReachedNotesLimit } from '@/lib/subscription';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/firebase-admin';

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
    
    // Verificar se o usuário atingiu o limite de notas no plano Free
    const reachedLimit = await hasReachedNotesLimit(userId);
    if (reachedLimit) {
      return NextResponse.json({
        error: 'Limite de notas atingido',
        message: 'Você atingiu o limite de notas do plano Free. Faça upgrade para o plano Pro para criar mais notas.',
        code: 'LIMIT_REACHED'
      }, { status: 403 });
    }

    // Obter dados da requisição
    const data = await request.json();
    const { title, content } = data;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Título e conteúdo são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar nova nota no Firestore
    const notesCollection = db.collection('notes');
    const newNote = {
      userId,
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await notesCollection.add(newNote);
    
    return NextResponse.json({
      id: docRef.id,
      ...newNote,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 