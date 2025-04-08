'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUpcomingEvents } from '@/lib/firestore';
import { Event } from '@/types';
import { formatDate } from '@/lib/utils';

export default function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const upcomingEvents = await getUpcomingEvents(user.id);
        // Ordena por data de início e limita a 5 eventos
        const sortedEvents = upcomingEvents
          .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
          .slice(0, 5);
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-foreground/60 mb-4">Nenhum evento agendado</p>
        <Link 
          href="/calendar/new" 
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
          Agendar Evento
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Link 
          key={event.id} 
          href={`/calendar/${event.id}`}
          className="block p-4 rounded-lg bg-background/50 hover:bg-background/70 border border-white/5 hover:border-primary/30 transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium mb-1 truncate">{event.title}</h3>
              {event.description && (
                <p className="text-sm text-foreground/60 truncate">{event.description}</p>
              )}
            </div>
            {event.color && (
              <div 
                className="w-3 h-3 rounded-full mt-1.5"
                style={{ backgroundColor: event.color }}
              />
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-foreground/40">
              {event.isFullDay ? (
                formatDate(event.startDate)
              ) : (
                `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`
              )}
            </div>
            {event.location && (
              <div className="text-xs text-foreground/40 truncate ml-4">
                {event.location}
              </div>
            )}
          </div>
          {event.recurrence !== 'none' && (
            <div className="mt-1 text-xs text-primary/60">
              {event.recurrence === 'daily' && 'Repete diariamente'}
              {event.recurrence === 'weekly' && 'Repete semanalmente'}
              {event.recurrence === 'monthly' && 'Repete mensalmente'}
              {event.recurrence === 'yearly' && 'Repete anualmente'}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
} 