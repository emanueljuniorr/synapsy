'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink href="/tasks">Tarefas</NavLink>
          <NavLink href="/notes">Anotações</NavLink>
          <NavLink href="/calendar">Calendário</NavLink>
          <NavLink href="/study">Estudos</NavLink>
        </nav>

        {/* User Menu */}
        <div className="hidden md:flex items-center gap-4">
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral/20 hover:bg-neutral/30 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12"></path>
            ) : (
              <path d="M4 12h16M4 6h16M4 18h16"></path>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-neutral/20">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <NavLink href="/tasks" onClick={() => setMobileMenuOpen(false)}>Tarefas</NavLink>
              <NavLink href="/notes" onClick={() => setMobileMenuOpen(false)}>Anotações</NavLink>
              <NavLink href="/calendar" onClick={() => setMobileMenuOpen(false)}>Calendário</NavLink>
              <NavLink href="/study" onClick={() => setMobileMenuOpen(false)}>Estudos</NavLink>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link 
      href={href} 
      className="text-foreground/80 hover:text-primary transition-colors font-medium"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export default Header; 