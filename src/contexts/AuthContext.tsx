'use client';

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    // No MVP, vamos simular uma verificação de autenticação com localStorage
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const storedUser = localStorage.getItem('synapsy_user');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Funções de autenticação
  const login = async (email: string, password: string) => {
    // No MVP, vamos simular um login
    try {
      setIsLoading(true);
      
      // Simulação de tempo de resposta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar credenciais (para o MVP, vamos aceitar qualquer uma)
      const mockUser: User = {
        id: '1',
        name: email.split('@')[0],
        email,
        avatar: undefined
      };
      
      // Salvar no localStorage
      localStorage.setItem('synapsy_user', JSON.stringify(mockUser));
      
      // Atualizar estado
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw new Error('Falha ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    // No MVP, vamos simular um registro
    try {
      setIsLoading(true);
      
      // Simulação de tempo de resposta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar usuário mock
      const mockUser: User = {
        id: Date.now().toString(),
        name,
        email,
        avatar: undefined
      };
      
      // Salvar no localStorage
      localStorage.setItem('synapsy_user', JSON.stringify(mockUser));
      
      // Atualizar estado
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw new Error('Falha ao registrar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Remover do localStorage
      localStorage.removeItem('synapsy_user');
      
      // Atualizar estado
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw new Error('Falha ao fazer logout.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 