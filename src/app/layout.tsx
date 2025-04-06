import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synapsy - Sua IDE para produtividade e estudos",
  description: "Uma plataforma focada em produtividade, planejamento e um ambiente de estudos, concentração e foco.",
  keywords: ["produtividade", "estudos", "planejamento", "concentração", "foco", "tarefas", "anotações"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-background to-background via-neutral/10`}
      >
        <div className="stars-container fixed inset-0 z-[-1] opacity-30 pointer-events-none">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
