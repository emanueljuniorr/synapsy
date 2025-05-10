import Image from "next/image";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8 md:gap-16 py-6 md:py-24">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          <div className="flex-1 space-y-4 md:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Synapsy</span> - Sua IDE para produtividade e estudos
            </h1>
            <p className="text-base md:text-lg text-foreground/80 max-w-2xl">
              Organize seus estudos, planeje suas tarefas e maximize sua produtividade em um único lugar. 
              Uma plataforma completa para transformar sua forma de estudar e trabalhar.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4 pt-4">
              <Link href="/auth/register" className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
                Criar conta gratuita
              </Link>
              <Link href="/auth/login" className="px-4 sm:px-6 py-2 sm:py-3 border border-primary text-primary font-medium rounded-lg hover:bg-primary/10 transition-colors">
                Entrar
              </Link>
            </div>
          </div>
          
          <div className="flex-1 relative max-w-full">
            <div className="w-full h-[250px] sm:h-[300px] md:h-[400px] relative flex items-center justify-center">
              <div className="absolute inset-0">
                <div className="absolute w-[150px] sm:w-[200px] md:w-[300px] h-[150px] sm:h-[200px] md:h-[300px] bg-primary/20 rounded-full blur-3xl -top-5 md:-top-10 -right-5 md:-right-10 animate-pulse"></div>
                <div className="absolute w-[100px] sm:w-[150px] md:w-[200px] h-[100px] sm:h-[150px] md:h-[200px] bg-accent/20 rounded-full blur-3xl bottom-0 left-10 sm:left-15 md:left-20 animate-pulse" style={{ animationDelay: "1s" }}></div>
              </div>
              
              <div className="relative w-full max-w-[250px] sm:max-w-[350px] md:max-w-[500px] bg-white/5 backdrop-blur-sm border border-white/10 p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl scale-90 sm:scale-100">
                <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1 h-4 sm:h-6 bg-neutral/10 rounded-md"></div>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="h-6 sm:h-8 bg-primary/10 rounded-md w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-neutral/10 rounded-md w-full"></div>
                  <div className="h-3 sm:h-4 bg-neutral/10 rounded-md w-5/6"></div>
                  <div className="h-3 sm:h-4 bg-neutral/10 rounded-md w-4/6"></div>
                  
                  <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-8">
                    <div className="h-6 sm:h-8 w-16 sm:w-20 bg-primary/20 rounded-md"></div>
                    <div className="h-6 sm:h-8 w-20 sm:w-24 bg-accent/20 rounded-md"></div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-3 sm:-top-5 -right-3 sm:-right-5 w-8 sm:w-16 h-8 sm:h-16 bg-primary/10 rounded-xl rotate-12 animate-float"></div>
                <div className="absolute -bottom-4 sm:-bottom-8 -left-4 sm:-left-8 w-10 sm:w-20 h-10 sm:h-20 bg-accent/10 rounded-full animate-float" style={{ animationDelay: "1.5s" }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-8 md:py-16 relative overflow-hidden">
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
              Expanda seu universo de produtividade
            </h2>
            <p className="text-base sm:text-lg text-foreground/80 mb-6 md:mb-10">
              Como o cosmos, suas ideias são infinitas. Organize-as em um único lugar e alcance as estrelas.
            </p>
            
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center items-center">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-4 sm:px-6 py-3 sm:py-4 rounded-xl max-w-[250px] sm:max-w-none">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                    <path d="M2 12h20"></path>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Global</div>
                  <div className="text-xs sm:text-sm text-foreground/60">Acesse de qualquer lugar</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-4 sm:px-6 py-3 sm:py-4 rounded-xl max-w-[250px] sm:max-w-none">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
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
                  <div className="text-xs sm:text-sm text-foreground/60">Fácil de usar</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="pt-6 sm:pt-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Recursos Principais
          </h2>
          <div className="w-full flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
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
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-8 md:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 md:mb-12">
            Planos e Preços
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Free */}
            <div className="border border-neutral/20 rounded-xl p-4 sm:p-6 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold">Free</h3>
                <div className="mt-2 text-2xl sm:text-3xl font-bold">R$ 0</div>
                <div className="text-xs sm:text-sm text-foreground/60">Para sempre</div>
              </div>
              
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Gerenciamento básico de tarefas
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Anotações em Markdown
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Limite de 50 notas
                </li>
              </ul>
              
              <Link href="/auth/register" className="block text-center py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm sm:text-base">
                Começar gratuitamente
              </Link>
            </div>
            
            {/* Plano Pro */}
            <div className="border-2 border-primary rounded-xl p-4 sm:p-6 bg-white/5 backdrop-blur-sm shadow-lg relative">
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium">
                Mais popular
              </div>
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold">Pro</h3>
                <div className="mt-2 text-2xl sm:text-3xl font-bold">R$ 12,90</div>
                <div className="text-xs sm:text-sm text-foreground/60">por mês</div>
              </div>
              
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Tudo do plano Free
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Tarefas e notas ilimitadas
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Flashcards e revisão espaçada ilimitadas
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Suporte prioritário
                </li>
              </ul>
              
              <Link href="/auth/register" className="block text-center py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm sm:text-base">
                Assinar agora
              </Link>
            </div>
            
            {/* Plano Teams */}
            <div className="border border-neutral/20 rounded-xl p-4 sm:p-6 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg relative overflow-visible mt-4">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-neutral text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium z-10">
                Em breve
              </div>
              <div className="text-center mb-4 sm:mb-6 mt-2">
                <h3 className="text-lg sm:text-xl font-bold">Teams</h3>
                <div className="mt-2 text-2xl sm:text-3xl font-bold">R$ 29,90</div>
                <div className="text-xs sm:text-sm text-foreground/60">por mês, até 5 membros</div>
              </div>
              
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Tudo do plano Pro
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Colaboração em tempo real
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Controle de permissões
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Histórico de versões completo
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Suporte prioritário
                </li>
              </ul>
              
              <div className="block text-center py-2 px-4 border border-neutral/30 text-foreground/60 rounded-lg cursor-not-allowed bg-neutral/5 text-sm sm:text-base">
                Disponível em breve
              </div>
              
              <div className="absolute -right-6 sm:-right-12 -bottom-6 sm:-bottom-12 w-16 sm:w-32 h-16 sm:h-32 bg-neutral/10 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-8 sm:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Comece a organizar sua vida agora
            </h2>
            <p className="text-base sm:text-lg text-foreground/80 mb-6 sm:mb-8">
              Junte-se e impulsione sua produtividade com o Synapsy!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/register" className="px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
                Criar conta gratuita
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Orbiting planets decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] rounded-full border border-primary/10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute w-2 sm:w-3 md:w-4 h-2 sm:h-3 md:h-4 bg-primary rounded-full left-0 top-1/2 -translate-y-1/2 animate-orbit"></div>
        </div>
        <div className="absolute w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] rounded-full border border-accent/10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute w-2 sm:w-2 md:w-3 h-2 sm:h-2 md:h-3 bg-accent rounded-full right-0 top-1/2 -translate-y-1/2 animate-orbit" style={{ animationDuration: "15s" }}></div>
        </div>
        <div className="absolute w-[100px] sm:w-[150px] md:w-[200px] h-[100px] sm:h-[150px] md:h-[200px] rounded-full border border-purple-500/10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute w-1 sm:w-1.5 md:w-2 h-1 sm:h-1.5 md:h-2 bg-purple-500 rounded-full left-1/2 -bottom-1 animate-orbit" style={{ animationDuration: "8s" }}></div>
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
