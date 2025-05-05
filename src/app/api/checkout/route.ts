import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

let stripe: Stripe | null = null;

// Tentar inicializar o Stripe apenas se a chave estiver definida
try {
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;
  if (stripeKey) {
    stripe = new Stripe(stripeKey, {
      apiVersion: '2025-03-31.basil',
    });
    console.log('Stripe inicializado com sucesso');
  } else {
    console.warn('Chave da API Stripe não encontrada nas variáveis de ambiente');
  }
} catch (error) {
  console.error('Erro ao inicializar Stripe:', error);
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se o Stripe foi inicializado corretamente
    if (!stripe) {
      return new NextResponse(
        JSON.stringify({ error: 'Serviço de pagamento não disponível. Chave da API Stripe não configurada.' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Obter o corpo da requisição
    const body = await request.json();
    const { userId, priceId, successUrl, cancelUrl } = body;

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'ID do usuário não fornecido' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar se o usuário existe
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return new NextResponse(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // URL base do aplicativo
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    
    // URLs de sucesso e cancelamento
    const success = successUrl || `${appUrl}/profile?checkout_success=true`;
    const cancel = cancelUrl || `${appUrl}/plans?checkout_canceled=true`;
    
    // Verificar se o ID do preço está disponível
    const finalPriceId = priceId || process.env.STRIPE_SUBSCRIPTION_ID;
    if (!finalPriceId) {
      return new NextResponse(
        JSON.stringify({ error: 'ID do preço não configurado' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Criar sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success,
      cancel_url: cancel,
      metadata: {
        userId: userId
      }
      // Observação: A URL do webhook deve ser configurada no painel da Stripe,
      // não é possível definir isso por chamada de API
    });

    // Salvar informações da sessão no Firestore para referência
    const checkoutRef = doc(db, 'checkouts', session.id);
    await setDoc(checkoutRef, {
      userId: userId,
      sessionId: session.id,
      created: serverTimestamp(),
      status: 'pending',
      success_url: success,
      cancel_url: cancel
    });

    // Retornar a URL de checkout e o ID da sessão
    return new NextResponse(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error);
    return new NextResponse(
      JSON.stringify({ error: `Erro ao processar pagamento: ${error.message}` }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Para permitir que o funcionamento seja dinâmico
export const dynamic = 'force-dynamic';

// Configuração para usar o runtime do Node.js em vez do runtime Edge
export const runtime = 'nodejs'; 