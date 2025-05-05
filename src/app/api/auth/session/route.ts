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
    // Verificar se o Firebase Admin está inicializado
    if (!app) {
      console.error('Firebase Admin não inicializado');
      return new NextResponse(
        JSON.stringify({ error: 'Serviço de autenticação não disponível' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { idToken } = await request.json();
    
    if (!idToken) {
      return new NextResponse(
        JSON.stringify({ error: 'ID Token não fornecido' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Criar cookie de sessão com Firebase Admin
    try {
      const sessionCookie = await app.auth().createSessionCookie(idToken, {
        expiresIn: SESSION_EXPIRATION_TIME,
      });
      
      // Configurar cookie na resposta
      const cookieStore = cookies();
      cookieStore.set({
        name: 'session',
        value: sessionCookie,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: SESSION_EXPIRATION_TIME / 1000, // Converter para segundos
        path: '/',
        sameSite: 'lax',
      });
      
      return new NextResponse(
        JSON.stringify({ success: true }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (authError) {
      console.error('Erro ao criar cookie de sessão:', authError);
      return new NextResponse(
        JSON.stringify({ error: 'Token inválido ou expirado' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Falha ao criar sessão' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
      return new NextResponse(
        JSON.stringify({ authenticated: false }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Verificar se o cookie de sessão é válido
    try {
      const decodedToken = await verifyToken(sessionCookie);
      
      return new NextResponse(
        JSON.stringify({
          authenticated: true,
          user: {
            uid: decodedToken.uid,
            email: decodedToken.email,
          },
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (tokenError) {
      // Token inválido ou expirado
      cookieStore.delete('session');
      
      return new NextResponse(
        JSON.stringify({ authenticated: false }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return new NextResponse(
      JSON.stringify({ authenticated: false }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function DELETE() {
  try {
    // Limpar o cookie de sessão
    const cookieStore = cookies();
    cookieStore.delete('session');
    
    return new NextResponse(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Erro ao encerrar sessão:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Falha ao encerrar sessão' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 