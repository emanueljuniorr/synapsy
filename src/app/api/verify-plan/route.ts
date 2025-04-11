// API que utiliza Firebase Admin, só pode ser executada em Node.js Runtime
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscription } from '@/lib/subscription';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/lib/firebase-admin';

// Inicializar Firebase Admin
initAdmin();

export async function GET(request: NextRequest) {
  try {
    // Obter a URL para onde redirecionar após a verificação
    const searchParams = request.nextUrl.searchParams;
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';

    // Obter o token de autenticação do cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      // Redirecionar para login se não estiver autenticado
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Verificar token com Firebase Admin
    const decodedToken = await getAuth().verifySessionCookie(sessionCookie);
    const userId = decodedToken.uid;

    // Verificar o plano do usuário
    const { isPro } = await getUserSubscription(userId);

    if (!isPro) {
      // Redirecionar para página de planos se não for Pro
      return NextResponse.redirect(new URL('/plans?upgrade=true', request.url));
    }

    // Usuário Pro, pode acessar a rota solicitada
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    console.error('Erro ao verificar plano:', error);
    // Em caso de erro, redirecionar para login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
} 