// API que utiliza Firebase Admin, só pode ser executada em Node.js Runtime
export const runtime = 'nodejs';

import { NextResponse, NextRequest } from 'next/server';
import { hasReachedNotesLimit } from '@/lib/subscription';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/firebase-admin';
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
    
    const notesSnapshot = await db.collection('users').doc(userId).collection('notes').get();
    
    const notes = notesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return new Response(JSON.stringify(notes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar notas' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 