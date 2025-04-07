'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // Gerar iniciais do nome do usuário
  const getInitials = (name: string) => {
    return name.split(' ')[0][0].toUpperCase();
  };

  // Tratar o logout
  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-neutral/20">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Synapsy
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link 
            href="/about" 
            className="px-4 py-2 text-foreground/80 font-medium hover:text-primary transition-colors"
          >
            Sobre
          </Link>
          <Link 
            href="/features" 
            className="px-4 py-2 text-foreground/80 font-medium hover:text-primary transition-colors"
          >
            Recursos
          </Link>
          <Link 
            href="/pricing" 
            className="px-4 py-2 text-foreground/80 font-medium hover:text-primary transition-colors"
          >
            Preços
          </Link>
          
          {!isLoading && !isAuthenticated ? (
            <>
              <Link 
                href="/auth/login" 
                className="px-4 py-2 text-foreground/80 font-medium hover:text-primary transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/auth/register" 
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                Registrar
              </Link>
            </>
          ) : null}
        </nav>

        {/* User Menu (Desktop) */}
        {!isLoading && isAuthenticated && user && (
          <div className="hidden md:block relative" ref={userMenuRef}>
            <div 
              className="user-avatar"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              {user.avatar ? (
                <Image 
                  src={user.avatar} 
                  alt={user.name} 
                  width={40} 
                  height={40} 
                  className="rounded-full" 
                />
              ) : (
                getInitials(user.name)
              )}
            </div>
            
            {userMenuOpen && (
              <div className="user-menu">
                <div className="px-4 py-3 border-b border-neutral">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-foreground/70 truncate">{user.email}</p>
                </div>
                <div>
                  <Link 
                    href="/dashboard" 
                    className="user-menu-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                    Dashboard
                  </Link>
                  <Link 
                    href="/settings" 
                    className="user-menu-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Configurações
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="user-menu-item w-full text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          {!isLoading && isAuthenticated && user ? (
            // Avatar no mobile
            <div className="relative mr-2" ref={userMenuRef}>
              <div 
                className="user-avatar"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {user.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt={user.name} 
                    width={36} 
                    height={36} 
                    className="rounded-full" 
                  />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              
              {userMenuOpen && (
                <div className="user-menu">
                  <div className="px-4 py-3 border-b border-neutral">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-foreground/70 truncate">{user.email}</p>
                  </div>
                  <div>
                    <Link 
                      href="/dashboard" 
                      className="user-menu-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                      Dashboard
                    </Link>
                    <Link 
                      href="/settings" 
                      className="user-menu-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                      Configurações
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="user-menu-item w-full text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <button
            type="button"
            className="text-foreground/80 hover:text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-neutral/20">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-foreground/80 font-medium hover:text-primary transition-colors"
              >
                Sobre
              </Link>
              <Link 
                href="/features" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-foreground/80 font-medium hover:text-primary transition-colors"
              >
                Recursos
              </Link>
              <Link 
                href="/pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-foreground/80 font-medium hover:text-primary transition-colors"
              >
                Preços
              </Link>
              
              {!isLoading && !isAuthenticated ? (
                <>
                  <Link 
                    href="/auth/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-foreground/80 font-medium hover:text-primary transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link 
                    href="/auth/register" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors inline-block w-fit"
                  >
                    Registrar
                  </Link>
                </>
              ) : null}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children, ...props }: { href: string; children: React.ReactNode; [x: string]: any }) {
  return (
    <Link 
      href={href} 
      className="text-foreground/80 font-medium hover:text-primary transition-colors"
      {...props}
    >
      {children}
    </Link>
  );
}

export default Header; 