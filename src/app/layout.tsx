import './globals.css'
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

// Configuração principal da fonte
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'sans-serif']
})

// Fonte secundária para títulos
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  fallback: ['system-ui', 'sans-serif']
})

export const metadata: Metadata = {
  title: 'Synapsy - Conecte Ideias e Atividades',
  description: 'Plataforma de produtividade para gerenciar tarefas, notas, calendário e estudos de forma integrada',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable} ${poppins.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#080813" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={cn(
        inter.className,
        "min-h-screen bg-background font-sans antialiased overflow-x-hidden"
      )}>
        <div className="stars-container fixed inset-0 z-0">
          <div id="stars"></div>
          <div id="stars2"></div>
          <div id="stars3"></div>
        </div>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
