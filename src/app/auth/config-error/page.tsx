'use client';

import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export default function ConfigError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="max-w-md p-6 bg-background/90 backdrop-blur rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Erro de Configuração</h1>
        
        <div className="space-y-4 mb-6">
          <p className="text-muted-foreground">
            O Firebase não está configurado corretamente nesta aplicação.
          </p>
          
          <div className="bg-amber-900/20 p-4 rounded-md border border-amber-800/40">
            <h2 className="text-amber-500 font-semibold mb-2">Possíveis soluções:</h2>
            <ul className="text-left text-amber-200/80 space-y-2">
              <li>• Verifique se o arquivo <code className="bg-black/30 px-1 rounded">.env.local</code> existe na raiz do projeto</li>
              <li>• Certifique-se de que todas as variáveis <code className="bg-black/30 px-1 rounded">NEXT_PUBLIC_FIREBASE_*</code> estão definidas</li>
              <li>• Reinicie o servidor de desenvolvimento após alterações nas variáveis de ambiente</li>
            </ul>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>
              Para obter ajuda sobre como configurar o Firebase, consulte a 
              <a href="https://firebase.google.com/docs/web/setup" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-primary hover:underline ml-1">
                documentação oficial
              </a>.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Home
          </Link>
          
          <Link 
            href="/auth/config-instructions"
            className="inline-flex items-center px-4 py-2 rounded-md bg-amber-600/80 text-white hover:bg-amber-600 transition-colors"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Ver Instruções Detalhadas
          </Link>
        </div>
      </div>
    </div>
  );
} 