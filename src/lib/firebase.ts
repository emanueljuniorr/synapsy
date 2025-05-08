'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Verificar se todas as variáveis de ambiente necessárias estão definidas
const isConfigValid = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Usar configuração vazia que indicará que não está configurado
const firebaseConfig = isConfigValid ? {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} : null;

// Verificar se estamos no cliente
const isClient = typeof window !== 'undefined';

// Variáveis para armazenar as instâncias do Firebase
let app;
let auth;
let db;
let storage;

// Inicializar o Firebase apenas se houver configuração válida
if (firebaseConfig) {
  try {
// Inicializar o Firebase (evitando múltiplas instâncias)
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Configurar persistência de autenticação apenas no cliente
    if (isClient) {
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
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    // Em caso de erro, definir valores como objetos vazios/nulos para evitar erros
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
} else {
  console.warn('Firebase não configurado. Verifique as variáveis de ambiente NEXT_PUBLIC_FIREBASE_*');
  // Definir valores como objetos vazios/nulos quando não há configuração
  app = null;
  auth = null;
  db = null;
  storage = null;
}

export { app, auth, db, storage };

// Mostrar aviso em desenvolvimento se não configurado corretamente
if (process.env.NODE_ENV === 'development' && !isConfigValid) {
  console.warn(
    'Firebase não configurado completamente. Certifique-se de configurar as variáveis de ambiente NEXT_PUBLIC_FIREBASE_* no arquivo .env.local'
  );
}

// Configuração temporária para desenvolvimento (remover em produção)
if (process.env.NODE_ENV === 'development') {
  // Definindo valores padrão para desenvolvimento - substituir com seu projeto real
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.warn(
      'Firebase não configurado completamente. Utilizando configuração temporária para desenvolvimento.'
    );
  }
} 