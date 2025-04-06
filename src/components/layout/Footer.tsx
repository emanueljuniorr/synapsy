function Footer() {
  return (
    <footer className="border-t border-neutral/20 py-6 bg-background/60 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-foreground/60">
            &copy; {new Date().getFullYear()} Synapsy. Todos os direitos reservados. Criado com 💜 por Sophia.
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">
              Privacidade
            </a>
            <a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">
              Ajuda
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 