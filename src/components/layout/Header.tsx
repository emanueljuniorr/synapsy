'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
// Removendo a importação não utilizada
// import { useAuth } from '@/contexts/AuthContext';
import UserMenu from "./UserMenu";
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri';

interface HeaderProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isDashboardRoute?: boolean;
}

function Header({ isSidebarOpen, onToggleSidebar, isDashboardRoute }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14">
        <div className="flex items-center justify-between h-full">
          {/* Logo e Toggle Sidebar */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Synapsy
              </span>
            </Link>
            
            {isDashboardRoute && (
              <button 
                onClick={onToggleSidebar}
                className="p-1.5 rounded-full hover:bg-white/10 text-foreground/60 hover:text-primary transition-colors flex"
                aria-label={isSidebarOpen ? "Ocultar menu" : "Mostrar menu"}
              >
                {isSidebarOpen ? <RiMenuFoldLine size={18} /> : <RiMenuUnfoldLine size={18} />}
              </button>
            )}
          </div>

          {/* Navigation Links - Only show on homepage */}
          {isHomePage && (
            <nav className="hidden md:flex items-center justify-center flex-1 space-x-8">
              <Link href="/#about" className="text-sm hover:text-primary transition-colors">
                Sobre
              </Link>
              <Link href="/#features" className="text-sm hover:text-primary transition-colors">
                Recursos
              </Link>
              <Link href="/#pricing" className="text-sm hover:text-primary transition-colors">
                Planos
              </Link>
            </nav>
          )}

          {/* User Menu */}
          <div className="flex-shrink-0">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header; 