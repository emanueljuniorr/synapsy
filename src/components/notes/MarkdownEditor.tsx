'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Importar o editor de forma dinâmica para evitar problemas de SSR
const MarkdownEditor = dynamic(
  () => import('@uiw/react-markdown-editor').then((mod) => mod.default),
  { ssr: false }
);

interface MarkdownEditorProps {
  initialValue?: string;
  onChange: (markdown: string) => void;
  height?: string;
  placeholder?: string;
}

function SynapsyMarkdownEditor({
  initialValue = '',
  onChange,
  height = '400px',
  placeholder = 'Digite seu conteúdo em Markdown...'
}: MarkdownEditorProps) {
  const [value, setValue] = useState(initialValue);

  // Sincronizar com a prop initialValue se ela mudar
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Gerenciar mudanças no editor
  const handleChange = (editor: any, data: any, value: string) => {
    setValue(value);
    onChange(value);
  };

  const dark = true; // Para adaptar a temas claros/escuros futuramente

  return (
    <div className="markdown-editor-container">
      {/* O Wrapper div abaixo garante que o editor está dentro de um componente cliente */}
      <div>
        {typeof window !== 'undefined' && (
          <MarkdownEditor
            value={value}
            onChange={handleChange}
            height={height}
            placeholder={placeholder}
            visible={true}
            theme={dark ? 'dark' : 'light'}
            enableScroll={true}
          />
        )}
      </div>
      <style jsx global>{`
        .w-md-editor {
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid rgba(128, 128, 128, 0.2);
        }
        .w-md-editor-toolbar {
          border-bottom: 1px solid rgba(128, 128, 128, 0.2);
        }
        .w-md-editor-text {
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}

export default SynapsyMarkdownEditor; 