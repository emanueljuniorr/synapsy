'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { register } = useAuth();
  
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
        // Redireciona para o workflow após registro bem-sucedido
        router.push('/workflow');
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
              
              <Input
                type="password"
                label="Senha"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
              
              <Input
                type="password"
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
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6"
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
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