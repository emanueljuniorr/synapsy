'use client';

import { useState, useEffect, useRef } from 'react';
import { RiMindMap, RiMoonClearLine, RiVolumeMuteLine, RiVolumeUpLine, RiFullscreenLine, RiArrowLeftLine, RiHome4Line, RiCloseLine, RiSettings4Line } from 'react-icons/ri';
import Link from 'next/link';
import MainLayout from '../../components/layout/MainLayout';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// Sons relaxantes disponíveis
const SOUNDS = {
  rain: '/sounds/rain.mp3',
  forest: '/sounds/forest.mp3',
  ocean: '/sounds/ocean.mp3',
  fireplace: '/sounds/fireplace.mp3',
  night: '/sounds/night.mp3',
  meditation: '/sounds/meditation.mp3',
};

// Tipos de meditação guiada
const GUIDED_MEDITATIONS = [
  { id: 'breathing', name: 'Respiração 4-7-8', duration: 5 },
  { id: 'bodyscan', name: 'Body Scan', duration: 10 },
  { id: 'gratitude', name: 'Gratidão', duration: 7 },
  { id: 'mindfulness', name: 'Atenção Plena', duration: 8 },
  { id: 'visualize', name: 'Visualização', duration: 12 },
];

export default function RelaxPage() {
  const router = useRouter();
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está autenticado e tem plano Pro
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        // Redirecionar para login se não estiver autenticado
        router.push('/auth/login');
        return;
      }

      try {
        // Verificar plano do usuário
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userIsPro = userData.plan === 'pro';
          setIsPro(userIsPro);
          
          if (!userIsPro) {
            // Redirecionar se não for Pro
            router.push('/plans?upgrade=true');
          }
        } else {
          // Usuário não tem documento, redirecionar
          setIsPro(false);
          router.push('/plans?upgrade=true');
        }
      } catch (error) {
        console.error('Erro ao verificar plano do usuário:', error);
        // Em caso de erro, deixar continuar por segurança
        setIsPro(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Estados de áudio
  const [ambientSound, setAmbientSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Estados de visualização
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [activeScene, setActiveScene] = useState('space');
  
  // Estado para a meditação guiada
  const [meditationType, setMeditationType] = useState<string | null>(null);
  const [meditationTimer, setMeditationTimer] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale'); // inhale, hold, exhale
  const [breathingCount, setBreathingCount] = useState(0);
  
  // Referências para áudio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Referência para animação
  const animationFrameRef = useRef<number | null>(null);
  
  // Scenes disponíveis
  const scenes = [
    { id: 'space', name: 'Espaço', description: 'Estrelas e nebulosas cósmicas em movimento lento', color: 'from-indigo-600 to-purple-800' },
    { id: 'ocean', name: 'Oceano', description: 'Ondas relaxantes em tons de azul e turquesa', color: 'from-blue-400 to-cyan-800' },
    { id: 'aurora', name: 'Aurora Boreal', description: 'Luzes do norte em verde e roxo', color: 'from-green-500 to-purple-700' },
    { id: 'sunset', name: 'Pôr do Sol', description: 'Cores quentes e relaxantes do entardecer', color: 'from-orange-500 to-pink-600' },
  ];

  // Efeito para inicializar o áudio
  useEffect(() => {
    // Limpar animação na desmontagem
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Efeito para controlar a reprodução de áudio
  useEffect(() => {
    if (!ambientSound) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    if (typeof window !== 'undefined') {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(SOUNDS[ambientSound as keyof typeof SOUNDS]);
      
      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.volume = volume / 100;
        
        if (isPlaying) {
          audioRef.current.play().catch(e => console.error('Erro ao tocar áudio:', e));
        }
      }
    }
  }, [ambientSound, isPlaying]);

  // Efeito para ajustar o volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);
  
  // Estado para modal de configurações de som
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  
  // Estados para volumes individuais
  const [volumes, setVolumes] = useState({
    rain: 50,
    forest: 50,
    ocean: 50,
    fireplace: 50,
    night: 50,
    meditation: 50,
  });
  
  // Estado para mostrar modal de tempo de meditação
  const [showMeditationTimerModal, setShowMeditationTimerModal] = useState(false);
  
  // Referências para os elementos de áudio individuais
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  
  // Função para alternar reprodução de um som específico
  const toggleSound = (sound: string) => {
    if (ambientSound === sound) {
      setAmbientSound(null);
      setIsPlaying(false);
    } else {
      setAmbientSound(sound);
      setIsPlaying(true);
    }
  };
  
  // Função para alternar entre fullscreen e visualização normal
  const toggleFullscreen = () => {
    setShowFullscreen(!showFullscreen);
  };
  
  // Função para iniciar uma meditação guiada
  const startGuidedMeditation = (meditationId: string) => {
    setMeditationType(meditationId);
    
    if (meditationId === 'breathing') {
      setIsBreathingActive(true);
      setBreathingPhase('inhale');
      setBreathingCount(0);
    }
    
    // Abrir modal para seleção de tempo
    setShowMeditationTimerModal(true);
  };
  
  // Função para ajustar o volume de um som específico
  const handleVolumeChange = (sound: string, newValue: number) => {
    const newVolumes = { ...volumes, [sound]: newValue };
    setVolumes(newVolumes);
  };

  const saveVolumes = () => {
    localStorage.setItem('relaxSoundVolumes', JSON.stringify(volumes));
  };

  // Se estiver carregando ou não for Pro, não renderizar o conteúdo
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-primary">Carregando...</div>
        </div>
      </MainLayout>
    );
  }

  if (isPro === false) {
    return null; // Não renderizar nada, pois o usuário já está sendo redirecionado
  }

  return (
    <MainLayout>
      {/* Cabeçalho */}
      <div className="flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-3">
                <Link href="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2">
                  <RiHome4Line className="w-5 h-5 text-foreground/60" />
                  <span className="text-foreground/60 hidden sm:block">Dashboard</span>
                </Link>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Modo Relax
                </h1>
                <p className="text-foreground/60 mt-1">
                  Ambiente imersivo para relaxamento e meditação
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Botão para abrir o modal de configurações de som */}
              <button
                onClick={() => setShowSoundSettings(true)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-foreground/60 hover:text-primary"
              >
                <RiSettings4Line className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para seleção de tempo de meditação */}
      {showMeditationTimerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div 
            className="bg-background border border-white/10 rounded-2xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-gradient-to-r from-primary/10 to-accent/10">
              <h3 className="text-xl font-bold text-white">Tempo de Meditação</h3>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 15, 20, 30, 45, 60].map((min) => (
                  <button
                    key={min}
                    onClick={() => {
                      setMeditationTimer(min * 60);
                      setShowMeditationTimerModal(false);
                    }}
                    className="flex items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                  >
                    {min} min
                  </button>
                ))}
              </div>
            
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowMeditationTimerModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de configurações de som */}
      {showSoundSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div 
            className="bg-background border border-white/10 rounded-2xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-gradient-to-r from-primary/10 to-accent/10">
              <h3 className="text-xl font-bold text-white">Configurações de Som</h3>
            </div>
            
            <div className="p-5 space-y-4">
              {Object.keys(volumes).map((sound, index) => (
                <div key={index} className="flex items-center justify-between space-y-2">
                  <span className="text-white capitalize">{sound}</span>
                  <div className="flex items-center gap-2">
                    <RiVolumeMuteLine className="text-white/60" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volumes[sound as keyof typeof volumes]}
                      onChange={(e) => handleVolumeChange(sound, parseInt(e.target.value))}
                      className="accent-primary"
                    />
                    <RiVolumeUpLine className="text-white/60" />
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    saveVolumes();
                    setShowSoundSettings(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setShowSoundSettings(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interface principal */}
      <div className={`relative ${showFullscreen ? 'fixed inset-0 z-40 bg-black' : 'rounded-2xl overflow-hidden bg-black/20 border border-white/5'}`}>
        {/* Canvas para visualização */}
        <canvas 
          ref={canvasRef} 
          className="w-full h-full absolute inset-0"
        />
        
        {/* Conteúdo sobreposto */}
        <div className="relative z-10 p-6 h-full flex flex-col">
          {/* Botão de voltar quando em fullscreen */}
          {showFullscreen && (
            <button 
              onClick={toggleFullscreen}
              className="absolute top-4 left-4 text-white/70 hover:text-white bg-black/30 p-2 rounded-full backdrop-blur-sm"
            >
              <RiArrowLeftLine className="w-5 h-5" />
            </button>
          )}
          
          {/* Controles principais */}
          <div className={`mt-auto ${showFullscreen ? 'mb-16' : ''}`}>
            <div className="flex flex-wrap gap-3 mb-6">
              {/* Botões de som ambiente */}
              {Object.keys(SOUNDS).map((sound) => (
                <button
                  key={sound}
                  onClick={() => toggleSound(sound)}
                  className={`px-4 py-2 rounded-xl backdrop-blur-sm transition-all ${
                    ambientSound === sound 
                      ? 'bg-primary text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {sound.charAt(0).toUpperCase() + sound.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Controle de volume */}
            <div className="flex items-center space-x-4 mb-6">
              <RiVolumeMuteLine className="text-white/60" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <RiVolumeUpLine className="text-white/60" />
            </div>
            
            {/* Botões de controle adicionais */}
            <div className="flex justify-between">
              <div className="flex gap-3">
                {/* Botões de cenas */}
                <div className="flex flex-wrap gap-2">
                  {scenes.map((scene) => (
                    <button
                      key={scene.id}
                      onClick={() => setActiveScene(scene.id)}
                      className={`px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm transition-all ${
                        activeScene === scene.id 
                          ? `bg-gradient-to-r ${scene.color} text-white` 
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {scene.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 