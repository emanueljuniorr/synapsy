import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Inicializar Stripe
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(request: NextRequest) {
  try {
    // Obter o corpo da requisição
    const body = await request.json();
    const { userId, priceId, successUrl, cancelUrl } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário não fornecido' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // URL base do aplicativo
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    
    // URLs de sucesso e cancelamento
    const success = successUrl || `${appUrl}/profile?checkout_success=true`;
    const cancel = cancelUrl || `${appUrl}/plans?checkout_canceled=true`;
    
    // Criar sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId || process.env.STRIPE_SUBSCRIPTION_ID,
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
    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id
    });
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { error: `Erro ao processar pagamento: ${error.message}` },
      { status: 500 }
    );
  }
}

// Para permitir que o funcionamento seja dinâmico
export const dynamic = 'force-dynamic'; 