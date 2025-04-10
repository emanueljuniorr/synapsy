import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { FREE_PLAN_LIMITS } from './constants';

/**
 * Obtém as informações de assinatura do usuário
 */
export async function getUserSubscription(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { plan: 'free' };
    }
    
    const userData = userSnap.data();
    return {
      plan: userData.plan || 'free',
      isPro: userData.plan === 'pro',
    };
  } catch (error) {
    console.error('Erro ao buscar informações da assinatura:', error);
    return { plan: 'free' };
  }
}

export async function isUserPro(userId: string) {
  const { isPro } = await getUserSubscription(userId);
  return isPro === true;
}

/**
 * Verifica se o usuário atingiu o limite de notas do plano Free
 */
export async function hasReachedNotesLimit(userId: string): Promise<boolean> {
  try {
    const { isPro } = await getUserSubscription(userId);
    
    // Usuários Pro não têm limite
    if (isPro) return false;
    
    // Conta o número de notas do usuário
    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', userId)
    );
    
    const notesSnapshot = await getDocs(notesQuery);
    const notesCount = notesSnapshot.size;
    
    return notesCount >= FREE_PLAN_LIMITS.notes;
  } catch (error) {
    console.error('Erro ao verificar limite de notas:', error);
    return false;
  }
}

/**
 * Verifica se o usuário atingiu o limite de tarefas do plano Free
 */
export async function hasReachedTodosLimit(userId: string): Promise<boolean> {
  try {
    const { isPro } = await getUserSubscription(userId);
    
    // Usuários Pro não têm limite
    if (isPro) return false;
    
    // Conta o número de tarefas do usuário
    const todosQuery = query(
      collection(db, 'todos'),
      where('userId', '==', userId)
    );
    
    const todosSnapshot = await getDocs(todosQuery);
    const todosCount = todosSnapshot.size;
    
    return todosCount >= FREE_PLAN_LIMITS.todos;
  } catch (error) {
    console.error('Erro ao verificar limite de tarefas:', error);
    return false;
  }
}

/**
 * Verifica se o usuário atingiu o limite de matérias do plano Free
 */
export async function hasReachedSubjectsLimit(userId: string): Promise<boolean> {
  try {
    // Verifica primeiro a assinatura do usuário
    const { plan } = await getUserSubscription(userId);
    
    // Se for Pro, não tem limite
    if (plan === 'pro') {
      return false;
    }
    
    // Conta quantas matérias o usuário já tem
    const subjectsQuery = query(collection(db, 'subjects'), where('userId', '==', userId));
    const subjectsSnapshot = await getDocs(subjectsQuery);
    
    // Retorna true se atingiu o limite, false caso contrário
    return subjectsSnapshot.size >= FREE_PLAN_LIMITS.subjects;
  } catch (error) {
    console.error('Erro ao verificar limite de matérias:', error);
    // Em caso de erro, tratamos como se tivesse atingido o limite por segurança
    return true;
  }
}

/**
 * Verifica se o usuário atingiu o limite de flashcards do plano Free
 */
export async function hasReachedFlashcardsLimit(userId: string): Promise<boolean> {
  try {
    // Verifica primeiro a assinatura do usuário
    const { plan } = await getUserSubscription(userId);
    
    // Se for Pro, não tem limite
    if (plan === 'pro') {
      return false;
    }
    
    // Conta quantos flashcards o usuário já tem
    const flashcardsQuery = query(collection(db, 'flashcards'), where('userId', '==', userId));
    const flashcardsSnapshot = await getDocs(flashcardsQuery);
    
    // Retorna true se atingiu o limite, false caso contrário
    return flashcardsSnapshot.size >= FREE_PLAN_LIMITS.flashcards;
  } catch (error) {
    console.error('Erro ao verificar limite de flashcards:', error);
    // Em caso de erro, tratamos como se tivesse atingido o limite por segurança
    return true;
  }
}

/**
 * Verifica se o usuário pode utilizar recursos exclusivos do plano Pro
 */
export async function canUseProFeature(userId: string, featureName: 'focus' | 'relax'): Promise<boolean> {
  try {
    // Verifica a assinatura do usuário
    const { plan } = await getUserSubscription(userId);
    
    // Só pode usar se for Pro
    return plan === 'pro';
  } catch (error) {
    console.error(`Erro ao verificar acesso à feature Pro (${featureName}):`, error);
    // Em caso de erro, negar acesso por segurança
    return false;
  }
} 