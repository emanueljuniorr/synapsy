'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  RiBold, RiItalic, RiStrikethrough, RiCodeLine, 
  RiH1, RiH2, RiH3, RiListUnordered, RiListOrdered,
  RiLinkM, RiImageLine, RiDivideLine, RiMore2Fill,
  RiCheckboxLine, RiDoubleQuotesL, RiTable2
} from 'react-icons/ri';

interface MarkdownEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: string;
}

interface ToolbarButton {
  icon: React.ElementType;
  label: string;
  action: () => void;
  shortcut?: string;
}

export default function SynapsyMarkdownEditor({ 
  initialValue = '', 
  onChange, 
  placeholder,
  height = '500px'
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [isPreview, setIsPreview] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleChange = (value: string) => {
    setContent(value);
    onChange?.(value);
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = before + selectedText + after;
    
    handleChange(
      textarea.value.substring(0, start) +
      newText +
      textarea.value.substring(end)
    );

    // Restaurar seleção após a atualização
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        end + before.length
      );
    }, 0);
  };

  const toolbarButtons: ToolbarButton[] = [
    { icon: RiH1, label: 'Título 1', action: () => insertText('# '), shortcut: '# ' },
    { icon: RiH2, label: 'Título 2', action: () => insertText('## '), shortcut: '## ' },
    { icon: RiH3, label: 'Título 3', action: () => insertText('### '), shortcut: '### ' },
    { icon: RiBold, label: 'Negrito', action: () => insertText('**', '**'), shortcut: 'Ctrl+B' },
    { icon: RiItalic, label: 'Itálico', action: () => insertText('_', '_'), shortcut: 'Ctrl+I' },
    { icon: RiStrikethrough, label: 'Tachado', action: () => insertText('~~', '~~') },
    { icon: RiCodeLine, label: 'Código', action: () => insertText('`', '`'), shortcut: 'Ctrl+E' },
    { icon: RiListUnordered, label: 'Lista', action: () => insertText('- ') },
    { icon: RiListOrdered, label: 'Lista Numerada', action: () => insertText('1. ') },
    { icon: RiCheckboxLine, label: 'Lista de Tarefas', action: () => insertText('- [ ] ') },
    { icon: RiDoubleQuotesL, label: 'Citação', action: () => insertText('> ') },
    { icon: RiLinkM, label: 'Link', action: () => insertText('[', '](url)') },
    { icon: RiImageLine, label: 'Imagem', action: () => insertText('![', '](url)') },
    { icon: RiTable2, label: 'Tabela', action: () => insertText('\n| Coluna 1 | Coluna 2 |\n|----------|----------|\n|          |          |\n') },
    { icon: RiDivideLine, label: 'Separador', action: () => insertText('\n---\n') },
  ];

  // Atualizar posição da toolbar flutuante
  const updateToolbarPosition = () => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    if (selectionStart === selectionEnd) {
      const text = textarea.value.substring(0, selectionStart);
      const lines = text.split('\n');
      const currentLine = lines.length;
      const lineHeight = 24; // altura aproximada da linha em pixels

      setCursorPosition({
        top: currentLine * lineHeight,
        left: 0
      });
    }
  };

  // Mostrar toolbar quando o editor receber foco ou texto for selecionado
  useEffect(() => {
    const handleSelection = () => {
      const textarea = editorRef.current;
      if (!textarea) return;

      if (textarea.selectionStart !== textarea.selectionEnd) {
        setShowToolbar(true);
        updateToolbarPosition();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node) &&
          toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowToolbar(false);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-background/40 backdrop-blur-lg border border-white/10">
      {/* Barra de ferramentas flutuante */}
      {showToolbar && !isPreview && (
        <div 
          ref={toolbarRef}
          style={{
            transform: `translate(${cursorPosition.left}px, ${cursorPosition.top}px)`,
          }}
          className="absolute z-20 bg-neutral-900/95 backdrop-blur-lg rounded-lg shadow-lg border border-white/10 p-1.5 flex flex-wrap items-center gap-1 max-w-md"
        >
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.action}
              className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors group relative"
              title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ''}`}
            >
              <button.icon size={18} />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs bg-neutral-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {button.label}
              </span>
            </button>
          ))}
          
          <div className="h-5 w-px bg-white/20 mx-1" />
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title={isPreview ? 'Modo edição' : 'Visualizar'}
          >
            <RiMore2Fill size={18} />
          </button>
        </div>
      )}

      {/* Área de edição/visualização */}
      <div className="relative h-full" style={{ height }}>
        {!isPreview ? (
          <textarea
            ref={editorRef}
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setShowToolbar(true)}
            onSelect={updateToolbarPosition}
            placeholder={placeholder}
            className="w-full h-full p-6 bg-transparent resize-none focus:outline-none text-foreground placeholder-foreground/40 text-lg leading-relaxed"
            style={{
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          />
        ) : (
          <div className="w-full h-full p-6 overflow-auto prose prose-invert prose-purple max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {/* Gradiente decorativo */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none bg-gradient-to-t from-background/20 to-transparent" />
      </div>

      <style jsx global>{`
        .prose {
          color: inherit;
        }
        .prose h1, .prose h2, .prose h3 {
          color: inherit;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .prose h1 {
          font-size: 2.25rem;
          font-weight: 700;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.5rem;
        }
        .prose h2 {
          font-size: 1.75rem;
          font-weight: 600;
        }
        .prose h3 {
          font-size: 1.5rem;
          font-weight: 600;
        }
        .prose p {
          margin: 1.25rem 0;
          line-height: 1.8;
        }
        .prose ul, .prose ol {
          margin: 1.25rem 0;
          padding-left: 1.5rem;
        }
        .prose li {
          margin: 0.5rem 0;
        }
        .prose blockquote {
          border-left: 3px solid var(--primary, #9d4edd);
          margin: 1.5rem 0;
          padding: 0.5rem 0 0.5rem 1rem;
          font-style: italic;
          color: rgba(255, 255, 255, 0.7);
        }
        .prose code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        .prose pre {
          background: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        .prose th, .prose td {
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.75rem;
        }
        .prose th {
          background: rgba(255, 255, 255, 0.05);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
} 