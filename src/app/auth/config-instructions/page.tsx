'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, ChevronRight } from 'lucide-react';

export default function ConfigInstructions() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="max-w-3xl w-full p-6 bg-background/90 backdrop-blur rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-primary mb-6">Configuração do Firebase</h1>
        
        <div className="space-y-6 mb-8">
          <p className="text-foreground/90">
            Para configurar corretamente o Firebase nesta aplicação Synapsy, siga os passos abaixo:
          </p>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Crie um arquivo .env.local</h2>
            <p className="text-muted-foreground">
              Na raiz do seu projeto, crie um arquivo chamado <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> para armazenar suas variáveis de ambiente.
            </p>
            
            <div className="bg-muted p-4 rounded-md text-sm font-mono overflow-x-auto">
              <pre>
{`# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY="sua-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="seu-projeto"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="seu-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="seu-app-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="seu-measurement-id"`}
              </pre>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Obtenha suas credenciais do Firebase</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Acesse o <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Console do Firebase</a></li>
              <li>Selecione seu projeto (ou crie um novo)</li>
              <li>Vá para as configurações do projeto (ícone de engrenagem)</li>
              <li>Na seção "Seus aplicativos", clique no ícone da web para criar um novo app web se necessário</li>
              <li>Copie os valores da configuração para o seu arquivo .env.local</li>
            </ol>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Configure o Firebase Admin SDK</h2>
            <p className="text-muted-foreground">
              Para funcionalidades do lado do servidor, você também precisa configurar o Firebase Admin SDK:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>No console do Firebase, vá para Configurações do Projeto > Contas de serviço</li>
              <li>Clique em "Gerar nova chave privada"</li>
              <li>Salve o arquivo JSON gerado na pasta <code className="bg-muted px-1 py-0.5 rounded">src/lib/</code> do seu projeto</li>
              <li>Certifique-se de que o nome do arquivo corresponde ao especificado em <code className="bg-muted px-1 py-0.5 rounded">firebase-admin-init.ts</code></li>
            </ol>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Reinicie o servidor de desenvolvimento</h2>
            <p className="text-muted-foreground">
              Após configurar as variáveis de ambiente, reinicie o servidor de desenvolvimento com:
            </p>
            <div className="bg-muted p-3 rounded-md text-sm font-mono">
              npm run dev
            </div>
          </div>
          
          <div className="p-4 bg-blue-900/20 border border-blue-800/30 rounded-md">
            <h3 className="text-blue-400 font-semibold mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Dica de Segurança
            </h3>
            <p className="text-blue-200/90 text-sm">
              Nunca comite seus arquivos de ambiente (.env.local) ou chaves privadas no controle de versão.
              Certifique-se de que esses arquivos estão listados no seu arquivo .gitignore.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-6">
          <Link
            href="/auth/config-error"
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Erro
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
          >
            Ir para Home
            <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
} 