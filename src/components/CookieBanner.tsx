'use client';

import React from 'react';
import { RiShieldCheckLine } from 'react-icons/ri';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

export default function CookieBanner() {
  const { cookieConsent, setShowConsentModal } = useCookieConsent();
  
  // Se o usuário já deu consentimento, mostrar um pequeno banner flutuante
  // que permite acessar novamente as configurações de cookies
  if (!cookieConsent) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-4 z-40">
      <button
        onClick={() => setShowConsentModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm border border-purple-500/20 rounded-full shadow-lg shadow-purple-500/10 text-white/80 hover:text-white transition-all group"
        aria-label="Configurações de cookies"
      >
        <RiShieldCheckLine className="text-primary group-hover:scale-110 transition-transform duration-300" />
        <span className="text-sm font-medium">Cookies</span>
      </button>
    </div>
  );
} 