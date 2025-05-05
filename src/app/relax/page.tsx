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
  { id: 'breathing', name: 'Respiração 4-7-8', duration: 5, icon: '🌬️', description: 'Técnica de respiração para relaxamento e redução de ansiedade' },
  { id: 'bodyscan', name: 'Body Scan', duration: 10, icon: '👁️', description: 'Atenção consciente a cada parte do corpo para relaxamento profundo' },
  { id: 'gratitude', name: 'Gratidão', duration: 7, icon: '🙏', description: 'Prática de gratidão para bem-estar emocional' },
  { id: 'mindfulness', name: 'Atenção Plena', duration: 8, icon: '🧠', description: 'Foco no momento presente para maior consciência' },
  { id: 'visualize', name: 'Visualização', duration: 12, icon: '💭', description: 'Criação de imagens mentais para relaxamento e motivação' },
];

// Scenes disponíveis
const SCENES = [
  { id: 'space', name: 'Espaço', description: 'Estrelas e nebulosas cósmicas em movimento lento', color: 'from-indigo-600 to-purple-800', icon: '✨' },
  { id: 'ocean', name: 'Oceano', description: 'Ondas relaxantes em tons de azul e turquesa', color: 'from-blue-400 to-cyan-800', icon: '🌊' },
  { id: 'aurora', name: 'Aurora Boreal', description: 'Luzes do norte em verde e roxo', color: 'from-green-500 to-purple-700', icon: '🌌' },
  { id: 'sunset', name: 'Pôr do Sol', description: 'Cores quentes e relaxantes do entardecer', color: 'from-orange-500 to-pink-600', icon: '🌅' },
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
        // Obter o token de autenticação
        const idToken = await user.getIdToken();
        
        // Verificar o plano usando a API verify-plan
        const response = await fetch('/api/check-pro-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          }
        });
        
        const data = await response.json();
        
        if (response.ok && data.isPro) {
          setIsPro(true);
        } else {
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
  const [selectedMeditation, setSelectedMeditation] = useState<typeof GUIDED_MEDITATIONS[0] | null>(null);
  
  // Referências para os elementos de áudio individuais
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

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
  const startGuidedMeditation = (meditation: typeof GUIDED_MEDITATIONS[0]) => {
    setSelectedMeditation(meditation);
    setMeditationType(meditation.id);
    
    if (meditation.id === 'breathing') {
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

  // Encontrar o cenário ativo
  const activeSceneObj = SCENES.find(scene => scene.id === activeScene) || SCENES[0];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
      {/* Cabeçalho */}
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
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
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-foreground/60 hover:text-primary"
                aria-label="Modo tela cheia"
              >
                <RiFullscreenLine className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSoundSettings(true)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-foreground/60 hover:text-primary"
                aria-label="Configurações de som"
              >
                <RiSettings4Line className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Container principal */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Seção de visualização e sons */}
            <div className="md:col-span-8">
              {/* Painel de visualização */}
              <div 
                className={`relative h-[300px] sm:h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-gradient-to-br ${activeSceneObj.color}`}
              >
                {/* Canvas para visualização (será implementado com JavaScript) */}
                <canvas 
                  ref={canvasRef} 
                  className="absolute inset-0 w-full h-full"
                />
                
                {/* Overlay com controles */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 bg-black/20 backdrop-blur-sm">
                  <div className="flex justify-between">
                    <h3 className="text-xl font-medium text-white">
                      {activeSceneObj.icon} {activeSceneObj.name}
                    </h3>
                    <button 
                      onClick={toggleFullscreen}
                      className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
                    >
                      <RiFullscreenLine className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div>
                    <p className="text-white/70 text-sm mb-4">
                      {activeSceneObj.description}
                    </p>
                    
                    {/* Sons disponíveis */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.keys(SOUNDS).map((sound) => (
                        <button
                          key={sound}
                          onClick={() => toggleSound(sound)}
                          className={`px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all text-sm ${
                            ambientSound === sound 
                              ? 'bg-primary text-white' 
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {sound.charAt(0).toUpperCase() + sound.slice(1)}
                        </button>
                      ))}
                    </div>
                    
                    {/* Controle de volume */}
                    {ambientSound && (
                      <div className="flex items-center space-x-2 mt-4">
                        <RiVolumeMuteLine className="text-white/60" />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => setVolume(parseInt(e.target.value))}
                          className="w-full accent-primary"
                          style={{
                            background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${volume}%, rgba(255, 255, 255, 0.1) ${volume}%, rgba(255, 255, 255, 0.1) 100%)`,
                            height: '4px',
                            borderRadius: '4px',
                            outline: 'none',
                            WebkitAppearance: 'none'
                          }}
                        />
                        <RiVolumeUpLine className="text-white/60" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Seleção de cenários */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {SCENES.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => setActiveScene(scene.id)}
                    className={`p-4 rounded-xl transition-all flex flex-col items-center text-center gap-2 ${
                      activeScene === scene.id 
                        ? `bg-gradient-to-br ${scene.color} text-white` 
                        : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl">{scene.icon}</span>
                    <span className="font-medium">{scene.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Seção lateral com meditações guiadas */}
            <div className="md:col-span-4 space-y-6">
              {/* Card de meditações guiadas */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-medium mb-4 text-white">Meditação Guiada</h3>
                <div className="space-y-4">
                  {GUIDED_MEDITATIONS.map((meditation) => (
                    <button
                      key={meditation.id}
                      onClick={() => startGuidedMeditation(meditation)}
                      className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform">{meditation.icon}</span>
                        <div>
                          <div className="text-white font-medium">{meditation.name}</div>
                          <div className="text-white/60 text-sm">{meditation.duration} min</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Card de benefícios */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-medium mb-4 text-white">Benefícios</h3>
                <ul className="space-y-3 text-sm text-white/80">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <p>Redução dos níveis de cortisol, o hormônio do estresse.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <p>Diminuição da frequência cardíaca e pressão arterial.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <p>Aumento da produção de ondas alfa cerebrais, associadas ao relaxamento.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <p>Melhora na qualidade do sono e diminuição da insônia.</p>
                  </li>
                </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para seleção de tempo de meditação */}
        {showMeditationTimerModal && selectedMeditation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div 
            className="bg-background border border-white/10 rounded-2xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="p-5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-2xl flex items-center gap-3">
                <span className="text-2xl">{selectedMeditation.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedMeditation.name}</h3>
                  <p className="text-white/60 text-sm">{selectedMeditation.description}</p>
                </div>
            </div>

            <div className="p-5 space-y-4">
                <p className="text-white/80 text-sm mb-2">Selecione a duração:</p>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 15, 20, 30, 45, 60].map((min) => (
                  <button
                    key={min}
                    onClick={() => {
                      setMeditationTimer(min * 60);
                      setShowMeditationTimerModal(false);
                    }}
                      className="flex items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all hover:border-primary"
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
              <div className="p-5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Configurações de Som</h3>
            </div>
            
            <div className="p-5 space-y-4">
              {Object.keys(volumes).map((sound, index) => (
                  <div key={index} className="space-y-1">
                    <label className="text-white capitalize text-sm">{sound}</label>
                  <div className="flex items-center gap-2">
                    <RiVolumeMuteLine className="text-white/60" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volumes[sound as keyof typeof volumes]}
                      onChange={(e) => handleVolumeChange(sound, parseInt(e.target.value))}
                        className="w-full accent-primary"
                        style={{
                          background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${volumes[sound as keyof typeof volumes]}%, rgba(255, 255, 255, 0.1) ${volumes[sound as keyof typeof volumes]}%, rgba(255, 255, 255, 0.1) 100%)`,
                          height: '4px',
                          borderRadius: '4px',
                          outline: 'none',
                          WebkitAppearance: 'none'
                        }}
                    />
                    <RiVolumeUpLine className="text-white/60" />
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowSoundSettings(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                  >
                    Cancelar
                  </button>
                <button
                  onClick={() => {
                    saveVolumes();
                    setShowSoundSettings(false);
                  }}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all shadow-lg shadow-primary/20"
                >
                  Salvar
                </button>
                </div>
            </div>
          </div>
        </div>
      )}

        {/* Modo fullscreen */}
        {showFullscreen && (
          <div className="fixed inset-0 z-50 bg-black">
            <div className={`absolute inset-0 bg-gradient-to-br ${activeSceneObj.color}`}>
        {/* Canvas para visualização */}
        <canvas 
          ref={canvasRef} 
                className="absolute inset-0 w-full h-full"
              />
              
              {/* Controles em tela cheia */}
              <div className="absolute inset-0 flex flex-col p-6">
                <div className="flex justify-between">
            <button 
              onClick={toggleFullscreen}
                    className="bg-black/30 hover:bg-black/50 p-3 rounded-full text-white backdrop-blur-sm transition-colors"
            >
                    <RiCloseLine className="w-6 h-6" />
            </button>
                  
                  <h2 className="text-xl font-medium text-white backdrop-blur-sm bg-black/30 px-4 py-2 rounded-full">
                    {activeSceneObj.icon} {activeSceneObj.name}
                  </h2>
                </div>
                
                <div className="mt-auto">
                  {/* Sons disponíveis */}
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {Object.keys(SOUNDS).map((sound) => (
                <button
                  key={sound}
                  onClick={() => toggleSound(sound)}
                  className={`px-4 py-2 rounded-xl backdrop-blur-sm transition-all ${
                    ambientSound === sound 
                      ? 'bg-primary text-white' 
                            : 'bg-black/30 text-white hover:bg-black/50'
                  }`}
                >
                  {sound.charAt(0).toUpperCase() + sound.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Controle de volume */}
                  {ambientSound && (
                    <div className="flex items-center space-x-4 bg-black/30 backdrop-blur-sm rounded-xl p-3 max-w-md mx-auto">
                      <RiVolumeMuteLine className="text-white/80" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full accent-primary"
                        style={{
                          background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${volume}%, rgba(255, 255, 255, 0.1) ${volume}%, rgba(255, 255, 255, 0.1) 100%)`,
                          height: '4px',
                          borderRadius: '4px',
                          outline: 'none',
                          WebkitAppearance: 'none'
                        }}
                      />
                      <RiVolumeUpLine className="text-white/80" />
            </div>
                  )}
                  
                  {/* Seleção de cenários em fullscreen */}
                  <div className="mt-6 flex justify-center gap-2 flex-wrap">
                    {SCENES.map((scene) => (
                    <button
                      key={scene.id}
                      onClick={() => setActiveScene(scene.id)}
                        className={`p-2 rounded-xl transition-all flex items-center gap-2 ${
                        activeScene === scene.id 
                            ? 'bg-primary text-white' 
                            : 'bg-black/30 backdrop-blur-sm text-white hover:bg-black/50'
                      }`}
                    >
                        <span>{scene.icon}</span>
                        <span>{scene.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </MainLayout>
  );
} 