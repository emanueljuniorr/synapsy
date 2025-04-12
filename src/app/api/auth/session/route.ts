// API que utiliza Firebase Admin, só pode ser executada em Node.js Runtime
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { app, verifyToken } from '@/lib/firebase-admin';

// Duração do cookie de sessão (5 dias)
const SESSION_EXPIRATION_TIME = 60 * 60 * 24 * 5 * 1000; // 5 dias em milissegundos

/**
 * API para criar um cookie de sessão a partir do token ID do Firebase
 * Aceita requisições POST com token ID no body
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json(
        { error: 'ID Token não fornecido' },
        { status: 400 }
      );
    }
    
    // Criar cookie de sessão com Firebase Admin
    const sessionCookie = await app.auth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRATION_TIME,
    });
    
    // Configurar cookie na resposta
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'session',
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_EXPIRATION_TIME / 1000, // Converter para segundos
      path: '/',
      sameSite: 'lax',
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    return NextResponse.json(
      { error: 'Falha ao criar sessão' },
      { status: 401 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }
    
    // Verificar se o cookie de sessão é válido
    const decodedToken = await verifyToken(sessionCookie);
    
    return NextResponse.json({
      authenticated: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE() {
  try {
    // Limpar o cookie de sessão
    const cookieStore = await cookies();
    cookieStore.delete('session');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao encerrar sessão:', error);
    return NextResponse.json(
      { error: 'Falha ao encerrar sessão' },
      { status: 500 }
    );
  }
} 