// Middleware para verificação de rotas que exigem plano Pro e redirecionamento de usuários autenticados
import { NextRequest, NextResponse } from 'next/server';

// Lista de rotas que exigem plano Pro
const PRO_ONLY_ROUTES = [
  '/relax',
  '/focus',
  '/relax/',
  '/focus/'
];

// Lista de rotas públicas (não requerem autenticação)
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/',
  '/plans',
  '/pricing',
  '/terms',
  '/privacy',
  '/dashboard',
  '/profile',
];

export function middleware(request: NextRequest) {
  // Verificar se é uma rota que exige plano Pro
  const { pathname } = request.nextUrl;
  
  // Verificar se há cookie de sessão (usuário autenticado)
  const sessionCookie = request.cookies.get('session')?.value;
  const isAuthenticated = !!sessionCookie;
  
  // Redirecionar usuários autenticados tentando acessar páginas de autenticação
  if (isAuthenticated && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Se for uma rota pública, permitir acesso independente da autenticação
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }
  
  // Verificar se é uma rota que exige plano Pro
  if (PRO_ONLY_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    if (!isAuthenticated) {
      // Redirecionar para login se não estiver autenticado
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    // Permitir acesso à página que fará sua própria verificação 
    return NextResponse.next();
  }
  
  // Redirecionar para login se não estiver autenticado e tentar acessar rota protegida
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/notes/:path*',
    '/todos/:path*',
    '/subjects/:path*',
    '/flashcards/:path*',
    '/relax/:path*',
    '/focus/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/auth/login',
    '/auth/register'
  ]
}; 