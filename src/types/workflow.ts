export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'Baixa' | 'Média' | 'Alta';
  status: 'Pendente' | 'Em Progresso' | 'Concluída';
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyTopic {
  id: string;
  title: string;
  description?: string;
  subject: string;
  progress: number;
  nextReview?: Date;
  flashcards?: Flashcard[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  lastReview?: Date;
  nextReview?: Date;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: 'Tarefa' | 'Estudo' | 'Evento';
  relatedItemId?: string; // ID da tarefa ou tópico de estudo relacionado
  createdAt: Date;
  updatedAt: Date;
} 