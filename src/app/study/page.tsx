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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            Estudos
          </h1>
          <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
            Nova Matéria
          </button>
        </div>
        
        {/* Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
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
        <div className="bg-white dark:bg-neutral rounded-lg shadow-sm border border-neutral/20 overflow-hidden">
          <div className="p-4 border-b border-neutral/20">
            <h2 className="text-xl font-semibold">Suas Matérias</h2>
          </div>
          
          <div className="divide-y divide-neutral/10">
            {subjects.map(subject => (
              <div key={subject.id} className="p-4 hover:bg-neutral/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{subject.name}</h3>
                    <p className="text-sm text-foreground/60">
                      {subject.topicsCount} tópicos • Próxima revisão: {subject.nextReview}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium">{subject.progress}%</span>
                      <div className="w-24 h-2 bg-neutral/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${subject.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <button className="p-2 text-foreground/60 hover:text-primary">
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
    </MainLayout>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-neutral rounded-lg shadow-sm border border-neutral/20 p-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-foreground/70 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
} 