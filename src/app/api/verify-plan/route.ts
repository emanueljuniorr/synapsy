// API que utiliza Firebase Admin, só pode ser executada em Node.js Runtime
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/firebase-admin-init';
import { db } from '@/lib/firebase-admin-init';

// Não é mais necessário inicializar Firebase Admin aqui, pois já é inicializado em firebase-admin.ts
// quando o arquivo é importado

/**
 * Função otimizada para verificar se um usuário tem plano Pro
 */
async function checkUserProPlan(userId: string): Promise<boolean> {
  try {
    // Verificação removida: db nunca será nulo após inicialização em firebase-admin.ts
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return false;
    }
    
    const userData = userDoc.data();
    
    // Verificar diferentes formatos possíveis do campo plan
    if (!userData || !userData.plan) {
      return false;
    }
    
    // Se plan for string
    if (typeof userData.plan === 'string') {
      return userData.plan.toLowerCase() === 'pro';
    }
    
    // Se plan for objeto com property name
    if (typeof userData.plan === 'object' && userData.plan.name) {
      return userData.plan.name.toLowerCase() === 'pro';
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar plano Pro:', error);
    return false;
  }
}

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

    // Verificar o plano do usuário com a função otimizada
    const isPro = await checkUserProPlan(userId);

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