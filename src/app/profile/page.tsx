"use client";

import MainLayout from "@/components/layout/MainLayout";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import Image from "next/image";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [createdAt, setCreatedAt] = useState<string>("");
  const [plan, setPlan] = useState({ name: "Free", color: "neutral" });

  useEffect(() => {
    // Observa mudanças no estado de autenticação
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        // Converte o timestamp de criação da conta para data formatada
        const date = new Date(Number(user.metadata.creationTime));
        const month = date.toLocaleString('pt-BR', { month: 'short' });
        const year = date.getFullYear();
        setCreatedAt(`${month} ${year}`);

        // Aqui você pode fazer uma chamada para sua API para obter o plano do usuário
        // Por enquanto vamos simular
        setPlan({ name: "Pro", color: "primary" });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="relative mb-12">
          {/* Background decorativo */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-3xl opacity-30" />
          
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent p-1">
                  {user?.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "Avatar"}
                      width={96}
                      height={96}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-2xl font-bold text-white">
                      {user?.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
              </div>

              {/* Informações do Perfil */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold mb-2">{user?.displayName || "Usuário"}</h1>
                <p className="text-foreground/60 mb-4">{user?.email}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <span className={`px-3 py-1 bg-${plan.color}/10 text-${plan.color} rounded-full text-sm`}>
                    Plano {plan.name}
                  </span>
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                    Desde {createdAt}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Tarefas" value="248" subtitle="Completadas" />
          <StatCard title="Notas" value="156" subtitle="Criadas" />
          <StatCard title="Tempo" value="384h" subtitle="De estudo" />
          <StatCard title="Streak" value="12" subtitle="Dias seguidos" />
        </div>

        {/* Seções do Perfil */}
        <div className="space-y-8">
          {/* Informações Pessoais */}
          <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Informações Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  defaultValue={user?.displayName || ""}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  defaultValue={user?.email || ""}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  Localização
                </label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Sua cidade"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  Ocupação
                </label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Sua ocupação"
                />
              </div>
            </div>
          </section>

          {/* Preferências */}
          <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Preferências</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notificações por Email</h3>
                  <p className="text-sm text-foreground/60">Receba atualizações sobre suas atividades</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-neutral/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
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

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h3 className="text-sm font-medium text-foreground/70">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-3xl font-semibold">{value}</p>
        <p className="ml-2 text-sm text-foreground/60">{subtitle}</p>
      </div>
    </div>
  );
} 