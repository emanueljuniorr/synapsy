// Constantes de configuração da aplicação

// Limites para o plano gratuito
export const FREE_PLAN_LIMITS = {
  notes: 5,     // Máximo de notas
  todos: 10,    // Máximo de tarefas
  subjects: 3,  // Máximo de matérias
  flashcards: 20 // Máximo de flashcards
};

// Rotas do sistema
export const APP_ROUTES = {
  public: {
    home: '/',
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    pricing: '/pricing'
  },
  private: {
    dashboard: '/dashboard',
    notes: '/notes',
    todos: '/todos',
    subjects: '/subjects',
    flashcards: '/flashcards',
    focus: '/focus',
    relax: '/relax',
    settings: '/settings',
    profile: '/profile'
  },
  pro: {
    focus: '/focus',
    relax: '/relax'
  }
};

// Mensagens para usuários do plano Free
export const FREE_PLAN_MESSAGES = {
  limitReached: 'Você atingiu o limite do plano gratuito.',
  upgradeMessage: 'Atualize para o plano Pro para ter acesso ilimitado!',
  proFeature: 'Esta funcionalidade está disponível apenas para usuários do plano Pro.',
  
  // Mensagens específicas para cada tipo de limite
  notesLimitReached: 'Você atingiu o limite de notas do plano Free.',
  todosLimitReached: 'Você atingiu o limite de tarefas do plano Free.',
  subjectsLimitReached: 'Você atingiu o limite de matérias do plano Free.',
  flashcardsLimitReached: 'Você atingiu o limite de flashcards do plano Free.',
  
  // Mensagens para os modais de upgrade
  upgradeTitle: 'Aproveite recursos ilimitados!',
  upgradeDescription: 'Com o plano Pro você tem acesso a recursos ilimitados e exclusivos.',
  focusProOnly: 'Modos especiais de foco estão disponíveis apenas no plano Pro.',
  relaxProOnly: 'Modos de relaxamento estão disponíveis apenas no plano Pro.'
}; 