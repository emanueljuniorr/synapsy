import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Inicializar o Firebase (evitando múltiplas instâncias)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configurar persistência de autenticação (localStorage)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      // Remover log em produção, manter apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
      console.log('Persistência de autenticação configurada');
      }
    })
    .catch((error) => {
      console.error('Erro ao configurar persistência:', error);
    });
}

export { app, auth, db, storage };

// Configuração temporária para desenvolvimento (remover em produção)
if (process.env.NODE_ENV === 'development') {
  // Definindo valores padrão para desenvolvimento - substituir com seu projeto real
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.warn(
      'Firebase não configurado completamente. Utilizando configuração temporária para desenvolvimento.'
    );
  }
} 