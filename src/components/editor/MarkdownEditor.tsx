'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({ initialValue = '', onChange, placeholder }: MarkdownEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [isPreview, setIsPreview] = useState(false);

  const handleChange = (value: string) => {
    setContent(value);
    onChange?.(value);
  };

  return (
    <div className="w-full h-full min-h-[300px] rounded-2xl overflow-hidden bg-background/40 backdrop-blur-lg border border-white/10">
      {/* Barra de ferramentas */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 rounded-lg transition-all ${
              !isPreview ? 'bg-primary/20 text-primary' : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Editar
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 rounded-lg transition-all ${
              isPreview ? 'bg-primary/20 text-primary' : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Visualizar
          </button>
        </div>
        
        {/* Elementos decorativos */}
        <div className="flex items-center space-x-2">
          <div className="space-dot animate-pulse" />
          <div className="space-dot animate-pulse delay-75" />
          <div className="space-dot animate-pulse delay-150" />
        </div>
      </div>

      {/* Área de edição/visualização */}
      <div className="relative h-[calc(100%-44px)]">
        {!isPreview ? (
          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-4 bg-transparent resize-none focus:outline-none text-foreground placeholder-foreground/40"
          />
        ) : (
          <div className="w-full h-full p-4 overflow-auto prose prose-invert prose-purple max-w-none">
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
    </div>
  );
} 