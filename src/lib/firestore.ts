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
import { db } from './firebase';
import { User, Task, Note, Event, StudyTopic } from '@/types';

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
export const getDashboardData = async (userId: string) => {
  try {
    // Buscar tarefas recentes
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      where('isDone', '==', false),
      orderBy('dueDate', 'asc'),
      limit(5)
    );
    
    // Buscar anotações recentes
    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(3)
    );
    
    // Buscar eventos próximos
    // Nota: É necessário criar um índice composto no Firebase para esta consulta:
    // Coleção: events, Campos: userId ASC, startDate ASC, __name__ ASC
    // Link: https://console.firebase.google.com/v1/r/project/synapsy-app/firestore/indexes?create_composite=Ckpwcm9qZWN0cy9zeW5hcHN5LWFwcC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZXZlbnRzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCXN0YXJ0RGF0ZRABGgwKCF9fbmFtZV9fEAE
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Versão temporária da consulta sem ordenação para evitar o erro de índice
    const eventsQuery = query(
      collection(db, 'events'),
      where('userId', '==', userId),
      where('startDate', '>=', today),
      limit(5)
    );
    
    // Versão original da consulta (requer índice):
    // const eventsQuery = query(
    //   collection(db, 'events'),
    //   where('userId', '==', userId),
    //   where('startDate', '>=', today),
    //   orderBy('startDate', 'asc'),
    //   limit(3)
    // );
    
    // Buscar tópicos de estudo
    const studyQuery = query(
      collection(db, 'studyTopics'),
      where('userId', '==', userId),
      orderBy('progress', 'desc'),
      limit(3)
    );
    
    // Executar todas as consultas em paralelo
    const [tasksSnapshot, notesSnapshot, eventsSnapshot, studySnapshot] = await Promise.all([
      getDocs(tasksQuery),
      getDocs(notesQuery),
      getDocs(eventsQuery),
      getDocs(studyQuery)
    ]);
    
    // Processar resultados
    const tasks = tasksSnapshot.docs.map(doc => fromFirestore(doc) as Task);
    const notes = notesSnapshot.docs.map(doc => fromFirestore(doc) as Note);
    const events = eventsSnapshot.docs.map(doc => fromFirestore(doc) as Event);
    
    // Ordenar eventos manualmente (já que removemos o orderBy da consulta)
    const sortedEvents = [...events].sort((a, b) => {
      const dateA = a.startDate instanceof Date ? a.startDate : new Date(a.startDate);
      const dateB = b.startDate instanceof Date ? b.startDate : new Date(b.startDate);
      return dateA.getTime() - dateB.getTime();
    }).slice(0, 3); // Limitar a 3 eventos como na consulta original
    
    const studyTopics = studySnapshot.docs.map(doc => fromFirestore(doc) as StudyTopic);
    
    // Contagens
    const pendingTasksCount = tasks.length;
    const totalNotesCount = (await getDocs(query(
      collection(db, 'notes'),
      where('userId', '==', userId)
    ))).docs.length;
    const upcomingEventsCount = events.length;
    
    return {
      tasks,
      notes,
      events: sortedEvents,
      studyTopics,
      counts: {
        pendingTasks: pendingTasksCount,
        totalNotes: totalNotesCount,
        upcomingEvents: upcomingEventsCount,
      }
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return {
      tasks: [],
      notes: [],
      events: [],
      studyTopics: [],
      counts: {
        pendingTasks: 0,
        totalNotes: 0,
        upcomingEvents: 0,
      }
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