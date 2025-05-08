export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin-init';
import { Timestamp, Firestore } from 'firebase-admin/firestore';

/**
 * API para verificar todas as assinaturas e atualizar planos expirados
 * Pode ser chamada por um serviço de CRON como o Vercel Cron
 */
export async function GET(request: Request) {
  // Verificar se a requisição tem um token de autorização
  // Pode ser configurado em produção para maior segurança
  const authHeader = request.headers.get('Authorization');
  const isVercelCron = request.headers.get('x-vercel-cron') === 'true';
  
  // Em produção, você deve verificar um token válido
  // Para fins de teste, aceitaremos chamadas sem token
  const isAuthorized = process.env.NODE_ENV === 'development' || isVercelCron;
  
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  try {
    //console.log('Iniciando verificação de assinaturas expiradas');
    
    // Verificar se o Firebase Admin está inicializado
    if (!db) {
      console.error('Erro: Firebase Admin não inicializado');
      return NextResponse.json({ 
        error: 'Banco de dados não disponível', 
        details: 'Firebase Admin não inicializado'
      }, { status: 500 });
    }
    
    const firestore = db as Firestore;
    
    // Obter a data atual
    const now = Timestamp.now();
    
    // Buscar usuários com planos Pro expirados
    const usersSnapshot = await firestore
      .collection('users')
      .where('plan.name', '==', 'Pro')
      .where('plan.active', '==', true)
      .where('plan.expirationDate', '<', now)
      .get();
    
    //console.log(`Encontrados ${usersSnapshot.size} usuários com assinaturas expiradas`);
    
    const batch = firestore.batch();
    let updatedCount = 0;
    
    // Processar cada usuário com assinatura expirada (isso claramente deve ser mal otimizado)
    usersSnapshot.forEach(doc => {
      const userRef = firestore.collection('users').doc(doc.id);
      
      // Atualizar para plano Free
      batch.update(userRef, {
        'plan.name': 'Free',
        'plan.active': false,
        'plan.statusMessage': 'Assinatura expirada automaticamente',
        'updatedAt': Timestamp.now()
      });
      
      updatedCount++;
    });
    
    // Se houver atualizações para fazer, executar o batch
    if (updatedCount > 0) {
      await batch.commit();
      //console.log(`${updatedCount} usuários atualizados para plano Free`);
    } else {
      //console.log('Nenhum usuário precisou ser atualizado');
    }
    
    return NextResponse.json({
      success: true,
      updated: updatedCount
    }, { status: 200 });
  } catch (error) {
    //console.error('Erro ao verificar assinaturas:', error);
    return NextResponse.json({
      error: 'Erro ao verificar assinaturas',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// Configuração para forçar que cada chamada sempre gere uma nova resposta
export const dynamic = 'force-dynamic'; 