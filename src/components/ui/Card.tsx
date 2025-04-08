'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  glow?: boolean;
}

export default function Card({ children, className = '', onClick, hover = true, glow = false }: CardProps) {
  return (
    <div
      className={`
        bg-background/40 backdrop-blur-lg 
        border border-white/10 rounded-2xl p-6 
        shadow-lg relative overflow-hidden
        ${hover ? 'hover:border-primary/50' : ''}
        ${glow ? 'hover:shadow-primary/20 hover:shadow-lg' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        transition-all duration-300
        ${className}
      `}
      onClick={onClick}
    >
      {/* Elemento decorativo - gradiente sutil */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Elementos decorativos - pontos espaciais */}
      <div className="absolute top-0 right-0 w-20 h-20">
        <div className="space-dot absolute top-4 right-4 animate-twinkle" />
        <div className="space-dot absolute top-8 right-8 animate-twinkle delay-150" />
      </div>
      
      {/* Conteúdo do card */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 