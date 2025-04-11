'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  RiBold, RiItalic, RiStrikethrough, RiCodeLine, 
  RiH1, RiH2, RiH3, RiListUnordered, RiListOrdered,
  RiLink, RiImageLine, RiSeparator, RiMore2Fill
} from 'react-icons/ri';

interface MarkdownEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

interface ToolbarButton {
  icon: React.ElementType;
  label: string;
  action: () => void;
  shortcut?: string;
}

// Adicionar tipo para os parâmetros do componente "code"
type CodeProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export default function MarkdownEditor({ initialValue = '', onChange, placeholder }: MarkdownEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [isPreview, setIsPreview] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

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
    { icon: RiLink, label: 'Link', action: () => insertText('[', '](url)') },
    { icon: RiImageLine, label: 'Imagem', action: () => insertText('![', '](url)') },
    { icon: RiSeparator, label: 'Separador', action: () => insertText('\\n---\\n') },
  ];

  // Mostrar toolbar quando o editor receber foco
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        setShowToolbar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full h-full min-h-[300px] rounded-2xl overflow-hidden bg-background/40 backdrop-blur-lg border border-white/10">
      {/* Barra de ferramentas flutuante */}
      {showToolbar && !isPreview && (
        <div className="absolute z-20 bg-neutral-900/95 backdrop-blur-lg rounded-lg shadow-lg border border-white/10 p-1.5 flex items-center gap-1 transform -translate-y-full mb-2">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.action}
              className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ''}`}
            >
              <button.icon size={18} />
            </button>
          ))}
          
          <div className="h-5 w-px bg-white/20 mx-1" />
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <RiMore2Fill size={18} />
          </button>
        </div>
      )}

      {/* Área de edição/visualização */}
      <div className="relative h-full">
        {!isPreview ? (
          <textarea
            ref={editorRef}
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setShowToolbar(true)}
            placeholder={placeholder}
            className="w-full h-full p-6 bg-transparent resize-none focus:outline-none text-foreground placeholder-foreground/40 text-lg"
          />
        ) : (
          <div className="w-full h-full p-6 overflow-auto prose prose-invert prose-purple max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: CodeProps) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={atomDark as any}
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
    </div>
  );
} 