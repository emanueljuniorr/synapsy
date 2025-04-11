// Este módulo usa Firebase Admin, que só é compatível com ambiente Node.js
export const runtime = 'nodejs';

import * as admin from 'firebase-admin';

// Verificar se o Firebase Admin já foi inicializado
let firebaseApp: admin.app.App;

// Função para inicializar o Firebase Admin
export function initAdmin() {
  if (admin.apps.length === 0) {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      // Verificar se as variáveis de ambiente necessárias estão definidas
      if (!projectId) {
        throw new Error("Variável de ambiente FIREBASE_PROJECT_ID não está definida");
      }
      
      if (!clientEmail) {
        throw new Error("Variável de ambiente FIREBASE_CLIENT_EMAIL não está definida");
      }
      
      if (!privateKey) {
        throw new Error("Variável de ambiente FIREBASE_PRIVATE_KEY não está definida");
      }
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      
      console.log('Firebase Admin inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar Firebase Admin:', error);
      throw error; // Propagar o erro para que seja mais fácil diagnosticar
    }
  } else {
    firebaseApp = admin.app();
  }
  return firebaseApp;
}

// Inicializar o app se ainda não foi inicializado
let app: admin.app.App | undefined;
try {
  app = initAdmin();
} catch (error) {
  console.error("Falha ao inicializar Firebase Admin:", error);
  // Não propagar o erro aqui para não impedir a aplicação de iniciar
}

// Exportar as instâncias do Firestore e Auth
export const db = app ? app.firestore() : null;
export const getAuth = () => app ? app.auth() : null;

// Funções utilitárias para o Firebase Admin
export async function verifyToken(token: string) {
  if (!app) {
    throw new Error("Firebase Admin não está inicializado");
  }
  
  try {
    const decodedToken = await app.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    throw error;
  }
}

export async function getUserById(uid: string) {
  if (!app) {
    throw new Error("Firebase Admin não está inicializado");
  }
  
  try {
    const userRecord = await app.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    throw error;
  }
} 