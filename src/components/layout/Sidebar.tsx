'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      name: 'Tarefas',
      path: '/tasks',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4" /><path d="M12 18v4" /><path d="m4.93 4.93 2.83 2.83" /><path d="m16.24 16.24 2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="m4.93 19.07 2.83-2.83" /><path d="m16.24 7.76 2.83-2.83" />
        </svg>
      ),
    },
    {
      name: 'Anotações',
      path: '/notes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m22 2-20 20" />
        </svg>
      ),
    },
    {
      name: 'Calendário',
      path: '/calendar',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      ),
    },
    {
      name: 'Estudos',
      path: '/study',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="hidden md:block w-64 bg-white dark:bg-neutral border-r border-neutral/20 p-4 overflow-y-auto">
      <nav className="space-y-1">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              isActive(item.path) ? 'bg-primary text-white' : 'hover:bg-neutral/10'
            }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-8 pt-6 border-t border-neutral/20">
        <h3 className="text-xs uppercase text-foreground/50 font-semibold px-3 mb-2">Projetos recentes</h3>
        <div className="space-y-1">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-neutral/10">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm">Estudos para prova</span>
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-neutral/10">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm">Projeto de pesquisa</span>
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-neutral/10">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-sm">Trabalho de faculdade</span>
          </button>
        </div>
      </div>
    </aside>
  );
} 