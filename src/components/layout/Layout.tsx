'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

const NO_FOOTER_ROUTES = [
  '/dashboard',
  //'/calendar',
  '/notes',
  '/study',
  '/tasks',
  '/auth',
  //'/settings',
  '/profile'
];

// Rotas que não devem usar o layout padrão
const noLayoutRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/dashboard',
  '/notes',
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldShowFooter = !NO_FOOTER_ROUTES.some(route => pathname.startsWith(route));

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
} 