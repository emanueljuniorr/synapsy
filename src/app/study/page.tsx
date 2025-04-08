'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function StudyPage() {
  // Dados de exemplo para o módulo de estudos
  const subjects = [
    {
      id: '1',
      name: 'Matemática',
      progress: 65,
      topicsCount: 8,
      nextReview: '2 dias',
    },
    {
      id: '2',
      name: 'Programação',
      progress: 42,
      topicsCount: 12,
      nextReview: '1 dia',
    },
    {
      id: '3',
      name: 'Inglês',
      progress: 78,
      topicsCount: 6,
      nextReview: '4 dias',
    },
    {
      id: '4',
      name: 'História',
      progress: 25,
      topicsCount: 10,
      nextReview: 'Hoje',
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Elementos decorativos espaciais */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary rounded-full animate-twinkle" />
          <div className="absolute top-40 right-1/3 w-1 h-1 bg-primary rounded-full animate-twinkle delay-100" />
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary rounded-full animate-twinkle delay-200" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Estudos
              </h1>
              <p className="text-foreground/60 mt-1">
                Gerencie seu aprendizado de forma eficiente
              </p>
            </div>
            <button className="group relative px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Nova Matéria</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
            </button>
          </div>
          
          {/* Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Matérias" 
              value={subjects.length.toString()} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              }
            />
            <StatCard 
              title="Flashcards" 
              value="45" 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
              }
            />
            <StatCard 
              title="Tempo Estudado" 
              value="12h" 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              }
            />
            <StatCard 
              title="Próxima Revisão" 
              value="Hoje" 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v9l6 3"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              }
            />
          </div>
          
          {/* Lista de Matérias */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Suas Matérias</h2>
            
            <div className="divide-y divide-white/10">
              {subjects.map(subject => (
                <div key={subject.id} className="py-4 hover:bg-white/5 transition-all rounded-xl px-4 -mx-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground/90">{subject.name}</h3>
                      <p className="text-sm text-foreground/60">
                        {subject.topicsCount} tópicos • Próxima revisão: {subject.nextReview}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-foreground/90">{subject.progress}%</span>
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${subject.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <button className="p-2 text-foreground/60 hover:text-primary transition-colors rounded-xl hover:bg-primary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="19" cy="12" r="1"></circle>
                          <circle cx="5" cy="12" r="1"></circle>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-foreground/60">
              Em breve: flashcards, sistema de repetição espaçada, cronogramas de estudo e mais!
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg hover:border-primary/30 transition-all group">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-foreground/60 text-sm">{title}</p>
          <p className="text-2xl font-bold text-foreground/90">{value}</p>
        </div>
      </div>
    </div>
  );
} 