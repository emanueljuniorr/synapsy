'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from "./UserMenu";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isHomePage = pathname === '/';
  const isDashboardRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/tasks') || 
                          pathname.startsWith('/notes') || 
                          pathname.startsWith('/calendar') || 
                          pathname.startsWith('/study');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Synapsy
              </span>
            </Link>
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
              <Link href="/#plans" className="text-sm hover:text-primary transition-colors">
                Planos
              </Link>
              <Link href="/#contact" className="text-sm hover:text-primary transition-colors">
                Contato
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