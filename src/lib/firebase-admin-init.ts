// Este módulo usa Firebase Admin, que só é compatível com ambiente Node.js
export const runtime = 'nodejs';

import * as admin from 'firebase-admin';

// Função para inicializar o Firebase Admin
export function initAdmin(): admin.app.App | null {
  // Se já existe uma instância inicializada, retorna
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }
  
  try {
    // Verificar se a variável de ambiente está disponível
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Parsear a credencial da variável de ambiente
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Credenciais do Firebase Admin carregadas com sucesso da variável de ambiente');
      }
      
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Firebase Admin inicializado com sucesso');
      }
      return app;
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error('Variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não encontrada');
      }
      return null;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro ao inicializar Firebase Admin:', error);
    }
    return null;
  }
}

// Inicializar o app
const app = initAdmin();

// Exportar a variável app
export { app };

// Exportar instâncias de serviços, verificando se o app foi inicializado corretamente
export const db = app ? app.firestore() : null;

// Função para obter a instância de Auth, verificando se o app existe
export const getAuth = () => app ? app.auth() : null;

// Funções utilitárias para o Firebase Admin
export async function verifyToken(token: string) {
  if (!app) {
    throw new Error('Firebase Admin não inicializado. Verifique se a variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY está configurada.');
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
    throw new Error('Firebase Admin não inicializado. Verifique se a variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY está configurada.');
  }
  
  try {
    const userRecord = await app.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro ao buscar usuário por ID:', error);
    }
    throw error;
  }
} 