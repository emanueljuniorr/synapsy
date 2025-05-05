// Este módulo usa Firebase Admin, que só é compatível com ambiente Node.js
export const runtime = 'nodejs';

import * as admin from 'firebase-admin';
import { join } from 'path';
import * as fs from 'fs';

let serviceAccount: any;

// Tentar carregar o arquivo de credenciais usando caminho absoluto
try {
  // Verificar primeiro no diretório raiz (onde deveria estar em produção)
  const rootPath = join(process.cwd(), 'synapsy-app-firebase-adminsdk-fbsvc-f30e374c20.json');
  
  if (fs.existsSync(rootPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(rootPath, 'utf8'));
    console.log('Credenciais do Firebase Admin carregadas do diretório raiz');
  }
} catch (error) {
  console.error('Erro ao carregar credenciais do Firebase Admin:', error);
  // Em vez de lançar erro, definimos o serviceAccount como null e verificamos depois
  serviceAccount = null;
}

// Função para inicializar o Firebase Admin
export function initAdmin(): admin.app.App | null {
  // Se já existe uma instância inicializada, retorna
  if (admin.apps.length > 0) {
    return admin.app();
  }
  
  // Se não conseguimos carregar as credenciais, retorna null
  if (!serviceAccount) {
    console.error('Não foi possível inicializar o Firebase Admin: credenciais não disponíveis');
    return null;
  }
  
  try {
    const firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    
    console.log('Firebase Admin inicializado com sucesso');
    return firebaseApp;
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin:', error);
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
    throw new Error('Firebase Admin não inicializado');
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
    throw new Error('Firebase Admin não inicializado');
  }
  
  try {
    const userRecord = await app.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    throw error;
  }
} 