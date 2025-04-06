'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function CalendarPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            Calendário
          </h1>
          <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
            Novo Evento
          </button>
        </div>
        
        {/* Calendário Placeholder */}
        <div className="bg-white dark:bg-neutral rounded-lg shadow-sm border border-neutral/20 p-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => (
              <div key={i} className="text-center text-sm font-medium text-foreground/70 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i - 2; // Offset para começar do final do mês anterior
              const isCurrentMonth = day > 0 && day <= 30;
              const isToday = day === 15;
              const hasEvent = [5, 12, 15, 20, 25].includes(day);
              
              return (
                <div 
                  key={i} 
                  className={`
                    min-h-[80px] border border-neutral/10 rounded-md p-2
                    ${isCurrentMonth ? 'bg-white dark:bg-neutral' : 'bg-neutral/5 dark:bg-neutral-dark/5'}
                    ${isToday ? 'ring-2 ring-primary/40' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm ${isCurrentMonth ? 'text-foreground' : 'text-foreground/40'}`}>
                      {isCurrentMonth ? day : day <= 0 ? 30 + day : day - 30}
                    </span>
                    {hasEvent && isCurrentMonth && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  
                  {hasEvent && isCurrentMonth && (
                    <div className="mt-1">
                      <div className="text-xs px-1 py-0.5 rounded bg-primary/10 text-primary truncate">
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
    </MainLayout>
  );
} 