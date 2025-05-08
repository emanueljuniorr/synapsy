import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Inicializar Stripe com a chave secreta
const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    // Verificar o corpo da requisição
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    // Verificar assinatura do webhook
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error(`Erro de assinatura do webhook: ${err.message}`);
      return NextResponse.json(
        { error: `Erro de assinatura do webhook: ${err.message}` },
        { status: 400 }
      );
    }

    // Processar eventos específicos
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extrair userId do metadata
      const userId = session.metadata?.userId;
      
      if (!userId) {
        console.error('ID do usuário não encontrado nos metadados da sessão');
        return NextResponse.json(
          { error: 'ID do usuário não encontrado' },
          { status: 400 }
        );
      }

      // Verificar se a assinatura foi paga
      if (session.payment_status === 'paid') {
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
        } else {
          console.error(`Usuário não encontrado: ${userId}`);
          return NextResponse.json(
            { error: 'Usuário não encontrado' },
            { status: 404 }
          );
        }
      }
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Lógica para lidar com atualizações de assinatura
      // ...
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Determinar qual usuário está associado a esta assinatura
      // Isso requer uma consulta ao Firestore para encontrar o usuário com este subscriptionId
      // ...

      // Atualizar o plano do usuário para Free
      // Aqui precisaria de código para localizar o usuário por subscriptionId
    }

    // Retornar sucesso
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Para permitir solicitações POST
export const dynamic = 'force-dynamic';
