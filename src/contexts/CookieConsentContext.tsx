'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

type CookiePreferences = {
  necessary: boolean; // Sempre true, não é opcional
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
};

type CookieConsentContextType = {
  cookieConsent: boolean;
  cookiePreferences: CookiePreferences;
  showConsentModal: boolean;
  setShowConsentModal: (show: boolean) => void;
  acceptAllCookies: () => void;
  savePreferences: (preferences: CookiePreferences) => void;
  declineCookies: () => void;
};

const defaultCookiePreferences: CookiePreferences = {
  necessary: true, // Sempre ativo
  analytics: false,
  marketing: false,
  preferences: false,
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  // Iniciar com valores padrão para evitar erros de hidratação
  const [cookieConsent, setCookieConsent] = useState<boolean>(false);
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>(defaultCookiePreferences);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);

  // Definir isClient para true depois da montagem para evitar problemas de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Verificar se há preferências salvas no localStorage ao carregar (apenas no cliente)
  useEffect(() => {
    if (!isClient) return;

    // Determinar se deve mostrar o modal (apenas se não tiver consentimento salvo)
    const savedConsent = localStorage.getItem('cookieConsent');
    const savedPreferences = localStorage.getItem('cookiePreferences');

    if (savedConsent) {
      setCookieConsent(savedConsent === 'true');
      
      if (savedPreferences) {
        try {
          const parsedPreferences = JSON.parse(savedPreferences);
          setCookiePreferences({
            ...defaultCookiePreferences,
            ...parsedPreferences
          });
        } catch (error) {
          console.error('Erro ao analisar preferências de cookies', error);
        }
      }
    } else {
      // Se não houver consentimento salvo, exibir o modal
      setShowConsentModal(true);
    }
  }, [isClient]);

  // Aceitar todos os cookies
  const acceptAllCookies = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setCookiePreferences(allAccepted);
    setCookieConsent(true);
    setShowConsentModal(false);
    
    // Salvar no localStorage
    if (isClient) {
      localStorage.setItem('cookieConsent', 'true');
      localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    }
  };

  // Salvar preferências personalizadas
  const savePreferences = (preferences: CookiePreferences) => {
    // Garantir que cookies necessários estejam sempre ativados
    const updatedPreferences = {
      ...preferences,
      necessary: true,
    };
    
    setCookiePreferences(updatedPreferences);
    setCookieConsent(true);
    setShowConsentModal(false);
    
    // Salvar no localStorage
    if (isClient) {
      localStorage.setItem('cookieConsent', 'true');
      localStorage.setItem('cookiePreferences', JSON.stringify(updatedPreferences));
    }
  };

  // Recusar cookies opcionais
  const declineCookies = () => {
    setCookiePreferences(defaultCookiePreferences);
    setCookieConsent(true); // Ainda consideramos como consentimento, apenas com opções limitadas
    setShowConsentModal(false);
    
    // Salvar no localStorage
    if (isClient) {
      localStorage.setItem('cookieConsent', 'true');
      localStorage.setItem('cookiePreferences', JSON.stringify(defaultCookiePreferences));
    }
  };

  const value = {
    cookieConsent,
    cookiePreferences,
    showConsentModal,
    setShowConsentModal,
    acceptAllCookies,
    savePreferences,
    declineCookies,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent deve ser usado dentro de um CookieConsentProvider');
  }
  return context;
}; 