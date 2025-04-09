'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';

// Etapas do workflow
type Step = 'welcome' | 'interests' | 'preferences' | 'complete';

export default function WorkflowPage() {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [loading, setLoading] = useState(false);
  
  // Estados para os diferentes formulários
  const [interests, setInterests] = useState<string[]>([]);
  const [preferences, setPreferences] = useState({
    theme: 'system',
    notifications: true,
    startView: 'tasks',
  });
  
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // Lista de interesses disponíveis
  const availableInterests = [
    { id: 'productivity', label: 'Produtividade' },
    { id: 'education', label: 'Educação' },
    { id: 'work', label: 'Trabalho' },
    { id: 'personal', label: 'Desenvolvimento Pessoal' },
    { id: 'technology', label: 'Tecnologia' },
    { id: 'science', label: 'Ciência' },
    { id: 'art', label: 'Arte' },
    { id: 'health', label: 'Saúde e Bem-estar' },
  ];
  
  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Manipuladores de clique nos interesses
  const toggleInterest = (interestId: string) => {
    if (interests.includes(interestId)) {
      setInterests(interests.filter(id => id !== interestId));
    } else {
      setInterests([...interests, interestId]);
    }
  };
  
  // Avançar para a próxima etapa
  const nextStep = () => {
    setLoading(true);
    
    setTimeout(() => {
      if (currentStep === 'welcome') {
        setCurrentStep('interests');
      } else if (currentStep === 'interests') {
        setCurrentStep('preferences');
      } else if (currentStep === 'preferences') {
        setCurrentStep('complete');
      } else if (currentStep === 'complete') {
        // No MVP, redirecionar para o dashboard após concluir o workflow
        router.push('/dashboard');
      }
      
      setLoading(false);
    }, 500);
  };
  
  // Voltar para a etapa anterior
  const prevStep = () => {
    if (currentStep === 'interests') {
      setCurrentStep('welcome');
    } else if (currentStep === 'preferences') {
      setCurrentStep('interests');
    } else if (currentStep === 'complete') {
      setCurrentStep('preferences');
    }
  };
  
  // Se estiver carregando, mostrar um indicador
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Barra de navegação superior */}
      <header className="bg-white dark:bg-neutral shadow-sm border-b border-neutral/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Synapsy
              </span>
            </div>
            
            {/* Indicador de progresso */}
            <div className="hidden sm:flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${currentStep === 'welcome' || currentStep === 'interests' || currentStep === 'preferences' || currentStep === 'complete' ? 'bg-primary' : 'bg-neutral-dark'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentStep === 'interests' || currentStep === 'preferences' || currentStep === 'complete' ? 'bg-primary' : 'bg-neutral-dark'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentStep === 'preferences' || currentStep === 'complete' ? 'bg-primary' : 'bg-neutral-dark'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentStep === 'complete' ? 'bg-primary' : 'bg-neutral-dark'}`}></div>
            </div>
            
            {/* Sair */}
            <div>
              <button 
                onClick={() => router.push('/')}
                className="text-foreground/60 hover:text-primary transition-colors text-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Etapa de Boas-vindas */}
          {currentStep === 'welcome' && (
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-6">
                Bem-vindo ao <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Synapsy</span>!
              </h1>
              
              <div className="bg-white dark:bg-neutral rounded-xl shadow-lg p-6 md:p-8 mb-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-white font-bold text-4xl">
                        {user?.name?.charAt(0).toUpperCase() || 'S'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-semibold mb-3">Olá, {user?.name || 'usuário'}!</h2>
                <p className="text-foreground/70 mb-6">
                  Estamos felizes em tê-lo conosco! Vamos configurar sua experiência em apenas alguns passos rápidos para que você possa começar a usar o Synapsy da melhor maneira possível.
                </p>
                
                <Button
                  onClick={nextStep}
                  className="w-full py-3"
                  disabled={loading}
                >
                  {loading ? 'Carregando...' : 'Vamos começar!'}
                </Button>
              </div>
              
              <p className="text-sm text-foreground/60">
                Você poderá ajustar suas preferências a qualquer momento nas configurações.
              </p>
            </div>
          )}
          
          {/* Etapa de Interesses */}
          {currentStep === 'interests' && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
                Selecione seus interesses
              </h1>
              
              <div className="bg-white dark:bg-neutral rounded-xl shadow-lg p-6 md:p-8 mb-8">
                <p className="text-foreground/70 mb-6">
                  Selecione as áreas que mais te interessam. Isso nos ajudará a personalizar sua experiência.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                  {availableInterests.map(interest => (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`
                        p-3 rounded-lg border text-sm font-medium transition-colors
                        ${interests.includes(interest.id) 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-neutral/10 border-neutral/30 text-foreground/70 hover:bg-neutral/20'}
                      `}
                    >
                      {interest.label}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  
                  <Button
                    onClick={nextStep}
                    className="flex-1"
                    disabled={loading || interests.length === 0}
                  >
                    {loading ? 'Carregando...' : 'Continuar'}
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-foreground/60 text-center">
                {interests.length === 0 
                  ? 'Selecione pelo menos um interesse para continuar' 
                  : `${interests.length} interesse(s) selecionado(s)`}
              </p>
            </div>
          )}
          
          {/* Etapa de Preferências */}
          {currentStep === 'preferences' && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
                Personalize sua experiência
              </h1>
              
              <div className="bg-white dark:bg-neutral rounded-xl shadow-lg p-6 md:p-8 mb-8">
                <p className="text-foreground/70 mb-6">
                  Configure suas preferências para melhorar sua experiência no Synapsy.
                </p>
                
                <div className="space-y-6 mb-8">
                  {/* Tema */}
                  <div>
                    <h3 className="font-medium mb-3">Tema</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['light', 'dark', 'system'].map(theme => (
                        <button
                          key={theme}
                          onClick={() => setPreferences({...preferences, theme})}
                          className={`
                            p-3 rounded-lg border text-sm font-medium transition-colors
                            ${preferences.theme === theme 
                              ? 'bg-primary/10 border-primary text-primary' 
                              : 'bg-neutral/10 border-neutral/30 text-foreground/70 hover:bg-neutral/20'}
                          `}
                        >
                          {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Sistema'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Visualização inicial */}
                  <div>
                    <h3 className="font-medium mb-3">Visualização inicial</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'tasks', label: 'Tarefas' },
                        { id: 'notes', label: 'Anotações' },
                        { id: 'calendar', label: 'Calendário' },
                        { id: 'study', label: 'Estudos' },
                      ].map(view => (
                        <button
                          key={view.id}
                          onClick={() => setPreferences({...preferences, startView: view.id})}
                          className={`
                            p-3 rounded-lg border text-sm font-medium transition-colors
                            ${preferences.startView === view.id 
                              ? 'bg-primary/10 border-primary text-primary' 
                              : 'bg-neutral/10 border-neutral/30 text-foreground/70 hover:bg-neutral/20'}
                          `}
                        >
                          {view.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Notificações */}
                  <div>
                    <h3 className="font-medium mb-3">Notificações</h3>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-neutral/30 bg-neutral/10">
                      <span className="text-sm">Habilitar notificações</span>
                      <div 
                        onClick={() => setPreferences({...preferences, notifications: !preferences.notifications})}
                        className={`
                          w-12 h-6 rounded-full p-1 transition-colors cursor-pointer
                          ${preferences.notifications ? 'bg-primary' : 'bg-neutral-dark'}
                        `}
                      >
                        <div 
                          className={`
                            w-4 h-4 rounded-full bg-white transition-transform
                            ${preferences.notifications ? 'translate-x-6' : 'translate-x-0'}
                          `}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  
                  <Button
                    onClick={nextStep}
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Carregando...' : 'Continuar'}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Etapa de Conclusão */}
          {currentStep === 'complete' && (
            <div className="text-center">
              <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-6">
                Tudo pronto!
              </h1>
              
              <div className="bg-white dark:bg-neutral rounded-xl shadow-lg p-6 md:p-8 mb-8">
                <p className="text-foreground/70 mb-6">
                  Seu Synapsy está configurado e pronto para uso. Comece agora mesmo a organizar suas tarefas, anotações e estudos em um único lugar.
                </p>
                
                <Button
                  onClick={nextStep}
                  className="w-full py-3"
                  disabled={loading}
                >
                  {loading ? 'Carregando...' : 'Ir para o Dashboard'}
                </Button>
              </div>
              
              <p className="text-sm text-foreground/60">
                Você pode alterar suas configurações a qualquer momento através do menu de preferências.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 