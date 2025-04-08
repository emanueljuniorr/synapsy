'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getStudyTopics } from '@/lib/firestore';
import { StudyTopic } from '@/types';
import { formatDate } from '@/lib/utils';

export default function StudyTopics() {
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTopics = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const studyTopics = await getStudyTopics(user.id);
        // Ordena por progresso (menor para maior) e limita a 5 tópicos
        const sortedTopics = studyTopics
          .sort((a, b) => a.progress - b.progress)
          .slice(0, 5);
        setTopics(sortedTopics);
      } catch (error) {
        console.error('Erro ao buscar tópicos de estudo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-foreground/60 mb-4">Nenhum tópico de estudo criado</p>
        <Link 
          href="/studies/new" 
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
          Criar Tópico
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <Link 
          key={topic.id} 
          href={`/studies/${topic.id}`}
          className="block p-4 rounded-lg bg-background/50 hover:bg-background/70 border border-white/5 hover:border-primary/30 transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium mb-1 truncate">{topic.title}</h3>
              {topic.description && (
                <p className="text-sm text-foreground/60 truncate">{topic.description}</p>
              )}
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-foreground/60">Progresso</span>
              <span className="text-xs font-medium">{topic.progress}%</span>
            </div>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${topic.progress}%` }}
              />
            </div>
          </div>
          {topic.dueDate && (
            <div className="mt-2 text-xs text-foreground/40">
              Meta: {formatDate(topic.dueDate)}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
} 