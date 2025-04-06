# Synapsy

Uma plataforma focada em produtividade, planejamento e um ambiente de estudos, concentração e foco. Uma "IDE" para produtividade e estudos.

## Visão Geral

O Synapsy é uma plataforma integrada que ajuda os usuários a organizar suas vidas e estudos de forma eficiente. Inspirada no conceito de "IDE para produtividade", a aplicação combina gerenciamento de tarefas, anotações interligadas, agendamento e ferramentas de estudo em uma única interface moderna e intuitiva.

### Principais Recursos

- **Gerenciamento de Tarefas**: Organize suas tarefas com prioridades, datas de vencimento e categorias.
- **Anotações Interligadas**: Crie anotações em Markdown com suporte a tags e conexões entre documentos.
- **Agendamento**: Visualize seu calendário, crie eventos recorrentes e integre com suas tarefas.
- **Ferramentas de Estudo**: Organize seus estudos por assuntos, crie flashcards e planos de estudo personalizados.

## Tecnologias

- **Next.js**: Framework React para renderização do lado do servidor e geração de sites estáticos.
- **TypeScript**: Superset tipado de JavaScript para um desenvolvimento mais seguro.
- **Tailwind CSS**: Framework CSS utilitário para estilização rápida e consistente.

## Como Iniciar

Para executar o projeto localmente, siga estas etapas:

```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para visualizar a aplicação no seu navegador.

## Estrutura do Projeto

```
src/
├── app/                 # Páginas da aplicação
├── components/          # Componentes reutilizáveis
│   ├── layout/          # Componentes de layout
│   ├── ui/              # Componentes de UI
│   ├── task/            # Componentes de tarefas
│   ├── notes/           # Componentes de anotações
│   ├── calendar/        # Componentes de calendário
│   └── study/           # Componentes de estudo
├── styles/              # Estilos globais
└── types/               # Definições de tipos TypeScript
```

## Status do Projeto

Este projeto está atualmente em desenvolvimento como um MVP (Produto Mínimo Viável). Novas funcionalidades e melhorias serão adicionadas continuamente.

## Licença

Este projeto é de código aberto e disponível sob a licença [MIT](LICENSE).
