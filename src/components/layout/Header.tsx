'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

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
          ) : (
            <>
              {!isLoading && isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-foreground/80 font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className="md:hidden flex items-center">
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
              ) : (
                <>
                  {!isLoading && isAuthenticated && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 text-foreground/80 font-medium hover:text-primary transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                </>
              )}
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