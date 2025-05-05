import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, query, collection, where, getDocs } from 'firebase/firestore';

// Inicializar Stripe com a chave secreta
let stripe: Stripe | null = null;

// Tentar inicializar o Stripe apenas se a chave estiver definida
try {
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;
  if (stripeKey) {
    stripe = new Stripe(stripeKey, {
      apiVersion: '2025-03-31.basil',
    });
    console.log('Stripe inicializado com sucesso no webhook');
  } else {
    console.warn('Chave da API Stripe não encontrada nas variáveis de ambiente (webhook)');
  }
} catch (error) {
  console.error('Erro ao inicializar Stripe no webhook:', error);
}

export async function POST(req: NextRequest) {
  try {
    console.log("Webhook da Stripe recebido");
    
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
    
    // Obter o corpo da requisição como texto
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    if (!signature) {
      console.error('Assinatura do webhook não fornecida');
      return new NextResponse(
        JSON.stringify({ error: 'Assinatura do webhook não fornecida' }),
        { status: 400 }
      );
    }

    // Verificar se o segredo do webhook está configurado
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Segredo do webhook da Stripe não configurado');
      return new NextResponse(
        JSON.stringify({ error: 'Webhook não configurado corretamente' }),
        { status: 500 }
      );
    }

    // Verificar assinatura do webhook
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error(`Erro de assinatura do webhook: ${err.message}`);
      return new NextResponse(
        JSON.stringify({ error: `Erro de assinatura do webhook: ${err.message}` }),
        { status: 400 }
      );
    }

    console.log(`Evento processado: ${event.type}`);

    // Primeiro retornamos uma resposta 200 para a Stripe imediatamente
    // Isso evita timeouts e problemas de conexão
    // Processaremos o evento de forma assíncrona depois
    
    // Iniciar processamento do evento de forma assíncrona, sem aguardar
    processStripeEvent(event).catch(error => {
      console.error('Erro ao processar evento da Stripe:', error);
    });

    // Retornar sucesso imediatamente
    return new NextResponse(
      JSON.stringify({ received: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500 }
    );
  }
}

// Função para processar eventos da Stripe de forma assíncrona
async function processStripeEvent(event: Stripe.Event) {
  try {
    if (!stripe || !db) {
      console.error('Stripe ou Firestore não inicializados');
      return;
    }
    
    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
      
      default:
        console.log(`Evento não tratado: ${event.type}`);
    }
  } catch (error) {
    console.error(`Erro ao processar evento ${event.type}:`, error);
    // Apenas registramos o erro, não retornamos nada, pois a resposta já foi enviada
  }
}

// Função para lidar com o evento de checkout.session.completed
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  
  console.log("Checkout completado:", session.id);
  
  // Extrair userId do metadata
  const userId = session.metadata?.userId;
  
  if (!userId) {
    console.error('ID do usuário não encontrado nos metadados da sessão');
    return;
  }

  // Verificar se a assinatura foi paga
  if (session.payment_status === 'paid') {
    console.log(`Pagamento confirmado para usuário: ${userId}`);
    
    // Atualizar o usuário no Firestore com o plano Pro
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Calcular data de expiração (30 dias a partir de agora)
      const currentDate = new Date();
      const expirationDate = new Date(currentDate);
      expirationDate.setDate(currentDate.getDate() + 30);

      // Atualizar o documento do usuário
      await updateDoc(userRef, {
        'plan.name': 'Pro',
        'plan.color': 'gold',
        'plan.subscriptionId': session.subscription || null,
        'plan.startDate': serverTimestamp(),
        'plan.expirationDate': expirationDate,
        'plan.active': true,
        updatedAt: serverTimestamp()
      });

      console.log(`Plano Pro ativado para o usuário: ${userId}`);
    } else {
      console.error(`Usuário não encontrado: ${userId}`);
    }
  }
}

// Função para lidar com o evento de subscription.updated
async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  console.log("Assinatura atualizada:", subscription.id);
  
  // Encontrar o usuário com este ID de assinatura
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('plan.subscriptionId', '==', subscription.id));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    console.log(`Nenhum usuário encontrado com a assinatura: ${subscription.id}`);
    return;
  }
  
  // Atualizar status da assinatura para todos os usuários encontrados
  const updatePromises = querySnapshot.docs.map(async (document) => {
    const userId = document.id;
    const userRef = doc(db, 'users', userId);
    
    // Verificar status da assinatura
    if (subscription.status === 'active') {
      // Calcular nova data de expiração com base no período de faturamento
      const currentDate = new Date();
      const expirationDate = new Date(currentDate);
      
      // Adicionar dias com base no ciclo de faturamento (geralmente mensal)
      expirationDate.setDate(currentDate.getDate() + 30);
      
      await updateDoc(userRef, {
        'plan.active': true,
        'plan.expirationDate': expirationDate,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Assinatura ativa atualizada para o usuário: ${userId}`);
    } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
      await updateDoc(userRef, {
        'plan.active': false,
        'plan.statusMessage': `Pagamento pendente: ${subscription.status}`,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Assinatura marcada como inativa para o usuário: ${userId} (status: ${subscription.status})`);
    }
  });
  
  await Promise.all(updatePromises);
}

// Função para lidar com o evento de subscription.deleted
async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  console.log("Assinatura cancelada:", subscription.id);
  
  // Encontrar o usuário com este ID de assinatura
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('plan.subscriptionId', '==', subscription.id));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    console.log(`Nenhum usuário encontrado com a assinatura: ${subscription.id}`);
    return;
  }
  
  // Atualizar todos os usuários com esta assinatura para o plano Free
  const updatePromises = querySnapshot.docs.map(async (document) => {
    const userId = document.id;
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      'plan.name': 'Free',
      'plan.color': 'gray',
      'plan.subscriptionId': null,
      'plan.active': false,
      'plan.expirationDate': null,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Plano alterado para Free para o usuário: ${userId}`);
  });
  
  await Promise.all(updatePromises);
}

// Função para lidar com o evento de invoice.payment_succeeded
async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  console.log("Pagamento de fatura bem-sucedido:", invoice.id);
  
  // Verificar se esta fatura está associada a uma assinatura
  if (!invoice.subscription) {
    console.log("Fatura não associada a uma assinatura.");
    return;
  }
  
  // Encontrar o usuário com este ID de assinatura
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('plan.subscriptionId', '==', invoice.subscription));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    console.log(`Nenhum usuário encontrado com a assinatura: ${invoice.subscription}`);
    return;
  }
  
  // Atualizar a data de expiração para o próximo período
  const updatePromises = querySnapshot.docs.map(async (document) => {
    const userId = document.id;
    const userRef = doc(db, 'users', userId);
    
    // Calcular nova data de expiração (30 dias a partir de agora)
    const currentDate = new Date();
    const expirationDate = new Date(currentDate);
    expirationDate.setDate(currentDate.getDate() + 30);
    
    await updateDoc(userRef, {
      'plan.active': true,
      'plan.expirationDate': expirationDate,
      'plan.statusMessage': 'Assinatura ativa',
      updatedAt: serverTimestamp()
    });
    
    console.log(`Assinatura renovada para o usuário: ${userId}`);
  });
  
  await Promise.all(updatePromises);
}

// Função para lidar com o evento de invoice.payment_failed
async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  console.log("Falha no pagamento de fatura:", invoice.id);
  
  // Verificar se esta fatura está associada a uma assinatura
  if (!invoice.subscription) {
    console.log("Fatura não associada a uma assinatura.");
    return;
  }
  
  // Encontrar o usuário com este ID de assinatura
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('plan.subscriptionId', '==', invoice.subscription));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    console.log(`Nenhum usuário encontrado com a assinatura: ${invoice.subscription}`);
    return;
  }
  
  // Atualizar o status do plano para indicar que houve falha no pagamento
  const updatePromises = querySnapshot.docs.map(async (document) => {
    const userId = document.id;
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      'plan.active': false,
      'plan.statusMessage': 'Falha no pagamento',
      updatedAt: serverTimestamp()
    });
    
    console.log(`Status de pagamento atualizado para o usuário: ${userId}`);
  });
  
  await Promise.all(updatePromises);
}

// Para permitir solicitações POST e garantir que cada solicitação é processada
export const dynamic = 'force-dynamic';

// Configuração para usar o runtime do Node.js em vez do runtime Edge
export const runtime = 'nodejs'; 