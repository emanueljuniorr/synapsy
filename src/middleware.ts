import { NextRequest, NextResponse } from 'next/server';

// Rotas que exigem plano Pro
export const PRO_ONLY_ROUTES = [
  '/focus',
  '/focus/',
  //'/relax',
  //'/relax/',
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

// Função para log condicional apenas em desenvolvimento
const debugLog = (message: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message);
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  debugLog(`Middleware executado para: ${pathname}`);
  
  // Verificar se a rota requer autenticação (não é uma rota pública)
  const isAuthRoute = pathname.startsWith('/auth/');
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || (route.endsWith('*') && pathname.startsWith(route.slice(0, -1)))
  );
  
  // Verificar se o usuário está autenticado pelo cookie de sessão
  const sessionCookie = request.cookies.get('session')?.value;
  const isAuthenticated = !!sessionCookie;
  
  debugLog(`Rota: ${pathname}, Autenticado: ${isAuthenticated}, Rota pública: ${isPublicRoute}, Rota de auth: ${isAuthRoute}`);
  
  // Se o usuário está autenticado e tenta acessar uma rota de auth, redirecionar para dashboard
  if (isAuthRoute && isAuthenticated) {
    debugLog('Usuário já autenticado acessando rota de auth, redirecionando para dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Verificar se a URL tem um parâmetro de callbackUrl
  const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
  debugLog(`Parâmetro callbackUrl: ${callbackUrl}`);
  
  // Se o usuário chegou em um callback após login bem-sucedido, redirecionar para a URL de callback
  if (pathname === '/dashboard' && callbackUrl && isAuthenticated) {
    debugLog(`Redirecionando para callbackUrl: ${callbackUrl}`);
    // Verificar se o callback é uma URL absoluta (externa) ou relativa
    const redirectUrl = callbackUrl.startsWith('http') 
      ? callbackUrl 
      : new URL(callbackUrl, request.url).toString();
    return NextResponse.redirect(redirectUrl);
  }
  
  // Se não estiver autenticado e tentar acessar uma rota protegida, redirecionar para login
  if (!isPublicRoute && !isAuthenticated) {
    debugLog('Usuário não autenticado tentando acessar rota protegida, redirecionando para login');
    const url = new URL('/auth/login', request.url);
    // Usar pathname completo como callback para evitar problemas com encode
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // Verificar rotas Pro
  const isProRoute = PRO_ONLY_ROUTES.some(route => 
    pathname === route || (route.endsWith('*') && pathname.startsWith(route.slice(0, -1)))
  );
  
  // Deixar a verificação do plano Pro ser feita diretamente pelo cliente
  // O middleware apenas garante que o usuário está autenticado
  if (isProRoute && isAuthenticated) {
    debugLog('Rota requer plano Pro, usuário autenticado. Verificação será feita no cliente.');
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.+\\..+).*)',
    '/focus/:path*',
    //'/relax/:path*',
    '/notes/:path*'
  ],
}; 