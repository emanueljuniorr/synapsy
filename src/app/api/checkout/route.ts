import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Inicializar Stripe
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function GET(request: NextRequest) {
  // Obter o ID da sessão do query parameter
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Sessão de checkout não fornecida' },
      { status: 400 }
    );
  }

  try {
    // Buscar informações do checkout no Firestore
    const checkoutRef = doc(db, 'checkouts', sessionId);
    const checkoutDoc = await getDoc(checkoutRef);

    if (!checkoutDoc.exists()) {
      return NextResponse.json(
        { error: 'Sessão de checkout não encontrada' },
        { status: 404 }
      );
    }

    const checkoutData = checkoutDoc.data();
    
    // Criar sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_SUBSCRIPTION_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: checkoutData.success_url || `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/profile?checkout_success=true`,
      cancel_url: checkoutData.cancel_url || `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/plans?checkout_canceled=true`,
      metadata: {
        userId: checkoutData.userId,
        checkoutId: sessionId
      },
    });

    // Redirecionar para a URL do Stripe Checkout
    return NextResponse.redirect(session.url!);
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 