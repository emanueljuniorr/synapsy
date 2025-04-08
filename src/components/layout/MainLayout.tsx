'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';
import Footer from "./Footer";

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
    <div className="min-h-screen flex flex-col bg-background/80 backdrop-blur-sm">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {isDashboardRoute && <Sidebar />}
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
} 