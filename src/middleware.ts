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
  console.log(`Middleware executado para: ${pathname}`);
  
  // Verificar se a rota requer autenticação (não é uma rota pública)
  const isAuthRoute = pathname.startsWith('/auth/');
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || (route.endsWith('*') && pathname.startsWith(route.slice(0, -1)))
  );
  
  // Verificar se o usuário está autenticado pelo cookie de sessão
  const sessionCookie = request.cookies.get('session')?.value;
  const isAuthenticated = !!sessionCookie;
  
  console.log(`Rota: ${pathname}, Autenticado: ${isAuthenticated}, Rota pública: ${isPublicRoute}, Rota de auth: ${isAuthRoute}`);
  
  if (isAuthRoute && isAuthenticated) {
    console.log('Usuário já autenticado acessando rota de auth, redirecionando para dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (!isPublicRoute && !isAuthenticated) {
    console.log('Usuário não autenticado tentando acessar rota protegida, redirecionando para login');
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  const isProRoute = PRO_ONLY_ROUTES.some(route => 
    pathname === route || (route.endsWith('*') && pathname.startsWith(route.slice(0, -1)))
  );
  
  // Deixar a verificação do plano Pro ser feita diretamente pelo cliente
  // O middleware apenas garante que o usuário está autenticado
  if (isProRoute && isAuthenticated) {
    console.log('Rota requer plano Pro, usuário autenticado. Verificação será feita no cliente.');
    return NextResponse.next();
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