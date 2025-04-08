import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy, where } from 'firebase/firestore';
import { Note, CreateNoteInput, UpdateNoteInput } from '@/types/notes';

const COLLECTION_NAME = 'notes';

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const now = new Date();
  const noteData = {
    ...input,
    createdAt: now,
    updatedAt: now
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), noteData);
  return {
    id: docRef.id,
    ...noteData
  };
}

export async function updateNote(input: UpdateNoteInput): Promise<void> {
  const { id, ...data } = input;
  const noteRef = doc(db, COLLECTION_NAME, id);
  
  await updateDoc(noteRef, {
    ...data,
    updatedAt: new Date()
  });
}

export async function deleteNote(id: string): Promise<void> {
  const noteRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(noteRef);
}

export async function getNotes(): Promise<Note[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate()
  } as Note));
}

export async function getNoteById(id: string): Promise<Note | null> {
  const noteRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(noteRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt.toDate(),
    updatedAt: snapshot.data().updatedAt.toDate()
  } as Note;
}

export async function searchNotes(query: string): Promise<Note[]> {
  // Implementar busca por título e conteúdo
  const q = query.toLowerCase();
  const notesQuery = query(collection(db, COLLECTION_NAME));
  const snapshot = await getDocs(notesQuery);
  
  return snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as Note))
    .filter(note => 
      note.title.toLowerCase().includes(q) || 
      note.content.toLowerCase().includes(q) ||
      note.tags.some(tag => tag.toLowerCase().includes(q))
    );
} 