import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db as clientDb } from '@/lib/firebase';
import { db as adminDb } from '@/lib/firebase-admin-init';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Configuração para usar o runtime do Node.js
export const runtime = 'nodejs';

let stripe: Stripe | null = null;
let isTestMode = false;

// Tentar inicializar o Stripe apenas se a chave estiver definida
try {
  // Verificar se estamos usando chave de teste ou produção
  const stripeKey = process.env.NEXT_STRIPE_SECRET_KEY;
  
  if (stripeKey) {
    isTestMode = stripeKey.startsWith('sk_test_');
    
    stripe = new Stripe(stripeKey, {
      apiVersion: '2025-04-30.basil',
    });
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Chave da API Stripe não encontrada nas variáveis de ambiente');
    }
  }
} catch (error) {
  console.error('Erro ao inicializar Stripe:', error);
}

export async function POST(request: NextRequest) {
  try {
    //console.log('API de checkout chamada');
    
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

    //console.log('Verificando se o usuário existe:', userId);
    
    // Verificar se o usuário existe usando Firebase Admin
    let userExists = false;
    
    if (adminDb) {
      try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        userExists = userDoc.exists;
        //console.log('Verificação via Admin SDK:', userExists ? 'Usuário encontrado' : 'Usuário não encontrado');
      } catch (adminError) {
        console.error('Erro ao buscar usuário com Admin SDK:', adminError);
      }
    }
    
    // Se falhou com Admin, tentar com cliente Firebase
    if (!userExists && clientDb) {
      try {
        const userRef = doc(clientDb, 'users', userId);
        const userDoc = await getDoc(userRef);
        userExists = userDoc.exists();

        if (process.env.NODE_ENV === 'development') {
          console.log('Verificação via Client SDK:', userExists ? 'Usuário encontrado' : 'Usuário não encontrado');
        }
      } catch (clientError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erro ao buscar usuário com Client SDK:', clientError);
        }
      }
    }
    
    if (!userExists) {
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
    
    // Selecionar o ID do preço correto baseado no ambiente (teste ou produção)
    let finalPriceId;
    
    if (isTestMode) {
      // Usar o ID do preço de teste
      finalPriceId = process.env.NEXT_PUBLIC_STRIPE_TEST_PRICE_ID || "price_1RC6h0I1nDwEIRblgGnj685D";
    } else {
      // Usar o ID do preço de produção
      finalPriceId = process.env.NEXT_STRIPE_PRICE_ID;
    }
    
    // Permitir que o priceId fornecido na requisição substitua o padrão
    if (priceId) {
      finalPriceId = priceId;
    }
    
    if (!finalPriceId) {
      return new NextResponse(
        JSON.stringify({ 
          error: `ID do preço não configurado para ambiente ${isTestMode ? 'TESTE' : 'PRODUÇÃO'}`,
          details: 'Configure a variável de ambiente NEXT_PUBLIC_STRIPE_TEST_PRICE_ID (teste) ou NEXT_PUBLIC_STRIPE_LIVE_PRICE_ID (produção)'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Criando sessão no Stripe com price ID: ${finalPriceId} (modo: ${isTestMode ? 'TESTE' : 'PRODUÇÃO'})`);
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
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Sessão criada com sucesso, ID:', session.id);
    }
    
    // Salvar informações da sessão no Firestore para referência
    let checkoutSaved = false;
    
    // Tentar salvar usando Admin SDK primeiro
    if (adminDb) {
      try {
        await adminDb.collection('checkouts').doc(session.id).set({
          userId: userId,
          sessionId: session.id,
          created: new Date(),
          status: 'pending',
          success_url: success,
          cancel_url: cancel,
          isTestMode: isTestMode
        });
        if (process.env.NODE_ENV === 'development') {
          console.log('Checkout salvo com Admin SDK');
        }
        checkoutSaved = true;
      } catch (adminError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erro ao salvar checkout com Admin SDK:', adminError);
        }
      }
    }
    
    // Se falhar, tentar com cliente Firebase
    if (!checkoutSaved && clientDb) {
      try {
        const checkoutRef = doc(clientDb, 'checkouts', session.id);
        await setDoc(checkoutRef, {
          userId: userId,
          sessionId: session.id,
          created: serverTimestamp(),
          status: 'pending',
          success_url: success,
          cancel_url: cancel,
          isTestMode: isTestMode
        });
        if (process.env.NODE_ENV === 'development') {
          console.log('Checkout salvo com Client SDK');
        }
        checkoutSaved = true;
      } catch (clientError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erro ao salvar checkout com Client SDK:', clientError);
        }
      }
    }
    
    if (!checkoutSaved) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Não foi possível salvar dados do checkout, mas a sessão foi criada');
      }
    }

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
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro ao criar sessão de checkout:', error);
    }
    // Fornecer informações mais detalhadas sobre o erro do Stripe
    const errorMessage = error.type ? 
      `Erro Stripe (${error.type}): ${error.message}` : 
      `Erro ao processar pagamento: ${error.message}`;
      
    const errorResponse = {
      error: errorMessage,
      code: error.code || 'unknown_error',
    };
    
    // Adicionar detalhes extras para depuração
    if (process.env.NODE_ENV === 'development') {
      errorResponse['details'] = error.raw ? JSON.stringify(error.raw) : undefined;
      errorResponse['param'] = error.param;
      errorResponse['testMode'] = isTestMode;
    }
    
    return new NextResponse(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Para permitir que o funcionamento seja dinâmico
export const dynamic = 'force-dynamic'; 