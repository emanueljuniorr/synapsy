import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscription } from '@/lib/subscription';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/lib/firebase-admin';

// Lista de rotas que exigem plano Pro
const PRO_ONLY_ROUTES = [
  '/relax',
  '/focus',
  '/relax/',
  '/focus/'
];

// Inicializar Firebase Admin
initAdmin();

export async function middleware(request: NextRequest) {
  // Verificar se é uma rota que exige plano Pro
  const { pathname } = request.nextUrl;
  
  // Se não for uma rota restrita, continuar
  if (!PRO_ONLY_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  try {
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

    // Usuário Pro, pode acessar
    return NextResponse.next();
  } catch (error) {
    console.error('Erro no middleware:', error);
    // Em caso de erro, redirecionar para login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    '/relax/:path*',
    '/focus/:path*',
  ],
}; 