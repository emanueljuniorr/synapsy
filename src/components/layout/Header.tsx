'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from "./UserMenu";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isDashboardRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/tasks') || 
                          pathname.startsWith('/notes') || 
                          pathname.startsWith('/calendar') || 
                          pathname.startsWith('/study');

  // Fechar o menu quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Tratar o logout
  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">Synapsy</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Adicione aqui uma barra de pesquisa se desejar */}
          </div>
          <nav className="flex items-center space-x-2">
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header; 