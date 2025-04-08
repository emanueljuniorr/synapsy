'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function CalendarPage() {
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
                Calendário
              </h1>
              <p className="text-foreground/60 mt-1">
                Organize seu tempo e compromissos
              </p>
            </div>
            <button className="group relative px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Novo Evento</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
            </button>
          </div>
          
          {/* Calendário */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => (
                <div key={i} className="text-center text-sm font-medium text-foreground/70 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i - 2;
                const isCurrentMonth = day > 0 && day <= 30;
                const isToday = day === 15;
                const hasEvent = [5, 12, 15, 20, 25].includes(day);
                
                return (
                  <div 
                    key={i} 
                    className={`
                      min-h-[80px] border border-white/10 rounded-xl p-2 transition-all
                      ${isCurrentMonth ? 'bg-white/5' : 'bg-white/[0.02]'}
                      ${isToday ? 'ring-2 ring-primary/40' : ''}
                      hover:bg-white/10
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-sm ${isCurrentMonth ? 'text-foreground/90' : 'text-foreground/40'}`}>
                        {isCurrentMonth ? day : day <= 0 ? 30 + day : day - 30}
                      </span>
                      {hasEvent && isCurrentMonth && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    
                    {hasEvent && isCurrentMonth && (
                      <div className="mt-1">
                        <div className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 truncate">
                          {day === 5 && 'Reunião: 14:00'}
                          {day === 12 && 'Entrega: 10:00'}
                          {day === 15 && 'Aula: 19:00'}
                          {day === 20 && 'Revisão: 16:00'}
                          {day === 25 && 'Prova: 08:00'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-foreground/60">
              Em breve: integração com tarefas, eventos recorrentes e mais funcionalidades!
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 