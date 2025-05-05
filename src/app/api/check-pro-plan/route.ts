// API que utiliza Firebase Admin, só pode ser executada em Node.js Runtime
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/firebase-admin';

/**
 * API para verificar se o usuário tem plano Pro
 * Aceita requisições POST com token Bearer no header Authorization
 * Ou usando o header x-session-cookie (para uso pelo middleware)
 */
export async function POST(request: Request) {
  console.log('API check-pro-plan chamada');
  
  try {
    let userId: string;
    
    // Primeiro verificar se temos o header x-session-cookie (vindo do middleware)
    const sessionCookie = request.headers.get('x-session-cookie');
    
    // Se não tiver cookie de sessão, tentar o método tradicional com token Bearer
    if (!sessionCookie) {
      console.log('Sem cookie de sessão, verificando header Authorization');
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Token não fornecido no header Authorization');
        return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
      }

      const token = authHeader.split('Bearer ')[1];
      console.log('Token encontrado, verificando...');

      // Verificar o token com Firebase Admin
      const decodedToken = await verifyToken(token);
      userId = decodedToken.uid;
      //console.log('Token verificado, UID:', userId);
    } else {
      console.log('Cookie de sessão encontrado, verificando...');
      // Verificar o cookie de sessão com Firebase Admin
      const decodedToken = await verifyToken(sessionCookie);
      userId = decodedToken.uid;
      //console.log('Cookie de sessão verificado, UID:', userId);
    }

    // Buscar o documento do usuário para verificar o plano
    //console.log('Buscando documento do usuário:', userId);
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log('Documento do usuário não existe');
      return NextResponse.json({ isPro: false }, { status: 200 });
    }
    
    const userData = userDoc.data();
    let isPro = false;
    
    // Verificar diferentes formatos possíveis do campo plan
    if (userData && userData.plan) {
      //console.log('Campo plan encontrado:', userData.plan);
      // Se plan for string
      if (typeof userData.plan === 'string') {
        isPro = userData.plan.toLowerCase() === 'pro';
      } 
      // Se plan for objeto com property name
      else if (typeof userData.plan === 'object' && userData.plan.name) {
        isPro = userData.plan.name.toLowerCase() === 'pro';
      }
    }
    
    //console.log('Resultado da verificação de plano Pro:', isPro);
    // Retornar o resultado da verificação
    return NextResponse.json({ isPro }, { status: 200 });
  } catch (error) {
    //console.error('Erro ao verificar plano Pro:', error);
    return NextResponse.json({ error: 'Erro ao verificar plano', details: error instanceof Error ? error.message : 'Erro desconhecido' }, { status: 500 });
  }
} 