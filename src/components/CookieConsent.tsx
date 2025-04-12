'use client';

import React, { useState } from 'react';
import { RiCloseLine, RiShieldCheckLine, RiInformationLine } from 'react-icons/ri';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { Switch } from '@/components/ui/switch';

export default function CookieConsent() {
  const { 
    showConsentModal, 
    setShowConsentModal, 
    acceptAllCookies, 
    savePreferences, 
    declineCookies,
    cookiePreferences
  } = useCookieConsent();

  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Sempre true, não pode ser alterado
    analytics: cookiePreferences.analytics,
    marketing: cookiePreferences.marketing,
    preferences: cookiePreferences.preferences
  });

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  if (!showConsentModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-background border border-purple-500/20 rounded-2xl shadow-lg shadow-purple-500/10 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiShieldCheckLine className="text-primary w-6 h-6" />
            <h3 className="text-lg font-semibold text-white">Política de Cookies</h3>
          </div>
          {!showDetails && (
            <button 
              onClick={() => setShowConsentModal(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="p-5 space-y-4">
          {!showDetails ? (
            <>
              <p className="text-white/80 text-sm">
                Este site utiliza cookies para melhorar sua experiência de navegação. Alguns cookies são necessários para o funcionamento do site, enquanto outros nos ajudam a entender como você interage com nosso conteúdo.
              </p>
              
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={acceptAllCookies}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors shadow-sm shadow-primary/20"
                >
                  Aceitar Todos
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
                >
                  Personalizar
                </button>
                <button
                  onClick={declineCookies}
                  className="px-4 py-2 bg-transparent hover:bg-white/5 text-white/70 hover:text-white rounded-xl font-medium transition-colors"
                >
                  Apenas Essenciais
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RiShieldCheckLine className="text-primary w-5 h-5" />
                      <h4 className="font-medium text-white">Cookies Necessários</h4>
                    </div>
                    <Switch checked={preferences.necessary} disabled={true} />
                  </div>
                  <p className="text-white/60 text-sm pl-7">
                    Essenciais para o funcionamento do site. Não podem ser desativados.
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RiInformationLine className="text-white/70 w-5 h-5" />
                      <h4 className="font-medium text-white">Cookies Analíticos</h4>
                    </div>
                    <Switch 
                      checked={preferences.analytics} 
                      onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                    />
                  </div>
                  <p className="text-white/60 text-sm pl-7">
                    Nos ajudam a entender como os usuários interagem com o site.
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RiInformationLine className="text-white/70 w-5 h-5" />
                      <h4 className="font-medium text-white">Cookies de Marketing</h4>
                    </div>
                    <Switch 
                      checked={preferences.marketing} 
                      onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                    />
                  </div>
                  <p className="text-white/60 text-sm pl-7">
                    Utilizados para rastrear visitantes em sites e exibir anúncios relevantes.
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RiInformationLine className="text-white/70 w-5 h-5" />
                      <h4 className="font-medium text-white">Cookies de Preferências</h4>
                    </div>
                    <Switch 
                      checked={preferences.preferences} 
                      onCheckedChange={(checked) => handlePreferenceChange('preferences', checked)}
                    />
                  </div>
                  <p className="text-white/60 text-sm pl-7">
                    Permitem que o site lembre suas preferências para melhorar sua experiência.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors shadow-sm shadow-primary/20"
                >
                  Salvar Preferências
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10"
                >
                  Voltar
                </button>
              </div>
            </>
          )}
          
          <p className="text-xs text-white/50 mt-4">
            Ao clicar em "Aceitar Todos", você concorda com o armazenamento de cookies no seu dispositivo para melhorar a navegação no site, analisar o uso do site e assistir em nossos esforços de marketing.
          </p>
        </div>
      </div>
    </div>
  );
} 