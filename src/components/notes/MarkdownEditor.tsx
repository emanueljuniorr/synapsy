'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-markdown-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

// Importar o editor de forma dinâmica para evitar problemas de SSR
const MarkdownEditor = dynamic(
  () => import('@uiw/react-markdown-editor').then((mod) => mod.default),
  { ssr: false }
);

// Importar o preview para renderizar Markdown
const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
  { ssr: false }
);

interface MarkdownEditorProps {
  initialValue?: string;
  onChange: (markdown: string) => void;
  height?: string;
  placeholder?: string;
  showPreview?: boolean;
}

function SynapsyMarkdownEditor({
  initialValue = '',
  onChange,
  height = '400px',
  placeholder = 'Digite seu conteúdo em Markdown...',
  showPreview = true
}: MarkdownEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const editorRef = useRef<any>(null);

  // Sincronizar com a prop initialValue se ela mudar
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Gerenciar mudanças no editor
  const handleChange = (editor: any, data: any, value: string) => {
    setValue(value);
    onChange(value);
  };

  // Atalhos para inserir elementos comuns
  const insertHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    const newValue = value + `\n${prefix}Título ${level}\n`;
    setValue(newValue);
    onChange(newValue);
  };

  const insertList = (ordered: boolean = false) => {
    const prefix = ordered ? '1. ' : '- ';
    const newValue = value + `\n${prefix}Item da lista\n`;
    setValue(newValue);
    onChange(newValue);
  };

  const insertCodeBlock = () => {
    const newValue = value + '\n```javascript\n// Seu código aqui\n```\n';
    setValue(newValue);
    onChange(newValue);
  };

  const insertImage = () => {
    const newValue = value + '\n![Descrição da imagem](url_da_imagem)\n';
    setValue(newValue);
    onChange(newValue);
  };

  const insertTable = () => {
    const newValue = value + '\n| Coluna 1 | Coluna 2 | Coluna 3 |\n| --- | --- | --- |\n| Conteúdo 1 | Conteúdo 2 | Conteúdo 3 |\n';
    setValue(newValue);
    onChange(newValue);
  };

  const dark = true; // Para adaptar a temas claros/escuros futuramente

  return (
    <div className="markdown-editor-container">
      {/* Barra de ferramentas personalizada */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-neutral/10 rounded-t-lg border border-b-0 border-neutral/20">
        <button 
          onClick={() => insertHeading(1)} 
          className="p-1.5 rounded hover:bg-neutral/20 text-sm font-medium"
          title="Título 1"
        >
          H1
        </button>
        <button 
          onClick={() => insertHeading(2)} 
          className="p-1.5 rounded hover:bg-neutral/20 text-sm font-medium"
          title="Título 2"
        >
          H2
        </button>
        <button 
          onClick={() => insertHeading(3)} 
          className="p-1.5 rounded hover:bg-neutral/20 text-sm font-medium"
          title="Título 3"
        >
          H3
        </button>
        <div className="w-px h-5 bg-neutral/20 mx-1"></div>
        <button 
          onClick={() => insertList(false)} 
          className="p-1.5 rounded hover:bg-neutral/20 text-sm"
          title="Lista com marcadores"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
        <button 
          onClick={() => insertList(true)} 
          className="p-1.5 rounded hover:bg-neutral/20 text-sm"
          title="Lista numerada"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <path d="M4 6h1v4"></path>
            <path d="M4 10h2"></path>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
          </svg>
        </button>
        <button 
          onClick={() => insertCodeBlock()} 
          className="p-1.5 rounded hover:bg-neutral/20 text-sm"
          title="Bloco de código"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </button>
        <button 
          onClick={() => insertImage()} 
          className="p-1.5 rounded hover:bg-neutral/20 text-sm"
          title="Inserir imagem"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </button>
        <button 
          onClick={() => insertTable()} 
          className="p-1.5 rounded hover:bg-neutral/20 text-sm"
          title="Inserir tabela"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
          </svg>
        </button>
        <div className="flex-grow"></div>
        {showPreview && (
          <button 
            onClick={() => setIsPreviewMode(!isPreviewMode)} 
            className={`p-1.5 rounded hover:bg-neutral/20 text-sm font-medium ${isPreviewMode ? 'bg-neutral/20' : ''}`}
            title={isPreviewMode ? "Modo de edição" : "Modo de visualização"}
          >
            {isPreviewMode ? "Editar" : "Visualizar"}
          </button>
        )}
      </div>

      {/* O Wrapper div abaixo garante que o editor está dentro de um componente cliente */}
      <div className="rounded-b-lg border border-neutral/20 overflow-hidden">
        {typeof window !== 'undefined' && (
          <>
            {isPreviewMode ? (
              <div className="p-4 min-h-[300px]" style={{ height }}>
                <MarkdownPreview source={value} />
              </div>
            ) : (
              <MarkdownEditor
                ref={editorRef}
                value={value}
                onChange={handleChange}
                height={height}
                placeholder={placeholder}
                visible={true}
                theme={dark ? 'dark' : 'light'}
                enableScroll={true}
                hideToolbar={true} // Escondemos a toolbar padrão pois criamos nossa própria
              />
            )}
          </>
        )}
      </div>
      <style jsx global>{`
        .w-md-editor {
          border-radius: 0 0 0.5rem 0.5rem;
          overflow: hidden;
          border: none;
        }
        .w-md-editor-text {
          font-size: 1rem;
          line-height: 1.6;
          padding: 0.5rem;
        }
        .wmde-markdown {
          font-size: 1rem;
          line-height: 1.6;
        }
        .wmde-markdown h1 {
          font-size: 1.7rem;
          border-bottom: 1px solid rgba(128, 128, 128, 0.2);
          padding-bottom: 0.3rem;
          margin-bottom: 1rem;
        }
        .wmde-markdown h2 {
          font-size: 1.5rem;
          border-bottom: 1px solid rgba(128, 128, 128, 0.2);
          padding-bottom: 0.3rem;
          margin-bottom: 1rem;
        }
        .wmde-markdown h3 {
          font-size: 1.25rem;
        }
        .wmde-markdown pre {
          background-color: rgba(0, 0, 0, 0.05);
          border-radius: 0.25rem;
        }
        .wmde-markdown blockquote {
          border-left: 3px solid var(--primary, #9d4edd);
          padding-left: 1rem;
          color: rgba(128, 128, 128, 0.8);
        }
        .wmde-markdown img {
          max-width: 100%;
          border-radius: 0.25rem;
        }
        .wmde-markdown table {
          border-collapse: collapse;
          width: 100%;
        }
        .wmde-markdown table th,
        .wmde-markdown table td {
          border: 1px solid rgba(128, 128, 128, 0.2);
          padding: 0.5rem;
        }
        .wmde-markdown table th {
          background-color: rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
}

export default SynapsyMarkdownEditor; 