'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
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
  const [showToolbar, setShowToolbar] = useState(false);
  const editorRef = useRef<any>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Sincronizar com a prop initialValue se ela mudar
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Fechar a toolbar quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowToolbar(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gerenciar mudanças no editor
  const handleChange = (editor: any, data: any, value: string) => {
    setValue(value);
    onChange(value);
  };

  // Atalhos para inserir elementos comuns
  const insertContent = (type: string) => {
    let newContent = '';
    switch (type) {
      case 'h1':
        newContent = '\n# ';
        break;
      case 'h2':
        newContent = '\n## ';
        break;
      case 'h3':
        newContent = '\n### ';
        break;
      case 'bullet':
        newContent = '\n- ';
        break;
      case 'number':
        newContent = '\n1. ';
        break;
      case 'code':
        newContent = '\n```\n\n```\n';
        break;
      case 'image':
        newContent = '\n![]()\n';
        break;
      case 'table':
        newContent = '\n| Coluna 1 | Coluna 2 |\n|----------|----------|\n|          |          |\n';
        break;
      default:
        return;
    }
    const newValue = value + newContent;
    setValue(newValue);
    onChange(newValue);
    setShowToolbar(false);
  };

  const dark = true;

  return (
    <div className="markdown-editor-container relative">
      {/* Botão minimalista para mostrar a toolbar */}
      <button
        onClick={() => setShowToolbar(!showToolbar)}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-md hover:bg-neutral/10 transition-colors"
        title="Mostrar ferramentas"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
        </svg>
      </button>

      {/* Toolbar flutuante */}
      {showToolbar && (
        <div
          ref={toolbarRef}
          className="absolute top-10 right-2 z-20 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-neutral/20 p-2 flex flex-col gap-1 min-w-[180px]"
        >
          <button
            onClick={() => insertContent('h1')}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral/10 text-sm w-full text-left"
          >
            <span className="font-semibold">H1</span>
            <span className="text-xs text-neutral-500">Título grande</span>
          </button>
          <button
            onClick={() => insertContent('h2')}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral/10 text-sm w-full text-left"
          >
            <span className="font-semibold">H2</span>
            <span className="text-xs text-neutral-500">Título médio</span>
          </button>
          <button
            onClick={() => insertContent('h3')}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral/10 text-sm w-full text-left"
          >
            <span className="font-semibold">H3</span>
            <span className="text-xs text-neutral-500">Título pequeno</span>
          </button>
          <hr className="my-1 border-neutral/20" />
          <button
            onClick={() => insertContent('bullet')}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral/10 text-sm w-full text-left"
          >
            <span>•</span>
            <span className="text-sm">Lista com marcadores</span>
          </button>
          <button
            onClick={() => insertContent('number')}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral/10 text-sm w-full text-left"
          >
            <span>1.</span>
            <span className="text-sm">Lista numerada</span>
          </button>
          <hr className="my-1 border-neutral/20" />
          <button
            onClick={() => insertContent('code')}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral/10 text-sm w-full text-left"
          >
            <span className="font-mono">{`{ }`}</span>
            <span className="text-sm">Bloco de código</span>
          </button>
          <button
            onClick={() => insertContent('image')}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral/10 text-sm w-full text-left"
          >
            <span>🖼️</span>
            <span className="text-sm">Inserir imagem</span>
          </button>
          <button
            onClick={() => insertContent('table')}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral/10 text-sm w-full text-left"
          >
            <span>📊</span>
            <span className="text-sm">Inserir tabela</span>
          </button>
          <hr className="my-1 border-neutral/20" />
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral/10 text-sm w-full text-left"
          >
            <span>{isPreviewMode ? '✏️' : '👁️'}</span>
            <span className="text-sm">{isPreviewMode ? 'Modo edição' : 'Visualizar'}</span>
          </button>
        </div>
      )}

      {/* Editor/Preview */}
      <div className="rounded-lg border border-neutral/20 overflow-hidden bg-background/50">
        <Suspense fallback={<div className="p-6 min-h-[300px] animate-pulse bg-neutral/10" style={{ height }}></div>}>
          {isPreviewMode ? (
            <div className="p-6 min-h-[300px] prose prose-neutral dark:prose-invert max-w-none" style={{ height }}>
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
              hideToolbar={true}
            />
          )}
        </Suspense>
      </div>

      <style jsx global>{`
        .w-md-editor {
          background: transparent !important;
          border: none !important;
        }
        .w-md-editor-text {
          font-size: 1rem;
          line-height: 1.8;
          padding: 1.5rem !important;
        }
        .w-md-editor-text-pre > code,
        .w-md-editor-text-input {
          font-size: 1rem !important;
          line-height: 1.8 !important;
        }
        .wmde-markdown {
          font-size: 1rem;
          line-height: 1.8;
          background: transparent !important;
        }
        .wmde-markdown h1 {
          font-size: 2rem;
          font-weight: 700;
          border-bottom: 1px solid rgba(128, 128, 128, 0.2);
          padding-bottom: 0.5rem;
          margin: 2rem 0 1rem;
        }
        .wmde-markdown h2 {
          font-size: 1.5rem;
          font-weight: 600;
          border-bottom: 1px solid rgba(128, 128, 128, 0.2);
          padding-bottom: 0.4rem;
          margin: 1.5rem 0 1rem;
        }
        .wmde-markdown h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.2rem 0 0.8rem;
        }
        .wmde-markdown pre {
          background-color: rgba(0, 0, 0, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1rem 0;
        }
        .wmde-markdown blockquote {
          border-left: 3px solid var(--primary, #9d4edd);
          padding: 0.5rem 0 0.5rem 1rem;
          margin: 1rem 0;
          color: rgba(128, 128, 128, 0.8);
          font-style: italic;
        }
        .wmde-markdown img {
          max-width: 100%;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .wmde-markdown table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        .wmde-markdown table th,
        .wmde-markdown table td {
          border: 1px solid rgba(128, 128, 128, 0.2);
          padding: 0.75rem;
        }
        .wmde-markdown table th {
          background-color: rgba(0, 0, 0, 0.05);
          font-weight: 600;
        }
        .wmde-markdown ul,
        .wmde-markdown ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .wmde-markdown li {
          margin: 0.5rem 0;
        }
        .wmde-markdown p {
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
}

export default SynapsyMarkdownEditor; 