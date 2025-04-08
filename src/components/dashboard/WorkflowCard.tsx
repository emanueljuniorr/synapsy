import { IconType } from 'react-icons';
import Link from 'next/link';

interface WorkflowCardProps {
  title: string;
  description: string;
  icon: IconType;
  href: string;
  gradient: string;
}

export default function WorkflowCard({ title, description, icon: Icon, href, gradient }: WorkflowCardProps) {
  return (
    <Link 
      href={href}
      className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${gradient}`}
    >
      <div className="relative z-10">
        <div className="mb-3 inline-flex rounded-xl bg-white/10 p-3 text-white backdrop-blur-md">
          <Icon size={24} />
        </div>
        
        <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-white/80">{description}</p>
      </div>

      {/* Efeitos de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent" />
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
    </Link>
  );
} 