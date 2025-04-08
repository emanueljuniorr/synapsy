import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Task, Note, StudyTopic, CalendarEvent } from '@/types/workflow';

// Tasks
export async function createTask(userId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
  const taskData = {
    ...task,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId
  };

  const docRef = await addDoc(collection(db, 'tasks'), taskData);
  
  // Criar evento no calendário
  await createCalendarEvent({
    title: task.title,
    description: task.description,
    startDate: task.dueDate,
    endDate: task.dueDate,
    type: 'Tarefa',
    relatedItemId: docRef.id,
    userId
  });

  return docRef.id;
}

export async function updateTask(taskId: string, task: Partial<Task>) {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    ...task,
    updatedAt: new Date()
  });
}

export async function deleteTask(taskId: string) {
  await deleteDoc(doc(db, 'tasks', taskId));
  
  // Deletar evento relacionado do calendário
  const eventsQuery = query(
    collection(db, 'calendar'),
    where('relatedItemId', '==', taskId),
    where('type', '==', 'Tarefa')
  );
  
  const events = await getDocs(eventsQuery);
  events.forEach(async (event) => {
    await deleteDoc(doc(db, 'calendar', event.id));
  });
}

// Notes
export async function createNote(userId: string, note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
  const noteData = {
    ...note,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId
  };

  const docRef = await addDoc(collection(db, 'notes'), noteData);
  return docRef.id;
}

export async function updateNote(noteId: string, note: Partial<Note>) {
  const noteRef = doc(db, 'notes', noteId);
  await updateDoc(noteRef, {
    ...note,
    updatedAt: new Date()
  });
}

export async function deleteNote(noteId: string) {
  await deleteDoc(doc(db, 'notes', noteId));
}

// Study Topics
export async function createStudyTopic(userId: string, topic: Omit<StudyTopic, 'id' | 'createdAt' | 'updatedAt'>) {
  const topicData = {
    ...topic,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId
  };

  const docRef = await addDoc(collection(db, 'studyTopics'), topicData);
  
  if (topic.nextReview) {
    await createCalendarEvent({
      title: `Revisão: ${topic.title}`,
      description: topic.description,
      startDate: topic.nextReview,
      endDate: topic.nextReview,
      type: 'Estudo',
      relatedItemId: docRef.id,
      userId
    });
  }

  return docRef.id;
}

export async function updateStudyTopic(topicId: string, topic: Partial<StudyTopic>) {
  const topicRef = doc(db, 'studyTopics', topicId);
  await updateDoc(topicRef, {
    ...topic,
    updatedAt: new Date()
  });
}

export async function deleteStudyTopic(topicId: string) {
  await deleteDoc(doc(db, 'studyTopics', topicId));
  
  // Deletar eventos relacionados do calendário
  const eventsQuery = query(
    collection(db, 'calendar'),
    where('relatedItemId', '==', topicId),
    where('type', '==', 'Estudo')
  );
  
  const events = await getDocs(eventsQuery);
  events.forEach(async (event) => {
    await deleteDoc(doc(db, 'calendar', event.id));
  });
}

// Calendar Events
export async function createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> & { userId: string }) {
  const eventData = {
    ...event,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const docRef = await addDoc(collection(db, 'calendar'), eventData);
  return docRef.id;
}

export async function updateCalendarEvent(eventId: string, event: Partial<CalendarEvent>) {
  const eventRef = doc(db, 'calendar', eventId);
  await updateDoc(eventRef, {
    ...event,
    updatedAt: new Date()
  });
}

export async function deleteCalendarEvent(eventId: string) {
  await deleteDoc(doc(db, 'calendar', eventId));
}

// Queries
export async function getUserTasks(userId: string) {
  const tasksQuery = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('dueDate', 'asc')
  );
  
  const snapshot = await getDocs(tasksQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Task[];
}

export async function getUserNotes(userId: string) {
  const notesQuery = query(
    collection(db, 'notes'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  const snapshot = await getDocs(notesQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Note[];
}

export async function getUserStudyTopics(userId: string) {
  const topicsQuery = query(
    collection(db, 'studyTopics'),
    where('userId', '==', userId),
    orderBy('nextReview', 'asc')
  );
  
  const snapshot = await getDocs(topicsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as StudyTopic[];
}

export async function getUserCalendarEvents(userId: string, startDate: Date, endDate: Date) {
  const eventsQuery = query(
    collection(db, 'calendar'),
    where('userId', '==', userId),
    where('startDate', '>=', startDate),
    where('startDate', '<=', endDate),
    orderBy('startDate', 'asc')
  );
  
  const snapshot = await getDocs(eventsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CalendarEvent[];
} 