// API que utiliza Firebase Admin, só pode ser executada em Node.js Runtime
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { app, verifyToken } from '@/lib/firebase-admin-init';

// Duração do cookie de sessão (5 dias)
const SESSION_EXPIRATION_TIME = 60 * 60 * 24 * 5 * 1000; // 5 dias em milissegundos

/**
 * API para criar um cookie de sessão a partir do token ID do Firebase
 * Aceita requisições POST com token ID no body
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se o Firebase Admin está inicializado
    if (!app) {
      console.error('Firebase Admin não inicializado - verificar variáveis de ambiente');
      return new NextResponse(
        JSON.stringify({ 
          error: 'Serviço de autenticação não disponível',
          details: 'Firebase Admin SDK não está inicializado corretamente. Verifique se as variáveis de ambiente FIREBASE_ADMIN_* estão configuradas.'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar se o corpo da requisição contém dados
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new NextResponse(
        JSON.stringify({ error: 'Tipo de conteúdo inválido. Esperado: application/json' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Obter o texto do corpo da requisição
    const text = await request.text();
    if (!text || text.trim() === '') {
      return new NextResponse(
        JSON.stringify({ error: 'Corpo da requisição vazio' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Tentar parsear o JSON
    let body;
    try {
      body = JSON.parse(text);
    } catch (e) {
      console.error('Erro ao analisar JSON do corpo da requisição:', e);
      return new NextResponse(
        JSON.stringify({ 
          error: 'JSON inválido no corpo da requisição',
          details: (e as Error).message 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar se o token ID foi fornecido
    const idToken = body.idToken;
    
    if (!idToken) {
      return new NextResponse(
        JSON.stringify({ error: 'ID Token não fornecido' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Criar cookie de sessão com Firebase Admin
    try {
      // Primeiro, validar o token ID para garantir que é válido
      try {
        await verifyToken(idToken);
      } catch (tokenError: any) {
        console.error('Erro ao verificar o token ID:', tokenError);
        return new NextResponse(
          JSON.stringify({ 
            error: 'Token ID inválido',
            details: tokenError.message || 'Não foi possível verificar a autenticidade do token'
          }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Criar o cookie de sessão
      const sessionCookie = await app.auth().createSessionCookie(idToken, {
        expiresIn: SESSION_EXPIRATION_TIME,
      });
      
      // Configurar cookie na resposta - com await para resolver o cookies()
      const cookieStore = await cookies();
      
      // Configurações para cookie seguro em todos os ambientes
      await cookieStore.set({
        name: 'session',
        value: sessionCookie,
        httpOnly: true,
        secure: true,
        maxAge: SESSION_EXPIRATION_TIME / 1000, // Converter para segundos
        path: '/',
        sameSite: 'lax', // 'none' para permitir solicitações cross-site
      });
      
      // Obter o domínio da solicitação para uso no cabeçalho Set-Cookie
      //const domain = process.env.VERCEL_URL ? `.${process.env.VERCEL_URL}` : undefined;
      //const cookieString = `session=${sessionCookie}; HttpOnly; Secure; SameSite=None; Max-Age=${SESSION_EXPIRATION_TIME / 1000}; Path=/` + 
      //                        (domain ? `; Domain=${domain}` : '');
      
      return new NextResponse(
        JSON.stringify({ 
          success: true,
          message: 'Cookie de sessão criado com sucesso'
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json'
            //]'Set-Cookie': cookieString
          }
        }
      );
    } catch (authError: any) {
      console.error('Erro detalhado ao criar cookie de sessão:', authError);
      
      // Extrair informações úteis do erro para diagnóstico
      const errorInfo = {
        code: authError.code,
        message: authError.message,
        stack: process.env.NODE_ENV === 'development' ? authError.stack : undefined
      };
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Falha ao criar cookie de sessão',
          details: errorInfo
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    console.error('Erro geral na API de sessão:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Falha ao processar requisição',
        details: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
      return new NextResponse(
        JSON.stringify({ authenticated: false }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Verificar se o Firebase Admin está inicializado
    if (!app) {
      console.error('Firebase Admin não inicializado na verificação de sessão');
      return new NextResponse(
        JSON.stringify({ 
          authenticated: false,
          error: 'Serviço de autenticação não disponível'
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Verificar se o cookie de sessão é válido
    try {
      const decodedToken = await verifyToken(sessionCookie);
      
      return new NextResponse(
        JSON.stringify({
          authenticated: true,
          user: {
            uid: decodedToken.uid,
            email: decodedToken.email,
          },
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (tokenError) {
      // Token inválido ou expirado
      await cookieStore.delete('session');
      
      return new NextResponse(
        JSON.stringify({ authenticated: false }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    console.error('Erro ao verificar sessão:', error);
    return new NextResponse(
      JSON.stringify({ 
        authenticated: false,
        error: 'Erro ao verificar sessão: ' + error.message
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function DELETE() {
  try {
    // Configurar a exclusão do cookie com as mesmas configurações que foram usadas para criá-lo
    const cookieStore = await cookies();
    
    await cookieStore.set({
      name: 'session',
      value: '',
      httpOnly: true,
      secure: true,
      maxAge: 0, // Expirar imediatamente
      path: '/',
      sameSite: 'lax',
    });
    
    return new NextResponse(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Erro ao encerrar sessão:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Falha ao encerrar sessão',
        details: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}