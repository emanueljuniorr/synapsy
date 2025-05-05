'use client';

import { ReactNode, useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';
import Footer from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Verificar se é uma rota que deve mostrar a sidebar
  const isDashboardRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/tasks') || 
                          pathname.startsWith('/notes') || 
                          pathname.startsWith('/focus') ||
                          pathname.startsWith('/relax') ||
                          pathname.startsWith('/study');
  
  // Verificar se deve ocultar o footer (mesmas rotas do dashboard)
  const shouldHideFooter = isDashboardRoute;
  
  // Detectar se é dispositivo móvel para o estado inicial da sidebar
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Em dispositivos móveis, a sidebar começa fechada
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Função para alternar a visibilidade da sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Classes dinâmicas para o conteúdo principal baseado no estado da sidebar
  const mainContentClasses = isDashboardRoute 
    ? isSidebarOpen && !isMobile 
      ? 'main-content-with-sidebar' 
      : 'main-content-centered'
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-background/90 backdrop-blur-sm overflow-x-hidden">
      <Header 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={toggleSidebar} 
        isDashboardRoute={isDashboardRoute}
      />
      
      <div className="flex-1 flex relative">
        {/* Overlay para fechar a sidebar em dispositivos móveis quando clicado */}
        {isDashboardRoute && isSidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar com transição suave */}
        {isDashboardRoute && (
          <div 
            className={`transform transition-transform duration-300 ease-in-out fixed md:static z-30 h-screen ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } ${isMobile ? 'w-[240px]' : 'w-64'}`}
          >
            <Sidebar onToggleSidebar={toggleSidebar} />
          </div>
        )}
        
        {/* Conteúdo principal - modificado para centralizar corretamente */}
        <main 
          className={`w-full flex-1 overflow-y-auto transition-all duration-300 ${
            isDashboardRoute && isSidebarOpen && !isMobile 
              ? 'main-content-with-sidebar pl-0' 
              : 'main-content-centered'
          }`}
          style={{
            marginLeft: (!isSidebarOpen || isMobile) ? 'auto' : '0',
            marginRight: (!isSidebarOpen || isMobile) ? 'auto' : '0'
          }}
        >
          <div className={`h-full py-4 sm:py-6 md:py-8 ${
            isDashboardRoute 
              ? isSidebarOpen && !isMobile 
                ? 'px-6' 
                : 'px-6 sm:px-8 lg:px-10 mx-auto'
              : 'container mx-auto px-4'
          }`}>
            {children}
          </div>
        </main>
      </div>
      
      {!shouldHideFooter && <Footer />}
    </div>
  );
}