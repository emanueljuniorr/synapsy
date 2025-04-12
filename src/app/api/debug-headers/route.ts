// API para depuração que mostra os headers da requisição
export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Extrair todos os headers para um objeto
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Extrair cookies para um objeto
  const cookies: Record<string, string> = {};
  request.cookies.getAll().forEach(cookie => {
    cookies[cookie.name] = cookie.value;
  });

  return NextResponse.json({
    url: request.url,
    method: request.method,
    headers,
    cookies,
    hasSessionCookie: !!request.cookies.get('session')?.value,
    xCheckProPlan: request.headers.get('x-check-pro-plan'),
    xSessionCookie: request.headers.get('x-session-cookie')?.substring(0, 20) + '...',
  }, {
    status: 200
  });
} 