// Tipos gerais usados na aplicação

// Tipo para autenticação
export interface User {
  id: string;
  name: string;
  email: string | null;
  photoURL: string | null;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipo para tarefa
export interface Task {
  id: string;
  title: string;
  description?: string;
  isDone: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Tipo para anotação
export interface Note {
  id: string;
  title: string;
  content: string;
  categories?: string[];
  tags?: string[];
  isPinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Tipo para evento
export interface Event {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  color?: string;
  isFullDay?: boolean;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  isRecurring: boolean;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Tipo para estudo
export interface StudyTopic {
  id: string;
  userId: string;
  title: string;
  description: string;
  progress: number;
  totalHours: number;
  completedHours: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipo para recurso de estudo
export interface StudyResource {
  id: string;
  title: string;
  type: 'link' | 'file' | 'note';
  url?: string;
  fileId?: string;
  noteId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipo para matéria de estudo
export interface Subject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  progress: number;
  flashcardsCount: number;
  lastReviewed?: Date;
  nextReview?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipo para flashcard
export interface Flashcard {
  id: string;
  userId: string;
  subjectId: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  correctCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Tipo para dados do dashboard
export interface DashboardData {
  tasks: Task[];
  notes: Note[];
  events?: Event[];
  studyTopics?: StudyTopic[];
  subjects?: Subject[];
} 