import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
  limit,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { User, Task, Note, Event, StudyTopic, Subject, Flashcard } from '@/types';

// Função para converter Timestamp do Firestore para Date
export const fromFirestore = (doc: QueryDocumentSnapshot<DocumentData>) => {
  const data = doc.data();
  const convertedData: Record<string, any> = { ...data, id: doc.id };
  
  // Converter Timestamps para Date
  Object.keys(data).forEach(key => {
    if (data[key] instanceof Timestamp) {
      convertedData[key] = data[key].toDate();
    }
  });
  
  return convertedData;
};

// Funções de Tarefas
export const getTasks = async (userId: string): Promise<Task[]> => {
  try {
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(tasksQuery);
    return querySnapshot.docs.map(doc => fromFirestore(doc) as Task);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    return [];
  }
};

export const getTask = async (taskId: string): Promise<Task | null> => {
  try {
    const taskDoc = await getDoc(doc(db, 'tasks', taskId));
    if (!taskDoc.exists()) return null;
    
    return { ...fromFirestore(taskDoc), id: taskDoc.id } as Task;
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    return null;
  }
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    const taskRef = await addDoc(collection(db, 'tasks'), {
      ...task,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return taskRef.id;
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return null;
  }
};

export const updateTask = async (taskId: string, task: Partial<Task>): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      ...task,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    return false;
  }
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
    return true;
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    return false;
  }
};

// Funções de Anotações
export const getNotes = async (userId: string): Promise<Note[]> => {
  try {
    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(notesQuery);
    return querySnapshot.docs.map(doc => fromFirestore(doc) as Note);
  } catch (error) {
    console.error('Erro ao buscar anotações:', error);
    return [];
  }
};

export const getNote = async (noteId: string): Promise<Note | null> => {
  try {
    const noteDoc = await getDoc(doc(db, 'notes', noteId));
    if (!noteDoc.exists()) return null;
    
    return { ...fromFirestore(noteDoc), id: noteDoc.id } as Note;
  } catch (error) {
    console.error('Erro ao buscar anotação:', error);
    return null;
  }
};

export const createNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    const noteRef = await addDoc(collection(db, 'notes'), {
      ...note,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return noteRef.id;
  } catch (error) {
    console.error('Erro ao criar anotação:', error);
    return null;
  }
};

export const updateNote = async (noteId: string, note: Partial<Note>): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'notes', noteId), {
      ...note,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar anotação:', error);
    return false;
  }
};

export const deleteNote = async (noteId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'notes', noteId));
    return true;
  } catch (error) {
    console.error('Erro ao deletar anotação:', error);
    return false;
  }
};

// Função para buscar os dados da página inicial do usuário
export const getDashboardData = async (userId: string): Promise<DashboardData> => {
  if (!userId) {
    throw new Error('ID de usuário não fornecido');
  }
  
  try {
    // Buscar tarefas recentes
    const tasksRef = collection(db, 'tasks');
    const tasksQuery = query(
      tasksRef,
      where('userId', '==', userId),
      orderBy('dueDate', 'asc'),
      limit(5)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    
    const tasks: Task[] = [];
    let pendingTasks = 0;
    let completedTasks = 0;

    tasksSnapshot.forEach(doc => {
      const data = doc.data();
      const task: Task = {
        id: doc.id,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
        completed: data.completed || false,
        priority: data.priority || 'medium',
        category: data.category
      };
      
      tasks.push(task);
    });

    // Buscar o total de tarefas pendentes
    const pendingTasksQuery = query(
      tasksRef, 
      where('userId', '==', userId),
      where('completed', '==', false)
    );
    const pendingTasksSnapshot = await getDocs(pendingTasksQuery);
    pendingTasks = pendingTasksSnapshot.size;

    // Buscar tarefas completadas
    const completedTasksQuery = query(
      tasksRef,
      where('userId', '==', userId),
      where('completed', '==', true)
    );
    const completedTasksSnapshot = await getDocs(completedTasksQuery);
    completedTasks = completedTasksSnapshot.size;
    
    // Buscar notas recentes
    const notesRef = collection(db, 'notes');
    const notesQuery = query(
      notesRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );
    const notesSnapshot = await getDocs(notesQuery);
    
    const notes: Note[] = [];
    notesSnapshot.forEach(doc => {
      const data = doc.data();
      notes.push({
        id: doc.id,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : undefined
      });
    });

    // Contar o total de notas
    const allNotesQuery = query(notesRef, where('userId', '==', userId));
    const allNotesSnapshot = await getDocs(allNotesQuery);
    const totalNotes = allNotesSnapshot.size;
    
    // Buscar matérias de estudo
    const subjectsRef = collection(db, 'subjects');
    const subjectsQuery = query(subjectsRef, where('userId', '==', userId));
    const subjectsSnapshot = await getDocs(subjectsQuery);
    
    const subjects: StudyTopic[] = [];
    let dueFlashcards = 0;
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    // Buscar dados de flashcards para cada matéria
    const subjectsPromises = subjectsSnapshot.docs.map(async (docSnap) => {
      const subjectData = docSnap.data();
      const flashcardsRef = collection(db, 'flashcards');
      const flashcardsQuery = query(
        flashcardsRef,
        where('subjectId', '==', docSnap.id),
        where('userId', '==', userId)
      );
      const flashcardsSnapshot = await getDocs(flashcardsQuery);
      
      // Contar flashcards para revisão hoje
      let subjectDueCount = 0;
      flashcardsSnapshot.docs.forEach(flashcardDoc => {
        const flashcard = flashcardDoc.data();
        if (!flashcard.nextReview) {
          subjectDueCount++;
        } else {
          const nextReview = flashcard.nextReview.toDate ? 
                flashcard.nextReview.toDate() : 
                new Date(flashcard.nextReview);
          if (nextReview <= today) {
            subjectDueCount++;
          }
        }
      });
      
      dueFlashcards += subjectDueCount;
      
      return {
        id: docSnap.id,
        name: subjectData.name,
        color: subjectData.color || '#4F46E5',
        totalFlashcards: flashcardsSnapshot.size,
        dueFlashcards: subjectDueCount
      };
    });
    
    const subjectsData = await Promise.all(subjectsPromises);
    subjects.push(...subjectsData);
    
    // Buscar dados de sessões de foco (últimos 7 dias)
    const focusSessionsRef = collection(db, 'focusSessions');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const focusSessionsQuery = query(
      focusSessionsRef,
      where('userId', '==', userId),
      where('endTime', '>=', sevenDaysAgo),
      orderBy('endTime', 'asc')
    );
    
    const focusSessionsSnapshot = await getDocs(focusSessionsQuery);
    
    // Organizar os dados por dia
    const sessionsByDay = new Map<string, number>();
    
    focusSessionsSnapshot.forEach(doc => {
      const data = doc.data();
      const date = data.endTime.toDate();
      const dateStr = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      const durationMinutes = Math.floor((data.endTime.toDate() - data.startTime.toDate()) / (1000 * 60));
      
      const existingMinutes = sessionsByDay.get(dateStr) || 0;
      sessionsByDay.set(dateStr, existingMinutes + durationMinutes);
    });
    
    const focusSessions = Array.from(sessionsByDay.entries()).map(([date, minutes]) => ({
      date,
      minutes
    }));
    
    // Preencher dias que faltam nos últimos 7 dias
    const allDays: { date: string, minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      allDays.push({
        date: dateStr,
        minutes: sessionsByDay.get(dateStr) || 0
      });
    }
    
    return {
      tasks,
      notes,
      subjects,
      counts: {
        pendingTasks,
        completedTasks,
        totalNotes,
        totalSubjects: subjects.length,
        dueFlashcards
      },
      focusSessions: allDays
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    // Retornar estrutura vazia em vez de lançar erro
    return {
      tasks: [],
      notes: [],
      subjects: [],
      counts: {
        pendingTasks: 0,
        completedTasks: 0,
        totalNotes: 0,
        totalSubjects: 0,
        dueFlashcards: 0
      },
      focusSessions: []
    };
  }
};

// Função para buscar notas recentes
export const getRecentNotes = async (userId: string, limitCount: number = 5): Promise<Note[]> => {
  try {
    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(notesQuery);
    return querySnapshot.docs.map(doc => fromFirestore(doc) as Note);
  } catch (error) {
    console.error('Erro ao buscar notas recentes:', error);
    return [];
  }
};

// Funções de Tópicos de Estudo
export const getStudyTopics = async (userId: string): Promise<StudyTopic[]> => {
  try {
    const topicsQuery = query(
      collection(db, 'studyTopics'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(topicsQuery);
    return querySnapshot.docs.map(doc => fromFirestore(doc) as StudyTopic);
  } catch (error) {
    console.error('Erro ao buscar tópicos de estudo:', error);
    return [];
  }
};

// Funções de Eventos
export const getUpcomingEvents = async (userId: string): Promise<Event[]> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventsQuery = query(
      collection(db, 'events'),
      where('userId', '==', userId),
      where('startDate', '>=', today),
      orderBy('startDate', 'asc')
    );
    
    const querySnapshot = await getDocs(eventsQuery);
    return querySnapshot.docs.map(doc => fromFirestore(doc) as Event);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return [];
  }
};

// Funções para matérias de estudo (subjects)
export const getSubjects = async (userId: string): Promise<Subject[]> => {
  try {
    const subjectsQuery = query(
      collection(db, 'subjects'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(subjectsQuery);
    return querySnapshot.docs.map(doc => fromFirestore(doc) as Subject);
  } catch (error) {
    console.error('Erro ao buscar matérias:', error);
    return [];
  }
};

export const getSubject = async (subjectId: string): Promise<Subject | null> => {
  try {
    const subjectDoc = await getDoc(doc(db, 'subjects', subjectId));
    if (!subjectDoc.exists()) return null;
    
    return { ...fromFirestore(subjectDoc), id: subjectDoc.id } as Subject;
  } catch (error) {
    console.error('Erro ao buscar matéria:', error);
    return null;
  }
};

export const createSubject = async (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt' | 'flashcardsCount'>): Promise<string | null> => {
  try {
    const subjectData = {
      ...subject,
      flashcardsCount: 0, // Inicialmente, não há flashcards
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const subjectRef = await addDoc(collection(db, 'subjects'), subjectData);
    return subjectRef.id;
  } catch (error) {
    console.error('Erro ao criar matéria:', error);
    return null;
  }
};

export const updateSubject = async (subjectId: string, subject: Partial<Subject>): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'subjects', subjectId), {
      ...subject,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar matéria:', error);
    return false;
  }
};

export const deleteSubject = async (subjectId: string): Promise<boolean> => {
  try {
    // Primeiro, excluir todos os flashcards associados à matéria
    const flashcardsQuery = query(
      collection(db, 'flashcards'),
      where('subjectId', '==', subjectId)
    );
    
    const flashcardsSnapshot = await getDocs(flashcardsQuery);
    
    // Excluir flashcards em paralelo
    const deletePromises = flashcardsSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    
    // Então, excluir a matéria
    await deleteDoc(doc(db, 'subjects', subjectId));
    return true;
  } catch (error) {
    console.error('Erro ao deletar matéria:', error);
    return false;
  }
};

// Funções para flashcards
export const getFlashcards = async (subjectId: string): Promise<Flashcard[]> => {
  try {
    const flashcardsQuery = query(
      collection(db, 'flashcards'),
      where('subjectId', '==', subjectId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(flashcardsQuery);
    return querySnapshot.docs.map(doc => fromFirestore(doc) as Flashcard);
  } catch (error) {
    console.error('Erro ao buscar flashcards:', error);
    return [];
  }
};

export const getFlashcardsForReview = async (subjectId: string): Promise<Flashcard[]> => {
  try {
    const today = new Date();
    
    // Obter todos os flashcards da matéria
    const flashcardsQuery = query(
      collection(db, 'flashcards'),
      where('subjectId', '==', subjectId)
    );
    
    const querySnapshot = await getDocs(flashcardsQuery);
    const flashcards = querySnapshot.docs.map(doc => fromFirestore(doc) as Flashcard);
    
    // Filtrar flashcards que precisam de revisão (próxima revisão <= hoje ou sem data de revisão)
    return flashcards.filter(flashcard => 
      !flashcard.nextReview || flashcard.nextReview <= today
    );
  } catch (error) {
    console.error('Erro ao buscar flashcards para revisão:', error);
    return [];
  }
};

export const getFlashcard = async (flashcardId: string): Promise<Flashcard | null> => {
  try {
    const flashcardDoc = await getDoc(doc(db, 'flashcards', flashcardId));
    if (!flashcardDoc.exists()) return null;
    
    return { ...fromFirestore(flashcardDoc), id: flashcardDoc.id } as Flashcard;
  } catch (error) {
    console.error('Erro ao buscar flashcard:', error);
    return null;
  }
};

export const createFlashcard = async (flashcard: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount' | 'correctCount'>): Promise<string | null> => {
  try {
    // Obter a referência da matéria
    const subjectRef = doc(db, 'subjects', flashcard.subjectId);
    const subjectDoc = await getDoc(subjectRef);
    
    if (!subjectDoc.exists()) {
      throw new Error('Matéria não encontrada');
    }
    
    // Adicionar flashcard com contadores inicializados
    const flashcardData = {
      ...flashcard,
      reviewCount: 0,
      correctCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const flashcardRef = await addDoc(collection(db, 'flashcards'), flashcardData);
    
    // Atualizar contador de flashcards na matéria
    const subject = fromFirestore(subjectDoc) as Subject;
    await updateDoc(subjectRef, {
      flashcardsCount: (subject.flashcardsCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
    
    return flashcardRef.id;
  } catch (error) {
    console.error('Erro ao criar flashcard:', error);
    return null;
  }
};

export const updateFlashcard = async (flashcardId: string, flashcard: Partial<Flashcard>): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'flashcards', flashcardId), {
      ...flashcard,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar flashcard:', error);
    return false;
  }
};

export const deleteFlashcard = async (flashcardId: string, subjectId: string): Promise<boolean> => {
  try {
    // Excluir o flashcard
    await deleteDoc(doc(db, 'flashcards', flashcardId));
    
    // Atualizar o contador na matéria
    const subjectRef = doc(db, 'subjects', subjectId);
    const subjectDoc = await getDoc(subjectRef);
    
    if (subjectDoc.exists()) {
      const subject = fromFirestore(subjectDoc) as Subject;
      await updateDoc(subjectRef, {
        flashcardsCount: Math.max(0, (subject.flashcardsCount || 0) - 1),
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao deletar flashcard:', error);
    return false;
  }
};

// Função para registrar uma sessão de estudo com flashcards
export const recordFlashcardReview = async (flashcardId: string, isCorrect: boolean): Promise<boolean> => {
  try {
    const flashcardRef = doc(db, 'flashcards', flashcardId);
    const flashcardDoc = await getDoc(flashcardRef);
    
    if (!flashcardDoc.exists()) {
      return false;
    }
    
    const flashcard = fromFirestore(flashcardDoc) as Flashcard;
    const reviewCount = (flashcard.reviewCount || 0) + 1;
    const correctCount = isCorrect ? (flashcard.correctCount || 0) + 1 : (flashcard.correctCount || 0);
    
    // Calcular próxima data de revisão usando o algoritmo de repetição espaçada
    // Baseado em uma versão simplificada do algoritmo SM-2
    const performanceRatio = correctCount / reviewCount;
    let daysUntilNextReview = 1; // Padrão: revisar amanhã
    
    if (reviewCount > 1) {
      if (performanceRatio >= 0.8) {
        // Desempenho excelente: próxima revisão em período mais longo
        daysUntilNextReview = Math.min(30, Math.round(reviewCount * 2));
      } else if (performanceRatio >= 0.6) {
        // Desempenho bom: próxima revisão em período médio
        daysUntilNextReview = Math.min(14, Math.round(reviewCount * 1.5));
      } else {
        // Desempenho regular: próxima revisão em breve
        daysUntilNextReview = Math.min(7, Math.max(1, Math.round(reviewCount * 0.5)));
      }
    }
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + daysUntilNextReview);
    
    // Atualizar flashcard com os novos valores
    await updateDoc(flashcardRef, {
      reviewCount,
      correctCount,
      lastReviewed: new Date(),
      nextReview,
      updatedAt: serverTimestamp()
    });
    
    // Atualizar matéria associada
    await updateSubjectReviewStatus(flashcard.subjectId);
    
    return true;
  } catch (error) {
    console.error('Erro ao registrar revisão de flashcard:', error);
    return false;
  }
};

// Função auxiliar para atualizar o status de revisão de uma matéria
export const updateSubjectReviewStatus = async (subjectId: string): Promise<boolean> => {
  try {
    const subjectRef = doc(db, 'subjects', subjectId);
    const subjectDoc = await getDoc(subjectRef);
    
    if (!subjectDoc.exists()) {
      return false;
    }
    
    // Buscar todos os flashcards da matéria
    const flashcardsQuery = query(
      collection(db, 'flashcards'),
      where('subjectId', '==', subjectId)
    );
    
    const flashcardsSnapshot = await getDocs(flashcardsQuery);
    const flashcards = flashcardsSnapshot.docs.map(doc => fromFirestore(doc) as Flashcard);
    
    // Se não há flashcards, não atualizar
    if (flashcards.length === 0) {
      return true;
    }
    
    // Calcular a data da próxima revisão (a mais próxima dentre todos os flashcards)
    let nextReviewDate: Date | null = null;
    let latestReviewDate: Date | null = null;
    
    flashcards.forEach(flashcard => {
      // Atualizar data da última revisão
      if (flashcard.lastReviewed) {
        if (!latestReviewDate || flashcard.lastReviewed > latestReviewDate) {
          latestReviewDate = flashcard.lastReviewed;
        }
      }
      
      // Encontrar a próxima data de revisão mais próxima
      if (flashcard.nextReview) {
        if (!nextReviewDate || flashcard.nextReview < nextReviewDate) {
          nextReviewDate = flashcard.nextReview;
        }
      }
    });
    
    // Calcular o progresso com base no número de revisões corretas
    const totalReviews = flashcards.reduce((sum, card) => sum + (card.reviewCount || 0), 0);
    const totalCorrect = flashcards.reduce((sum, card) => sum + (card.correctCount || 0), 0);
    const progress = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
    
    // Atualizar a matéria
    await updateDoc(subjectRef, {
      lastReviewed: latestReviewDate || null,
      nextReview: nextReviewDate || null,
      progress,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status de revisão da matéria:', error);
    return false;
  }
};

} 