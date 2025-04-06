import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/contexts/AuthContext';

// Hook personalizado para acessar facilmente o contexto de autenticação
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
} 