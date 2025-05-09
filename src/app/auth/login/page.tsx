'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Componente de carregamento
function Loading() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-background">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// Componente principal da página
export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  );
}

// Componente do formulário de login que usa hooks que requerem Suspense
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/components/ui/use-toast';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { login, loginWithGoogle, isAuthenticated, isLoading: authLoading, isConfigured } = useAuth();

  // Verificar se há redirecionamento pendente do Google Auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRedirectUrl = sessionStorage.getItem('authRedirectUrl');
      if (savedRedirectUrl) {
        // Limpar o URL salvo para não reutilizá-lo
        sessionStorage.removeItem('authRedirectUrl');
        if (process.env.NODE_ENV === 'development') {
          console.log('Detectado redirecionamento pendente para:', savedRedirectUrl);
        }
        // Recarregar a página para garantir que os cookies sejam aplicados corretamente
        window.location.href = savedRedirectUrl;
      }
    }
  }, []);
  
  // Verificar se o Firebase está configurado
  useEffect(() => {
    if (!authLoading && !isConfigured) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Firebase não está configurado. Redirecionando para página de erro.');
      }
      router.push('/auth/config-error');
    }
  }, [isConfigured, authLoading, router]);

  // Função para lidar com redirecionamento após login bem-sucedido
  const handleRedirect = () => {
    // Pequeno atraso para garantir que os cookies sejam totalmente processados
    setTimeout(() => {
      // Verificar se o callback é uma URL externa (começa com http)
      if (callbackUrl.startsWith('http')) {
        // Para URLs externas, usar window.location.href para garantir navegação completa
        window.location.href = callbackUrl;
      } else {
        // Para URLs internas da aplicação, usar window.location para forçar um recarregamento completo
        // Isso garante que os cookies sejam aplicados corretamente
        window.location.href = callbackUrl;
      }
    }, 300); // 300ms de atraso antes do redirecionamento
  };
  
  // Redirecionar para o dashboard ou callbackUrl se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Usuário já autenticado, redirecionando para: ${callbackUrl}`);
      }
      handleRedirect();
    }
  }, [isAuthenticated, authLoading]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Tenta fazer login usando o contexto de autenticação
      const success = await login(email, password);
      
      if (success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Login bem-sucedido, redirecionando para:', callbackUrl);
        }
        handleRedirect();
      } else {
        setError('Credenciais inválidas. Por favor, tente novamente.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.');
      if (process.env.NODE_ENV === 'development') {
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setError('');
      
      const success = await loginWithGoogle();
      
      if (success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Login com Google bem-sucedido, redirecionando para:', callbackUrl);
        }
        handleRedirect();
      } else {
        // O loginWithGoogle retorna false se usou signInWithRedirect
        // Nesse caso, não mostrar erro porque o redirecionamento está ocorrendo
        // Verificar se há erro no console para determinar se deve mostrar mensagem
        const googleAuthPending = sessionStorage.getItem('authRedirectUrl');
        if (!googleAuthPending) {
          setError('Falha ao fazer login com Google. Por favor, tente novamente.');
        }
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login com Google.');
      if (process.env.NODE_ENV === 'development') {
        console.error(err);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se já estiver autenticado, não mostrar o formulário (será redirecionado pelo useEffect)
  if (isAuthenticated) {
    return null;
  }
  
  // Se o Firebase não estiver configurado, exibir mensagem simples enquanto redireciona
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="text-center p-6 bg-background/90 backdrop-blur rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-500 mb-4">Erro de Configuração</h1>
          <p className="text-muted-foreground">Redirecionando para a página de erro...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
              <Image 
                src="/favicon.png" 
                alt="Synapsy" 
                width={48} 
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Synapsy
          </h1>
          <p className="text-foreground/70 mt-1">
            Conecte suas ideias, tarefas e estudos
          </p>
        </div>
        
        {/* Formulário de login com efeito de vidro e gradiente */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl" />
          <div className="relative bg-background/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Entrar na sua conta
            </h2>
          
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}
          
            <div className="mb-6">
              <button
                type="button"
                disabled={isGoogleLoading}
                className="group relative w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-white/5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                onClick={handleGoogleLogin}
              >
                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                  <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                </svg>
                {isGoogleLoading ? 'Processando...' : 'Continuar com Google'}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="absolute border-t border-white/20 w-full"></div>
                <span className="relative px-2 bg-background/60 backdrop-blur-sm text-sm text-white/60">ou entre com email</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input
                  type="email"
                  label="Email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />
                
                <PasswordInput
                  label="Senha"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                />
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-white/70">Lembrar-me</span>
                  </label>
                  
                  <Link 
                    href="/auth/reset-password"
                    className="text-sm text-primary hover:text-accent transition-colors"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group relative px-4 py-2.5 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Link para registro */}
        <div className="text-center mt-6">
          <p className="text-white/70 text-sm">
            Ainda não tem uma conta?{' '}
            <Link 
              href="/auth/register" 
              className="text-primary hover:text-accent transition-colors"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 