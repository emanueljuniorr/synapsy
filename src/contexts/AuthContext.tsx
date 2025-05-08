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
  signInWithRedirect,
  setPersistence,
  browserLocalPersistence,
  Auth
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, Firestore } from 'firebase/firestore';
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
  isConfigured: boolean; // Novo campo para indicar se o Firebase está configurado
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
  const [isConfigured, setIsConfigured] = useState(!!auth); // Verificar se o Firebase está configurado
  
  // Verificar e alertar se o Firebase não estiver configurado
  useEffect(() => {
    if (!auth || !db) {
      console.error('Firebase não está configurado corretamente. Verifique as variáveis de ambiente.');
      setIsConfigured(false);
      setIsLoading(false);
    } else {
      setIsConfigured(true);
    }
  }, []);
  
  // Configurar persistência da autenticação ao montar
  useEffect(() => {
    const configurePersistence = async () => {
      // Verificar se o auth está disponível
      if (!auth) {
        console.error('Firebase Auth não está disponível. Não é possível configurar persistência.');
        return;
      }
      
      try {
        // Configurar persistência local para manter a sessão mesmo após fechar o navegador
        await setPersistence(auth as Auth, browserLocalPersistence);
        // Log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log('Persistência da autenticação configurada');
        }
      } catch (error) {
        console.error('Erro ao configurar persistência:', error);
      }
    };
    
    if (isConfigured) {
      configurePersistence();
    }
  }, [isConfigured]);

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    let isMounted = true;
    let unsubscribe = () => {};
    
    if (isConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth as Auth, async (firebaseUser) => {
        if (!isMounted) return;
        
        setIsLoading(true);
        
        try {
          if (firebaseUser && db) {
            // Verificar se o token está atualizado
            const idTokenResult = await firebaseUser.getIdTokenResult(true);
            
            // Buscar dados extras do usuário no Firestore
            const userDoc = await getDoc(doc(db as Firestore, 'users', firebaseUser.uid));
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
    } else {
      // Se o Firebase não estiver configurado, apenas definir como não autenticado
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
    }

    // Limpar o listener quando o componente for desmontado
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isConfigured]);

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    if (!isConfigured || !auth || !db) {
      console.error('Firebase não está configurado. Não é possível fazer login.');
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Configurar persistência local antes do login
      await setPersistence(auth as Auth, browserLocalPersistence);
      
      // Autenticar com o Firebase
      const userCredential = await signInWithEmailAndPassword(auth as Auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Obter o token ID do usuário com força de atualização
      const idToken = await firebaseUser.getIdToken(true);
      
      // Chamar a API para criar o cookie de sessão
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
        // Garantir que cookies sejam enviados
        credentials: 'include'
      });
      
      if (!sessionResponse.ok) {
        console.error('Erro ao criar cookie de sessão:', await sessionResponse.text());
        return false;
      }
      
      console.log('Cookie de sessão criado com sucesso');
      
      // Buscar dados adicionais do usuário
      const userDoc = await getDoc(doc(db as Firestore, 'users', firebaseUser.uid));
      
      // Se o documento do usuário não existir, criá-lo
      if (!userDoc.exists()) {
        await setDoc(doc(db as Firestore, 'users', firebaseUser.uid), {
          name: firebaseUser.displayName || email.split('@')[0],
          email: firebaseUser.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Atualizar timestamp de último login
        await setDoc(doc(db as Firestore, 'users', firebaseUser.uid), {
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
    if (!isConfigured || !auth || !db) {
      console.error('Firebase não está configurado. Não é possível fazer login com Google.');
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Configurar persistência local antes do login
      await setPersistence(auth as Auth, browserLocalPersistence);
      
      // Criar provider do Google
      const googleProvider = new GoogleAuthProvider();
      
      // Adicionar escopos básicos
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      
      // Configurar parâmetros personalizados
      googleProvider.setCustomParameters({ 
        prompt: 'select_account' 
      });
      
      let userCredential;
      try {
        // Tentar autenticar com popup primeiro
        userCredential = await signInWithPopup(auth as Auth, googleProvider);
      } catch (popupError: any) {
        console.error('Erro no popup do Google:', popupError);
        
        // Se o popup for bloqueado ou fechado pelo usuário, tentamos com redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          
          console.log('O popup do Google foi bloqueado. Tentando método alternativo...');
          
          if (typeof window !== 'undefined') {
            // Armazenar o URL atual para redirecionar de volta após login
            const currentUrl = window.location.href;
            sessionStorage.setItem('authRedirectUrl', currentUrl);
            
            // Usar redirecionamento em vez de popup
            await signInWithRedirect(auth as Auth, googleProvider);
            return false; // Esta linha não será executada devido ao redirecionamento
          }
          
          return false;
        }
        
        // Para outros erros, propagar para o catch principal
        throw popupError;
      }
      
      if (!userCredential) {
        console.error('Falha na autenticação - nenhuma credencial retornada');
        return false;
      }
      
      const firebaseUser = userCredential.user;
      if (!firebaseUser) {
        console.error('Objeto de usuário não encontrado nas credenciais');
        return false;
      }
      
      // Obter o token ID do usuário com força de atualização
      let idToken;
      try {
        console.log('Obtendo token ID para o usuário:', firebaseUser.uid);
        idToken = await firebaseUser.getIdToken(true);
        
        if (!idToken) {
          console.error('Token ID retornou vazio ou undefined');
          return false;
        }
        
        //console.log('Token ID obtido com sucesso (primeiros 10 caracteres):', idToken.substring(0, 10) + '...');
      } catch (tokenError) {
        console.error('Erro ao obter token ID:', tokenError);
        return false;
      }
      
      // Chamar a API para criar o cookie de sessão
      try {
        console.log('Enviando requisição para API de sessão');
        
        // Construir corpo explicitamente
        const requestBody = JSON.stringify({ idToken });
        console.log('Corpo da requisição (tamanho):', requestBody.length);
        
        // Fazer a requisição com retry
        let sessionResponse;
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          try {
            sessionResponse = await fetch('/api/auth/session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: requestBody,
              credentials: 'include'
            });
            
            if (sessionResponse.ok) {
              console.log('Cookie de sessão criado com sucesso para login com Google');
              break; // Sucesso, sair do loop
            } else {
              const errorText = await sessionResponse.text();
              console.error(`Tentativa ${retryCount + 1}/${maxRetries + 1} - Erro ao criar cookie de sessão:`, errorText);
              
              if (retryCount === maxRetries) {
                return false; // Desistir após todas as tentativas
              }
            }
          } catch (fetchError) {
            console.error(`Tentativa ${retryCount + 1}/${maxRetries + 1} - Erro de rede ao criar cookie de sessão:`, fetchError);
            
            if (retryCount === maxRetries) {
              return false; // Desistir após todas as tentativas
            }
          }
          
          retryCount++;
          // Pequeno delay antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (sessionError) {
        console.error('Erro na requisição de sessão:', sessionError);
        return false;
      }
      
      try {
        // Verificar se o usuário já existe no Firestore
        const userDoc = await getDoc(doc(db as Firestore, 'users', firebaseUser.uid));
        
        // Se o documento do usuário não existir, criá-lo
        if (!userDoc.exists()) {
          await setDoc(doc(db as Firestore, 'users', firebaseUser.uid), {
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            source: 'google',
          });
        } else {
          // Atualizar timestamp de último login
          await setDoc(doc(db as Firestore, 'users', firebaseUser.uid), {
            updatedAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            // Garantir que o avatar e nome estejam atualizados
            name: firebaseUser.displayName || userDoc.data()?.name,
            avatar: firebaseUser.photoURL || userDoc.data()?.avatar,
          }, { merge: true });
        }
        
        // Atualizar estado do usuário manualmente
        const authUser: User = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || userDoc.data()?.name || 'Usuário',
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL || userDoc.data()?.avatar,
        };
        
        setUser(authUser);
        setIsAuthenticated(true);
      } catch (firestoreError) {
        console.error('Erro ao processar dados do usuário:', firestoreError);
        // Mesmo com erro no Firestore, o usuário já está autenticado
      }
      
      return true;
    } catch (error: any) {
      console.error('Erro detalhado ao fazer login com Google:', error);
      
      // Mensagens mais amigáveis para erros específicos
      if (error.code === 'auth/account-exists-with-different-credential') {
        console.error('Este email já está associado a outra conta');
      } else if (error.code === 'auth/network-request-failed') {
        console.error('Falha na conexão de rede');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para registrar novo usuário
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    if (!isConfigured || !auth || !db) {
      console.error('Firebase não está configurado. Não é possível registrar usuário.');
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Atualizar o perfil com o nome
      await updateProfile(firebaseUser, { displayName: name });
      
      // Obter o token ID do usuário
      const idToken = await firebaseUser.getIdToken(true);
      
      // Chamar a API para criar o cookie de sessão
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
        credentials: 'include'
      });
      
      if (!sessionResponse.ok) {
        console.error('Erro ao criar cookie de sessão:', await sessionResponse.text());
        return false;
      }
      
      // Criar entrada no Firestore
      await setDoc(doc(db as Firestore, 'users', firebaseUser.uid), {
        name,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        source: 'email',
      });
      
      // Atualizar estado do usuário manualmente
      const authUser: User = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name,
        email: firebaseUser.email,
      };
      
      setUser(authUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = async (): Promise<void> => {
    if (!isConfigured || !auth) {
      console.error('Firebase não está configurado. Não é possível fazer logout.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Fazer logout no Firebase Auth
      await signOut(auth);
      
      // Limpar o cookie de sessão servidor
      const response = await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Erro ao limpar cookie de sessão:', await response.text());
      }
      
      // Limpar o estado local
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirecionamento para a página inicial será feito pelo componente
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    user,
    isLoading,
    isAuthenticated,
    isConfigured,
    login,
    loginWithGoogle,
    register,
    logout,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para acessar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
} 