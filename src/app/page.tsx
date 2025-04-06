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
              <Link href="/tasks" className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
                Começar agora
              </Link>
              <Link href="#features" className="px-6 py-3 border border-primary text-primary font-medium rounded-lg hover:bg-primary/10 transition-colors">
                Conheça os recursos
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 backdrop-blur-sm">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-4xl">S</span>
                </div>
                <div className="absolute w-48 h-48 rounded-full border border-primary/20 animate-pulse"></div>
                <div className="absolute w-64 h-64 rounded-full border border-accent/20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute w-80 h-80 rounded-full border border-secondary/10 animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
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
              href="/tasks"
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
              href="/notes"
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
              href="/calendar"
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
              href="/study"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 text-center mt-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Pronto para aumentar sua produtividade?
          </h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-8">
            Comece a usar o Synapsy gratuitamente e descubra uma nova forma de organizar seus estudos e tarefas.
          </p>
          <Link href="/tasks" className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors inline-block">
            Começar agora
          </Link>
        </section>
      </div>
    </MainLayout>
  );
}

function FeatureCard({ title, description, icon, href }: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className="block group">
      <div className="h-full flex flex-col bg-white dark:bg-neutral rounded-xl p-6 border border-neutral/20 shadow-sm hover:border-primary/40 hover:shadow-md transition-all">
        <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-foreground/70 text-sm flex-1">{description}</p>
      </div>
    </Link>
  );
}
