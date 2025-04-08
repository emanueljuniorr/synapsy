'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/tasks') || 
                          pathname.startsWith('/notes') || 
                          pathname.startsWith('/calendar') || 
                          pathname.startsWith('/study');

  return (
    <div className="min-h-screen bg-background/80 backdrop-blur-sm flex flex-col relative z-10">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {isDashboardRoute && <Sidebar />}
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 