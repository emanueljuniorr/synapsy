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
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Interface para usuário
interface User {
  id: string;
  uid?: string;
  name: string;
  email: string | null;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider do contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      try {
        if (firebaseUser) {
          console.log('Firebase User detectado:', firebaseUser.uid);
          
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
          
          console.log('Autenticação concluída. Objeto user:', { 
            id: authUser.id,
            name: authUser.name,
            email: authUser.email 
          });
          
          setUser(authUser);
          setIsAuthenticated(true);
        } else {
          console.log('Nenhum usuário autenticado');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    });

    // Limpar o listener quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Autenticar com o Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
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
      }
      
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
      
      // Criar provider do Google
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      
      // Autenticar com popup
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;
      
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
        });
      } else {
        // Atualizar informações do usuário
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          updatedAt: serverTimestamp(),
          avatar: firebaseUser.photoURL, // Atualizar avatar caso tenha mudado
        }, { merge: true });
      }
      
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