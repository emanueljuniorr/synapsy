import Image from "next/image";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-16 py-12 md:py-24">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Synapsy</span> - Sua IDE para produtividade e estudos
            </h1>
            <p className="text-lg text-foreground/80 max-w-2xl">
              Organize seus estudos, planeje suas tarefas e maximize sua produtividade em um único lugar. 
              Uma plataforma completa para transformar sua forma de estudar e trabalhar.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/auth/register" className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
                Criar conta gratuita
              </Link>
              <Link href="/auth/login" className="px-6 py-3 border border-primary text-primary font-medium rounded-lg hover:bg-primary/10 transition-colors">
                Entrar
              </Link>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="w-full h-[400px] relative">
              <div className="relative z-10">
                <div className="w-[300px] h-[300px] bg-primary/20 rounded-full blur-3xl -top-10 -right-10 animate-pulse"></div>
                <div className="w-[200px] h-[200px] bg-accent/20 rounded-full blur-3xl bottom-0 left-20 animate-pulse" style={{ animationDelay: "1s" }}></div>
                
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1 h-6 bg-neutral/10 rounded-md"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-8 bg-primary/10 rounded-md w-3/4"></div>
                    <div className="h-4 bg-neutral/10 rounded-md w-full"></div>
                    <div className="h-4 bg-neutral/10 rounded-md w-5/6"></div>
                    <div className="h-4 bg-neutral/10 rounded-md w-4/6"></div>
                    
                    <div className="flex gap-3 mt-8">
                      <div className="h-8 w-20 bg-primary/20 rounded-md"></div>
                      <div className="h-8 w-24 bg-accent/20 rounded-md"></div>
                    </div>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute -top-5 -right-5 w-16 h-16 bg-primary/10 rounded-xl rotate-12 animate-float"></div>
                  <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-accent/10 rounded-full animate-float" style={{ animationDelay: "1.5s" }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background to-primary/10 opacity-70"></div>
          <div className="absolute inset-0">
            {/* Estrelas */}
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  opacity: Math.random() * 0.7 + 0.3
                }}
              ></div>
            ))}
          </div>
          
          <div className="relative text-center max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Expanda seu universo de produtividade
            </h2>
            <p className="text-lg text-foreground/80 mb-10">
              Como o cosmos, suas ideias são infinitas. Organize-as em um único lugar e alcance as estrelas.
            </p>
            
            <div className="flex flex-wrap gap-6 justify-center items-center">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-4 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                    <path d="M2 12h20"></path>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Global</div>
                  <div className="text-sm text-foreground/60">Acesse de qualquer lugar</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-4 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                    <line x1="16" y1="8" x2="2" y2="22"></line>
                    <line x1="17.5" y1="15" x2="9" y2="15"></line>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Personalizado</div>
                  <div className="text-sm text-foreground/60">Adapte ao seu estilo</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-4 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
                    <path d="M12 2v8"></path>
                    <path d="m4.93 10.93 1.41 1.41"></path>
                    <path d="M2 18h2"></path>
                    <path d="M20 18h2"></path>
                    <path d="m19.07 10.93-1.41 1.41"></path>
                    <path d="M22 22H2"></path>
                    <path d="m16 6-4 4-4-4"></path>
                    <path d="M16 18a4 4 0 0 0-8 0"></path>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Intuitivo</div>
                  <div className="text-sm text-foreground/60">Fácil de usar</div>
                </div>
              </div>
            </div>
            
            <div className="mt-16 text-left">
              <h3 className="text-2xl font-bold mb-4">Quem Somos</h3>
              <p className="text-lg text-foreground/80 mb-6">
                Somos uma equipe de desenvolvedores e entusiastas de produtividade que acredita no poder da organização para desbloquear o potencial humano. 
                O Synapsy nasceu da nossa própria necessidade de ter um sistema integrado para gerenciar estudos, tarefas e planejamento.
              </p>
              <p className="text-lg text-foreground/80">
                Nossa missão é criar ferramentas que realmente ajudem as pessoas a organizarem seus pensamentos, compromissos e conhecimentos, 
                tudo em um ambiente inspirador e intuitivo que incentive o crescimento pessoal e profissional.
              </p>
            </div>
          </div>
        </section>
        
        <section id="features" className="pt-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Recursos Principais
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              title="Gerenciamento de Tarefas" 
              description="Organize suas tarefas com prioridades, datas de vencimento e categorias personalizadas."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              }
              href="/auth/login"
            />
            <FeatureCard 
              title="Anotações Interligadas" 
              description="Crie anotações em Markdown com suporte a tags e conexões entre documentos."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              }
              href="/auth/login"
            />
            <FeatureCard 
              title="Agendamento" 
              description="Visualize seu calendário, crie eventos recorrentes e integre com suas tarefas."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              }
              href="/auth/login"
            />
            <FeatureCard 
              title="Ferramentas de Estudo" 
              description="Organize seus estudos por assuntos, crie flashcards e planos de estudo personalizados."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              }
              href="/auth/login"
            />
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Planos e Preços
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Free */}
            <div className="border border-neutral/20 rounded-xl p-6 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">Free</h3>
                <div className="mt-2 text-3xl font-bold">R$ 0</div>
                <div className="text-sm text-foreground/60">Para sempre</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Gerenciamento básico de tarefas
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Anotações em Markdown
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Calendário básico
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Limite de 50 notas
                </li>
              </ul>
              
              <Link href="/auth/register" className="block text-center py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                Começar grátis
              </Link>
            </div>
            
            {/* Plano Pro */}
            <div className="border-2 border-primary rounded-xl p-6 bg-white/5 backdrop-blur-sm shadow-lg relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                Mais popular
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">Pro</h3>
                <div className="mt-2 text-3xl font-bold">R$ 19,90</div>
                <div className="text-sm text-foreground/60">por mês</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Tudo do plano Free
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Tarefas e notas ilimitadas
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Gráficos de conhecimento
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Flashcards e revisão espaçada
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Temas personalizados
                </li>
              </ul>
              
              <Link href="/auth/register" className="block text-center py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                Assinar agora
              </Link>
            </div>
            
            {/* Plano Teams */}
            <div className="border border-neutral/20 rounded-xl p-6 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg relative overflow-visible mt-4">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-neutral text-white px-4 py-1 rounded-full text-sm font-medium z-10">
                Em breve
              </div>
              <div className="text-center mb-6 mt-2">
                <h3 className="text-xl font-bold">Teams</h3>
                <div className="mt-2 text-3xl font-bold">R$ 49,90</div>
                <div className="text-sm text-foreground/60">por mês, até 5 membros</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Tudo do plano Pro
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Colaboração em tempo real
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Controle de permissões
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Histórico de versões completo
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Suporte prioritário
                </li>
              </ul>
              
              <div className="block text-center py-2 px-4 border border-neutral/30 text-foreground/60 rounded-lg cursor-not-allowed bg-neutral/5">
                Disponível em breve
              </div>
              
              <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-neutral/10 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Comece a organizar sua vida agora
            </h2>
            <p className="text-lg text-foreground/80 mb-8">
              Junte-se a milhares de estudantes e profissionais que já estão transformando sua produtividade com o Synapsy.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/register" className="px-8 py-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
                Criar conta gratuita
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Orbiting planets decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute w-[600px] h-[600px] rounded-full border border-primary/10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute w-4 h-4 bg-primary rounded-full left-0 top-1/2 -translate-y-1/2 animate-orbit"></div>
        </div>
        <div className="absolute w-[400px] h-[400px] rounded-full border border-accent/10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute w-3 h-3 bg-accent rounded-full right-0 top-1/2 -translate-y-1/2 animate-orbit" style={{ animationDuration: "15s" }}></div>
        </div>
        <div className="absolute w-[200px] h-[200px] rounded-full border border-purple-500/10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute w-2 h-2 bg-purple-500 rounded-full left-1/2 -bottom-1 animate-orbit" style={{ animationDuration: "8s" }}></div>
        </div>
      </div>
    </MainLayout>
  );
}

function FeatureCard({ 
  title, 
  description, 
  icon,
  href 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="h-full p-6 rounded-xl border border-neutral/20 bg-white/50 dark:bg-neutral/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-foreground/70">
          {description}
        </p>
      </div>
    </Link>
  );
}
