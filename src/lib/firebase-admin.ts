// Este módulo usa Firebase Admin, que só é compatível com ambiente Node.js
export const runtime = 'nodejs';

import * as admin from 'firebase-admin';
// Importar as credenciais usando require para evitar problemas de compilação
// Isso funciona porque estamos em um ambiente NodeJS neste módulo
// @ts-ignore
const serviceAccount = require('./synapsy-app-firebase-adminsdk-fbsvc-10a6ee3adc.json');

// Função para inicializar o Firebase Admin
export function initAdmin(): admin.app.App {
  if (admin.apps.length === 0) {
    try {
      const firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });
      
      console.log('Firebase Admin inicializado com sucesso');
      return firebaseApp;
    } catch (error) {
      console.error('Erro ao inicializar Firebase Admin:', error);
      throw error; // Propagar o erro para que seja mais fácil diagnosticar
    }
  } else {
    return admin.app();
  }
}

// Inicializar o app imediatamente - declaramos como admin.app.App sem o undefined
const app: admin.app.App = initAdmin();

// Exportar as instâncias do Firestore e Auth - não é mais necessário usar ! ou operador ternário
export const db = app.firestore();
export const getAuth = () => app.auth();

// Funções utilitárias para o Firebase Admin
export async function verifyToken(token: string) {
  try {
    const decodedToken = await app.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    throw error;
  }
}

export async function getUserById(uid: string) {
  try {
    const userRecord = await app.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    throw error;
  }
} 