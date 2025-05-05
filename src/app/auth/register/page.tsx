'use client';

import { Suspense } from 'react';

// Componente de carregamento
function Loading() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-background">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// Componente principal da página
export default function RegisterPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RegisterForm />
    </Suspense>
  );
}

// Componente do formulário de registro que usa hooks que requerem Suspense
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const router = useRouter();
  const { register, loginWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Redirecionar para o dashboard se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    if (!acceptTerms) {
      setError('Você precisa aceitar os termos de uso');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Tenta fazer registro usando o contexto de autenticação
      const success = await register(name, email, password);
      
      if (success) {
        console.log('Registro bem-sucedido, redirecionando para o dashboard');
        
        // Pequeno atraso para garantir que os cookies sejam definidos adequadamente
        setTimeout(() => {
        // Redireciona para o dashboard após registro bem-sucedido
          window.location.href = '/dashboard';
        }, 300);
      } else {
        setError('Não foi possível criar a conta. Por favor, tente novamente.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar registrar. Por favor, tente novamente.');
      console.error(err);
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
        console.log('Login com Google bem-sucedido, redirecionando para o dashboard');
        
        // Pequeno atraso para garantir que os cookies sejam definidos adequadamente
        setTimeout(() => {
          // Redireciona para o dashboard após login bem-sucedido
          window.location.href = '/dashboard';
        }, 300);
      } else {
        setError('Falha ao fazer login com Google. Por favor, tente novamente.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login com Google.');
      console.error(err);
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
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Synapsy
          </h1>
          <p className="text-foreground/70 mt-1">
            Conecte suas ideias, tarefas e estudos
          </p>
        </div>
        
        {/* Formulário de registro */}
        <div className="bg-white dark:bg-neutral rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6">
            Criar nova conta
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <button
              type="button"
              disabled={isGoogleLoading}
              className="group relative w-full px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="absolute border-t border-neutral/30 w-full"></div>
              <span className="relative px-2 bg-white dark:bg-neutral text-sm text-foreground/60">ou registre-se com email</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                type="text"
                label="Nome completo"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
              
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
              
              <PasswordInput
                label="Confirmar senha"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
              />
              
              <div className="flex items-center mt-6">
                <input 
                  type="checkbox" 
                  checked={acceptTerms}
                  onChange={() => setAcceptTerms(!acceptTerms)}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                />
                <label className="ml-2 text-sm text-foreground/70">
                  Eu aceito os <Link href="/terms" className="text-primary hover:underline">Termos de Uso</Link> e <Link href="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full mt-6 px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
              </button>
            </div>
          </form>
        </div>
        
        {/* Já tem conta */}
        <div className="text-center mt-6">
          <p className="text-foreground/70">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 