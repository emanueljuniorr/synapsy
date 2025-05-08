// Este módulo usa Firebase Admin, que só é compatível com ambiente Node.js
export const runtime = 'nodejs';

import * as admin from 'firebase-admin';
import { join } from 'path';
import * as fs from 'fs';

// Função para inicializar o Firebase Admin
export function initAdmin(): admin.app.App | null {
  // Se já existe uma instância inicializada, retorna
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }
  
  try {
    // Caminho para o arquivo de credenciais
    const serviceAccountPath = join(process.cwd(), 'src', 'lib', 'synapsy-app-firebase-adminsdk-fbsvc-72e1d0286c.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      if (process.env.NODE_ENV === 'development') {
        console.log('Credenciais do Firebase Admin carregadas com sucesso');
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
        console.error('Arquivo de credenciais não encontrado em:', serviceAccountPath);
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
    throw new Error('Firebase Admin não inicializado. Verifique se o arquivo de credenciais existe.');
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
    throw new Error('Firebase Admin não inicializado. Verifique se o arquivo de credenciais existe.');
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