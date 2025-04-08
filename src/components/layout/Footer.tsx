import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Synapsy
            </h3>
            <p className="text-sm text-foreground/70">
              Sua IDE para produtividade e estudos. Organize seus pensamentos, tarefas e conhecimento em um só lugar.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/notes" className="hover:text-primary transition-colors">
                  Anotações
                </Link>
              </li>
              <li>
                <Link href="/tasks" className="hover:text-primary transition-colors">
                  Tarefas
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-primary transition-colors">
                  Calendário
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>
                <Link href="/study" className="hover:text-primary transition-colors">
                  Ferramentas de Estudo
                </Link>
              </li>
              <li>
                <Link href="/workflow" className="hover:text-primary transition-colors">
                  Fluxos de Trabalho
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-primary transition-colors">
                  Planos e Preços
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>
                <Link href="/help" className="hover:text-primary transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} Synapsy. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
} 