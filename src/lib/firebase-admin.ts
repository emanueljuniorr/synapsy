'use client';

// Verificar se estamos no ambiente do navegador
const isClient = typeof window !== 'undefined';

// Quando é usado do lado do cliente, fornecemos apenas stubs
// que lançam erro se forem de fato chamados

// Stub de objeto de aplicativo
const app = null;

// Exportar a variável app como stub
export { app };

// Exportar stubs para serviços
export const db = null;

// Função para obter a instância de Auth (stub)
export const getAuth = () => null;

// Funções utilitárias (stubs)
export async function verifyToken(token: string) {
  if (isClient) {
    throw new Error('Firebase Admin não pode ser usado no cliente');
  }
  
  // Esta linha nunca deve ser atingida no cliente
  throw new Error('Firebase Admin não inicializado. Este stub não deve ser usado.');
}

export async function getUserById(uid: string) {
  if (isClient) {
    throw new Error('Firebase Admin não pode ser usado no cliente');
  }
  
  // Esta linha nunca deve ser atingida no cliente
  throw new Error('Firebase Admin não inicializado. Este stub não deve ser usado.');
}

// Nota: Para uso em APIs e rotas do servidor, importe de '@/lib/firebase-admin-init' em vez deste arquivo 