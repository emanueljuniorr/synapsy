'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard-3-line' },
    { path: '/tasks', label: 'Tarefas', icon: 'task-line' },
    { path: '/notes', label: 'Notas', icon: 'file-list-3-line' },
    { path: '/calendar', label: 'Calendário', icon: 'calendar-line' },
    { path: '/study', label: 'Estudos', icon: 'book-3-line' },
    { path: '/study/stats', label: 'Estatísticas', icon: 'bar-chart-2-line' },
    { path: '/focus', label: 'Focus', icon: 'timer-line' },
    { path: '/relax', label: 'Relax', icon: 'mental-health-line' },
  ];

  const recentProjects = [
    { id: '1', name: 'Projeto de Graduação', color: 'bg-blue-500' },
    { id: '2', name: 'Aprendizado de IA', color: 'bg-green-500' },
    { id: '3', name: 'Desenvolvimento Web', color: 'bg-purple-500' },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 bg-background/40 backdrop-blur-lg border-r border-white/5">
      <nav className="h-full flex flex-col p-4">
        {/* Menu Principal */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-all group ${
                isActive(item.path)
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'hover:bg-white/5 text-foreground/60 hover:text-foreground'
              }`}
            >
              <i className={`ri-${item.icon} mr-3 text-lg ${
                isActive(item.path) ? 'text-primary' : 'text-foreground/60 group-hover:text-foreground'
              }`} />
              <span className="font-medium">{item.label}</span>
              {isActive(item.path) && (
                <div className="absolute right-0 w-1 h-6 bg-primary rounded-l-full transform translate-x-1/2" />
              )}
            </Link>
          ))}
        </div>

        {/* Projetos Recentes */}
        {/* <div className="mt-8">
          <h3 className="px-4 mb-3 text-sm font-medium text-foreground/40 uppercase tracking-wider">
            Projetos Recentes
          </h3>
          <div className="space-y-1">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center px-4 py-2 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <div className={`w-2 h-2 rounded-full ${project.color} mr-3`} />
                <span className="text-sm text-foreground/60 group-hover:text-foreground transition-colors">
                  {project.name}
                </span>
              </Link>
            ))}
          </div>
        </div>*/}

        {/* Elementos Decorativos */}
        <div className="mt-auto pt-8 px-4 opacity-70">
          <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center relative overflow-hidden border border-white/5">
            <div className="absolute w-20 h-20 bg-primary/20 rounded-full filter blur-xl animate-pulse top-5 -left-10"></div>
            <div className="absolute w-16 h-16 bg-accent/20 rounded-full filter blur-xl animate-pulse delay-1000 bottom-2 right-2"></div>
            <div className="text-center z-10">
              <div className="text-xs text-foreground/60 mb-1">Synapsy v1.0</div>
              <div className="text-xs text-foreground/40">Explore. Aprenda. Evolua.</div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
} 