'use client';

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Interface para usuário
export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string | null;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para o contexto de autenticação
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Criação do contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider do contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Configurar persistência da autenticação ao montar
  useEffect(() => {
    const configurePersistence = async () => {
      try {
        // Configurar persistência local para manter a sessão mesmo após fechar o navegador
        await setPersistence(auth, browserLocalPersistence);
        // Log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
        console.log('Persistência da autenticação configurada');
        }
      } catch (error) {
        console.error('Erro ao configurar persistência:', error);
      }
    };
    
    configurePersistence();
  }, []);

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      setIsLoading(true);
      
      try {
        if (firebaseUser) {
          // Verificar se o token está atualizado
          const idTokenResult = await firebaseUser.getIdTokenResult(true);
          
          // Buscar dados extras do usuário no Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();
          
          const authUser: User = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || userData?.name || 'Usuário',
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL || userData?.avatar,
            createdAt: userData?.createdAt ? new Date(userData.createdAt.toDate()) : undefined,
            updatedAt: userData?.updatedAt ? new Date(userData.updatedAt.toDate()) : undefined,
          };
          
          if (isMounted) {
            setUser(authUser);
            setIsAuthenticated(true);
          }
        } else {
          console.log('Nenhum usuário autenticado');
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });

    // Limpar o listener quando o componente for desmontado
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Configurar persistência local antes do login
      await setPersistence(auth, browserLocalPersistence);
      
      // Autenticar com o Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Obter o token ID do usuário
      const idToken = await firebaseUser.getIdToken();
      
      // Chamar a API para criar o cookie de sessão
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      if (!sessionResponse.ok) {
        console.error('Erro ao criar cookie de sessão:', await sessionResponse.text());
        return false;
      }
      
      console.log('Cookie de sessão criado com sucesso');
      
      // Buscar dados adicionais do usuário
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      // Se o documento do usuário não existir, criá-lo
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: firebaseUser.displayName || email.split('@')[0],
          email: firebaseUser.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Atualizar timestamp de último login
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          updatedAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
      
      // Atualizar estado do usuário manualmente
      const authUser: User = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || userDoc.data()?.name || email.split('@')[0],
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || userDoc.data()?.avatar,
      };
      
      setUser(authUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de login com Google
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Configurar persistência local antes do login
      await setPersistence(auth, browserLocalPersistence);
      
      // Criar provider do Google
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      
      // Autenticar com popup
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;
      
      // Obter o token ID do usuário
      const idToken = await firebaseUser.getIdToken();
      
      // Chamar a API para criar o cookie de sessão
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      if (!sessionResponse.ok) {
        console.error('Erro ao criar cookie de sessão:', await sessionResponse.text());
        return false;
      }
      
      console.log('Cookie de sessão criado com sucesso para login com Google');
      
      // Verificar se o usuário já existe no Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      // Se o documento do usuário não existir, criá-lo
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } else {
        // Atualizar informações do usuário
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          updatedAt: serverTimestamp(),
          avatar: firebaseUser.photoURL, // Atualizar avatar caso tenha mudado
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
      
      // Atualizar estado do usuário manualmente
      const authUser: User = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || undefined,
      };
      
      setUser(authUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de registro
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Configurar persistência local antes do login
      await setPersistence(auth, browserLocalPersistence);
      
      // Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Atualizar o perfil do usuário
      await updateProfile(firebaseUser, { displayName: name });
      
      // Criar o documento do usuário no Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name,
        email: firebaseUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // Limpar token e estado antes do logout
      setUser(null);
      setIsAuthenticated(false);
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw new Error('Falha ao fazer logout.');
    } finally {
      setIsLoading(false);
    }
  };

  // Retornar o provider com os valores do contexto
  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      loginWithGoogle,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para acessar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 