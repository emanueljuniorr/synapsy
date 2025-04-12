// Middleware para verificação de rotas que exigem plano Pro e redirecionamento de usuários autenticados
import { NextRequest, NextResponse } from 'next/server';

// Rotas que exigem plano Pro
export const PRO_ONLY_ROUTES = [
  '/focus',
  '/focus/',
  '/relax',
  '/relax/',
  '/notes',
  '/notes/'
];

// Rotas públicas que não requerem autenticação
export const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/plans',
  '/plans/',
  '/privacy',
  '/terms'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar se a rota requer autenticação (não é uma rota pública)
  const isAuthRoute = pathname.startsWith('/auth/');
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || (route.endsWith('*') && pathname.startsWith(route.slice(0, -1)))
  );
  
  // Verificar se o usuário está autenticado pelo cookie de sessão
  const sessionCookie = request.cookies.get('session')?.value;
  const isAuthenticated = !!sessionCookie;
  
  // Se for uma rota de autenticação e o usuário já está logado, redirecionar para o dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Se não for rota pública e usuário não está autenticado, redirecionar para login
  if (!isPublicRoute && !isAuthenticated) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  // Verificar se a rota requer plano Pro
  const isProRoute = PRO_ONLY_ROUTES.some(route => 
    pathname === route || (route.endsWith('*') && pathname.startsWith(route.slice(0, -1)))
  );
  
  // Se for rota Pro e usuário está autenticado, adicionar um header para verificação posterior
  if (isProRoute && isAuthenticated) {
    // Em vez de verificar o token agora, apenas marcar para verificação na API
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-check-pro-plan', 'true');
    
    // Passar o cookie de sessão para a API verificar
    if (sessionCookie) {
      requestHeaders.set('x-session-cookie', sessionCookie);
    }
    
    // Continuar e deixar a API de verificação de plano fazer sua verificação
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.+\\..+).*)',
    '/focus/:path*',
    '/relax/:path*',
    '/notes/:path*'
  ],
}; 