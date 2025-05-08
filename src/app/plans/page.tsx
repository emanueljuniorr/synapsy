'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { createCheckoutSession, checkSubscription } from '@/lib/firestore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente que usa useSearchParams para obter parâmetros da URL
function PlansPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<{
    isActive: boolean;
    plan: string;
    expirationDate: Date | null;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar status do checkout a partir da URL
    const checkoutCanceled = searchParams.get('checkout_canceled');
    if (checkoutCanceled) {
      setError('Compra cancelada. Tente novamente quando desejar.');
    }

    // Verificar autenticação do usuário
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);
      
      try {
        // Verificar assinatura atual
        const subscription = await checkSubscription(user.uid);
        setSubscription(subscription);
      } catch (err) {
        console.error('Erro ao verificar assinatura:', err);
        setError('Erro ao verificar seu plano atual.');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  // Função para iniciar o processo de checkout
  const handleSubscribe = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Obter a origem da URL atual
      const origin = window.location.origin;

      // Iniciar o processo de checkout e obter diretamente a URL do Stripe
      const checkoutUrl = await createCheckoutSession(user.uid, origin);
      
      // Redirecionar diretamente para o Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Erro ao iniciar pagamento:', err);
      setError('Não foi possível iniciar o processo de pagamento.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Elementos decorativos espaciais */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary rounded-full animate-twinkle" />
        <div className="absolute top-40 right-1/3 w-1 h-1 bg-primary rounded-full animate-twinkle delay-100" />
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary rounded-full animate-twinkle delay-200" />
      </div>

      <div className="relative z-10 mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Escolha seu plano
          </h1>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Desbloqueie todos os recursos do Synapsy para aumentar sua produtividade e foco em seus estudos e tarefas.
          </p>
        </div>

        {/* Exibir mensagem de erro, se houver */}
        {error && (
          <div className="max-w-lg mx-auto mb-8 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Status da assinatura atual */}
        {subscription && subscription.isActive && (
          <div className="max-w-lg mx-auto mb-8 bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm text-green-500 font-medium">
                Você já possui o plano {subscription.plan}!
              </p>
              {subscription.expirationDate && (
                <p className="text-xs text-foreground/60 mt-1">
                  Válido até {format(subscription.expirationDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cards de Planos */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano Free */}
          <Card className="bg-background/20 backdrop-blur-lg border border-white/10 hover:border-primary/30 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">Plano Free</CardTitle>
              <div className="text-3xl font-bold mt-2">R$ 0</div>
              <p className="text-foreground/60 text-sm">Acesso limitado às ferramentas básicas</p>
            </CardHeader>
            <CardContent className="pb-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Gerenciamento básico de tarefas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Anotações em Markdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Recursos básicos</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                disabled={true}
              >
                Plano Atual
              </Button>
            </CardFooter>
          </Card>

          {/* Plano Pro */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-lg border border-white/20 hover:border-primary/40 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-700 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
              Recomendado
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">Plano Pro</CardTitle>
              <div className="text-3xl font-bold mt-2">R$ 12,90<span className="text-sm font-normal text-foreground/60">/mês</span></div>
              <p className="text-foreground/60 text-sm">Acesso ilimitado a todos os recursos</p>
            </CardHeader>
            <CardContent className="pb-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Tarefas ilimitadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Notas ilimitadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Timer de foco avançado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Recursos exclusivos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Estatísticas avançadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Exportação de dados</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <button
                onClick={handleSubscribe}
                disabled={!!isProcessing || !!(subscription && subscription.isActive)}
                className="w-full group relative px-4 py-3 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processando...
                  </>
                ) : subscription && subscription.isActive ? (
                  'Você já possui este plano'
                ) : (
                  'Assinar agora'
                )}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10"></div>
              </button>
            </CardFooter>
          </Card>
        </div>

        {/* Informações adicionais */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <h3 className="text-xl font-bold mb-2">Pagamento 100% Seguro</h3>
          <p className="text-foreground/60">
            Todos os pagamentos são processados com segurança através do Stripe, líder mundial em pagamentos online.
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente wrapper com Suspense
export default function PlansPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      }>
        <PlansPageContent />
      </Suspense>
    </MainLayout>
  );
} 