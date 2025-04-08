import { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Configurações | Synapsy",
  description: "Configure suas preferências no Synapsy",
};

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Configurações</h1>

        <div className="space-y-8">
          {/* Aparência */}
          <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Aparência</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  Tema
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button className="p-4 bg-white/5 border border-primary rounded-lg flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-background border-2 border-primary"></div>
                    <span>Escuro (Sistema)</span>
                  </button>
                  <button className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3 hover:border-primary/50 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-neutral-200"></div>
                    <span>Claro</span>
                  </button>
                  <button className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3 hover:border-primary/50 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-background border-2 border-neutral-700"></div>
                    <span>Escuro</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  Cor de Destaque
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <ColorButton color="primary" isSelected />
                  <ColorButton color="purple" />
                  <ColorButton color="blue" />
                  <ColorButton color="green" />
                </div>
              </div>
            </div>
          </section>

          {/* Notificações */}
          <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Notificações</h2>
            <div className="space-y-4">
              <NotificationSetting
                title="Lembretes de Tarefas"
                description="Receba notificações sobre tarefas próximas do vencimento"
              />
              <NotificationSetting
                title="Atualizações do Sistema"
                description="Seja notificado sobre novos recursos e melhorias"
              />
              <NotificationSetting
                title="Lembretes de Estudo"
                description="Receba lembretes sobre seus horários de estudo"
              />
            </div>
          </section>

          {/* Privacidade */}
          <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Privacidade</h2>
            <div className="space-y-4">
              <PrivacySetting
                title="Perfil Público"
                description="Permitir que outros usuários vejam seu perfil"
              />
              <PrivacySetting
                title="Mostrar Status Online"
                description="Exibir seu status de atividade para outros usuários"
              />
              <PrivacySetting
                title="Compartilhar Estatísticas"
                description="Compartilhar suas estatísticas de uso anonimamente"
              />
            </div>
          </section>

          {/* Integração */}
          <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Integrações</h2>
            <div className="space-y-6">
              <IntegrationCard
                name="Google Calendar"
                description="Sincronize seus eventos com o Google Calendar"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                }
              />
              <IntegrationCard
                name="GitHub"
                description="Conecte-se com seus repositórios do GitHub"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                }
              />
            </div>
          </section>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-4 justify-end">
            <button className="px-6 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function ColorButton({ color, isSelected }: { color: string; isSelected?: boolean }) {
  const colors = {
    primary: "bg-primary",
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
  };

  return (
    <button
      className={`p-4 bg-white/5 border rounded-lg flex items-center gap-3 transition-colors ${
        isSelected ? "border-primary" : "border-white/10 hover:border-primary/50"
      }`}
    >
      <div className={`w-5 h-5 rounded-full ${colors[color as keyof typeof colors]}`}></div>
      <span className="capitalize">{color}</span>
    </button>
  );
}

function NotificationSetting({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-foreground/60">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked />
        <div className="w-11 h-6 bg-neutral/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
}

function PrivacySetting({ title, description, defaultChecked = false }: { title: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-foreground/60">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
        <div className="w-11 h-6 bg-neutral/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
}

function IntegrationCard({ name, description, icon, isConnected = false }: { name: string; description: string; icon: React.ReactNode; isConnected?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-foreground/60">{description}</p>
        </div>
      </div>
      <button
        className={`px-4 py-2 rounded-lg transition-colors ${
          isConnected
            ? "bg-primary/10 text-primary hover:bg-primary/20"
            : "border border-white/10 hover:bg-white/5"
        }`}
      >
        {isConnected ? "Conectado" : "Conectar"}
      </button>
    </div>
  );
} 