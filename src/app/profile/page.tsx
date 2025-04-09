"use client";

import MainLayout from "@/components/layout/MainLayout";
import { auth, db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import Image from "next/image";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, Timestamp, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Tipo para dados do perfil
interface UserProfile {
  name: string;
  email: string;
  photoURL: string | null;
  location?: string;
  occupation?: string;
  plan: {
    name: string;
    color: string;
  };
  stats: {
    completedTasks: number;
    createdNotes: number;
    studyTime: number; // em minutos
    streak: number;
  };
  createdAt: Timestamp | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string>("");
  const [location, setLocation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Observa mudanças no estado de autenticação
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        
        // Formatar data de criação
        if (user.metadata.creationTime) {
          const date = new Date(user.metadata.creationTime);
          const month = date.toLocaleString('pt-BR', { month: 'long' });
          const year = date.getFullYear();
          setCreatedAt(`${month} ${year}`);
        }
        
        // Buscar dados do perfil
        await fetchUserProfile(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Função para buscar dados do perfil
  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Buscando perfil para usuário:', userId);
      
      // Buscar dados do perfil no Firestore
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      
      // Inicializar dados básicos do perfil
      let profileData: UserProfile = {
        name: user?.displayName || 'Usuário',
        email: user?.email || '',
        photoURL: user?.photoURL,
        plan: { name: "Free", color: "neutral" },
        stats: {
          completedTasks: 0,
          createdNotes: 0,
          studyTime: 0,
          streak: 0
        },
        createdAt: null
      };
      
      // Se o documento do usuário existir, obter informações de lá
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        profileData = {
          ...profileData,
          location: userData.location,
          occupation: userData.occupation,
          plan: userData.plan || profileData.plan,
          createdAt: userData.createdAt || null
        };
      }
      
      // Buscar estatísticas das coleções
      // 1. Tarefas completadas
      const tasksQuery = query(
        collection(db, "tasks"),
        where("userId", "==", userId),
        where("completed", "==", true)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      profileData.stats.completedTasks = tasksSnapshot.size;
      
      // 2. Notas criadas
      const notesQuery = query(
        collection(db, "notes"),
        where("userId", "==", userId)
      );
      const notesSnapshot = await getDocs(notesQuery);
      profileData.stats.createdNotes = notesSnapshot.size;
      
      // 3. Tempo de estudo (soma de todas as sessões de foco)
      const focusQuery = query(
        collection(db, "focusSessions"),
        where("userId", "==", userId)
      );
      const focusSnapshot = await getDocs(focusQuery);
      profileData.stats.studyTime = focusSnapshot.docs.reduce(
        (total, doc) => total + (doc.data().minutes || 0), 
        0
      );
      
      // 4. Streak (dias consecutivos de atividade)
      // Uma implementação simples baseada nas sessões de foco dos últimos 30 dias
      const recentFocusQuery = query(
        collection(db, "focusSessions"),
        where("userId", "==", userId),
        where("date", ">=", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        orderBy("date", "desc")
      );
      const recentFocusSnapshot = await getDocs(recentFocusQuery);
      
      // Agrupar sessões por dia (formato YYYY-MM-DD)
      const activeDays = new Set<string>();
      recentFocusSnapshot.forEach(doc => {
        const date = doc.data().date.toDate();
        const dayStr = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
        activeDays.add(dayStr);
      });
      
      // Calcular streak baseado nos dias consecutivos
      let streak = 0;
      const today = new Date();
      let currentDay = new Date(today);
      
      // Verificar dias consecutivos retroativos
      while (true) {
        const dayStr = `${currentDay.getFullYear()}-${currentDay.getMonth()+1}-${currentDay.getDate()}`;
        if (activeDays.has(dayStr)) {
          streak++;
          // Subtrair um dia
          currentDay.setDate(currentDay.getDate() - 1);
        } else {
          break;
        }
      }
      
      profileData.stats.streak = streak;
      
      // Atualizar estado com os dados coletados
      setUserProfile(profileData);
      console.log('Perfil carregado:', profileData);
      
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      setError('Não foi possível carregar os dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar alterações no perfil
  const saveProfileChanges = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      
      // Obter referência para o documento do usuário
      const userDocRef = doc(db, "users", user.uid);
      
      // Verificar se o documento existe
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        // Atualizar documento existente
        await updateDoc(userDocRef, {
          location,
          occupation,
          updatedAt: serverTimestamp()
        });
      } else {
        // Criar documento novo
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          location,
          occupation,
          plan: { name: "Free", color: "neutral" },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      console.log('Perfil atualizado com sucesso');
      setSaveSuccess(true);
      
      // Atualizar dados do perfil após salvar
      await fetchUserProfile(user.uid);
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      setError('Não foi possível salvar as alterações no perfil');
    } finally {
      setIsSaving(false);
      
      // Limpar mensagem de sucesso após 3 segundos
      if (saveSuccess) {
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    }
  };

  useEffect(() => {
    // ... existing effect ...
  }, []);
  
  // Atualizar os estados de localização e ocupação quando o perfil for carregado
  useEffect(() => {
    if (userProfile) {
      setLocation(userProfile.location || '');
      setOccupation(userProfile.occupation || '');
    }
  }, [userProfile]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium">Carregando seu perfil...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

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
                  <span className={`px-3 py-1 bg-${userProfile?.plan.color || 'neutral'}/10 text-${userProfile?.plan.color || 'neutral'} rounded-full text-sm`}>
                    Plano {userProfile?.plan.name || 'Free'}
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
          <StatCard 
            title="Tarefas" 
            value={userProfile?.stats.completedTasks.toString() || "0"} 
            subtitle="Completadas" 
          />
          <StatCard 
            title="Notas" 
            value={userProfile?.stats.createdNotes.toString() || "0"} 
            subtitle="Criadas" 
          />
          <StatCard 
            title="Tempo" 
            value={formatStudyTime(userProfile?.stats.studyTime || 0)} 
            subtitle="De estudo" 
          />
          <StatCard 
            title="Streak" 
            value={userProfile?.stats.streak.toString() || "0"} 
            subtitle="Dias seguidos" 
          />
        </div>

        {/* Seções do Perfil */}
        <div className="space-y-8">
          {/* Informações Pessoais */}
          <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Informações Pessoais</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {saveSuccess && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-lg text-sm">
                Alterações salvas com sucesso!
              </div>
            )}
            
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
                  disabled // Nome deve ser editado nas configurações de autenticação
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
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
            <button 
              className="px-6 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => {
                setLocation(userProfile?.location || '');
                setOccupation(userProfile?.occupation || '');
              }}
            >
              Cancelar
            </button>
            <button 
              className={`px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={saveProfileChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Salvando...
                </>
              ) : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Função para formatar o tempo de estudo
function formatStudyTime(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
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