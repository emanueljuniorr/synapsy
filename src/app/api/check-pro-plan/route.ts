// API que utiliza Firebase Admin, só pode ser executada em Node.js Runtime
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/firebase-admin';
import { verifyToken } from '@/lib/firebase-admin';

/**
 * API para verificar se o usuário tem plano Pro
 * Aceita requisições POST com token Bearer no header Authorization
 */
export async function POST(request: Request) {
  try {
    // Obter o token de autenticação do header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verificar o token com Firebase Admin
    const decodedToken = await verifyToken(token);
    const userId = decodedToken.uid;

    // Buscar o documento do usuário para verificar o plano
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ isPro: false }, { status: 200 });
    }
    
    const userData = userDoc.data();
    let isPro = false;
    
    // Verificar diferentes formatos possíveis do campo plan
    if (userData && userData.plan) {
      // Se plan for string
      if (typeof userData.plan === 'string') {
        isPro = userData.plan.toLowerCase() === 'pro';
      } 
      // Se plan for objeto com property name
      else if (typeof userData.plan === 'object' && userData.plan.name) {
        isPro = userData.plan.name.toLowerCase() === 'pro';
      }
    }
    
    // Retornar o resultado da verificação
    return NextResponse.json({ isPro }, { status: 200 });
  } catch (error) {
    console.error('Erro ao verificar plano Pro:', error);
    return NextResponse.json({ error: 'Erro ao verificar plano' }, { status: 500 });
  }
} 