'use client';

import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { RiMindMap, RiMoonClearLine, RiVolumeMuteLine, RiVolumeUpLine, RiFullscreenLine, RiArrowLeftLine, RiHome4Line, RiCloseLine, RiSettings4Line } from 'react-icons/ri';
import Link from 'next/link';

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

  // Efeito para gerenciar o timer de meditação
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (meditationType && meditationTimer > 0) {
      interval = setInterval(() => {
        setMeditationTimer(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            // Finalizar a meditação
            setMeditationType(null);
            setIsBreathingActive(false);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [meditationType, meditationTimer]);

  // Efeito para a animação de respiração 4-7-8
  useEffect(() => {
    let breathingInterval: NodeJS.Timeout | null = null;
    
    if (isBreathingActive) {
      breathingInterval = setInterval(() => {
        if (breathingPhase === 'inhale') {
          // Fase de inspiração (4 segundos)
          setBreathingCount(prev => {
            if (prev >= 4) {
              setBreathingPhase('hold');
              return 0;
            }
            return prev + 1;
          });
        } else if (breathingPhase === 'hold') {
          // Fase de retenção (7 segundos)
          setBreathingCount(prev => {
            if (prev >= 7) {
              setBreathingPhase('exhale');
              return 0;
            }
            return prev + 1;
          });
        } else {
          // Fase de expiração (8 segundos)
          setBreathingCount(prev => {
            if (prev >= 8) {
              setBreathingPhase('inhale');
              return 0;
            }
            return prev + 1;
          });
        }
      }, 1000);
    }
    
    return () => {
      if (breathingInterval) clearInterval(breathingInterval);
    };
  }, [isBreathingActive, breathingPhase, breathingCount]);

  // Efeito para inicializar e animar o canvas com base na cena ativa
  useEffect(() => {
    if (!canvasRef.current || !showFullscreen) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ajustar o tamanho do canvas para preencher a tela
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Chamar uma vez e adicionar o event listener
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Função para desenhar com base na cena selecionada
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (activeScene === 'space') {
        // Desenhar fundo espacial
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0f0f2a');
        gradient.addColorStop(1, '#1a1a3a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar estrelas
        const time = Date.now() * 0.0001;
        for (let i = 0; i < 200; i++) {
          const x = Math.sin(i * 0.3 + time) * canvas.width * 0.5 + canvas.width * 0.5;
          const y = Math.cos(i * 0.2 + time) * canvas.height * 0.5 + canvas.height * 0.5;
          const radius = Math.sin(i * 0.1 + time) * 1.5 + 1.5;
          
          // Cor da estrela (branco com um toque de azul ou roxo)
          const r = 220 + Math.sin(time) * 35;
          const g = 220 + Math.sin(time + 1) * 35;
          const b = 255;
          const a = 0.5 + Math.sin(time + i) * 0.25;
          
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
          ctx.fill();
        }
        
        // Nebulosa
        const nebulaGradient = ctx.createRadialGradient(
          canvas.width * 0.5, canvas.height * 0.5, 50,
          canvas.width * 0.5, canvas.height * 0.5, 500
        );
        nebulaGradient.addColorStop(0, 'rgba(157, 78, 221, 0.05)');
        nebulaGradient.addColorStop(0.5, 'rgba(100, 78, 221, 0.02)');
        nebulaGradient.addColorStop(1, 'rgba(0, 0, 50, 0)');
        
        ctx.fillStyle = nebulaGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } 
      else if (activeScene === 'ocean') {
        // Oceano
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0c2e63');
        gradient.addColorStop(1, '#0a639c');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Ondas
        const time = Date.now() * 0.001;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.lineWidth = 1 + i * 0.5;
          
          for (let x = 0; x < canvas.width; x += 5) {
            const y = Math.sin(x * 0.01 + time + i) * 20 + 
                   Math.sin(x * 0.02 + time * 0.8) * 10 + 
                   canvas.height * 0.5 + i * 40;
            
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          ctx.stroke();
        }
      }
      else if (activeScene === 'aurora') {
        // Céu noturno
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0c0c1d');
        gradient.addColorStop(1, '#1a1a36');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Aurora
        const time = Date.now() * 0.0005;
        
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.lineWidth = 2 + i * 3;
          
          // Cores da aurora (verde para roxo)
          if (i % 2 === 0) {
            ctx.strokeStyle = `rgba(120, 220, 150, ${0.2 - i * 0.02})`;
          } else {
            ctx.strokeStyle = `rgba(150, 100, 220, ${0.2 - i * 0.02})`;
          }
          
          for (let x = 0; x < canvas.width + 100; x += 10) {
            const frequencyX = 0.01;
            const frequencyTime = 0.5;
            const amplitude = 150;
            const y = Math.sin(x * frequencyX + time * frequencyTime + i) * amplitude + 
                   canvas.height * 0.3;
                   
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          ctx.stroke();
        }
      }
      else if (activeScene === 'sunset') {
        // Gradient de pôr do sol
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#ff9966');
        gradient.addColorStop(0.5, '#ff5e62');
        gradient.addColorStop(1, '#1e2c5a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Sol
        const time = Date.now() * 0.0005;
        const sunY = canvas.height * 0.7 + Math.sin(time) * 10;
        
        ctx.beginPath();
        ctx.arc(canvas.width * 0.5, sunY, 80, 0, Math.PI * 2);
        const sunGradient = ctx.createRadialGradient(
          canvas.width * 0.5, sunY, 0,
          canvas.width * 0.5, sunY, 80
        );
        sunGradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
        sunGradient.addColorStop(0.8, 'rgba(255, 150, 50, 0.8)');
        sunGradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
        ctx.fillStyle = sunGradient;
        ctx.fill();
        
        // Reflexo na água
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 5) {
          const distanceFromCenter = Math.abs(x - canvas.width * 0.5);
          const reflectionWidth = 400;
          
          if (distanceFromCenter < reflectionWidth) {
            const intensity = 1 - distanceFromCenter / reflectionWidth;
            
            const waveHeight = Math.sin(x * 0.05 + time * 2) * 2 * intensity;
            const y = sunY + 20 + waveHeight;
            
            if (x === Math.floor(canvas.width * 0.5) - reflectionWidth) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        }
        
        ctx.strokeStyle = 'rgba(255, 200, 100, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    
    // Iniciar a animação
    draw();
    
    // Limpar na desmontagem
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [activeScene, showFullscreen]);

  // Função para iniciar a reprodução de som
  const toggleSound = () => {
    if (!ambientSound) return;
    
    setIsPlaying(!isPlaying);
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error('Erro ao tocar áudio:', e));
      }
    }
  };

  // Função para iniciar uma meditação guiada
  const startMeditation = (meditationId: string) => {
    // Encontrar a meditação selecionada
    const meditation = GUIDED_MEDITATIONS.find(m => m.id === meditationId);
    if (!meditation) return;
    
    setMeditationType(meditationId);
    setMeditationTimer(meditation.duration * 60); // Converter para segundos
    
    // Se for respiração guiada, ativar a animação de respiração
    if (meditationId === 'breathing') {
      setIsBreathingActive(true);
      setBreathingPhase('inhale');
      setBreathingCount(0);
    }
    
    // Se estiver em tela cheia, sair para mostrar as instruções
    if (showFullscreen) {
      setShowFullscreen(false);
    }
  };

  // Formatação do tempo para mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Função para alternar o modo de tela cheia
  const toggleFullscreen = () => {
    setShowFullscreen(!showFullscreen);
  };

  // Modal para seleção de tempo de meditação
  const [showMeditationTimerModal, setShowMeditationTimerModal] = useState(false);

  // Modal para configurações de som
  const [showSoundSettings, setShowSoundSettings] = useState(false);

  // Adicione volumes e soundNames
  const [volumes, setVolumes] = useState({
    rain: 50,
    forest: 50,
    ocean: 50,
    fireplace: 50,
    night: 50,
    meditation: 50,
  });

  const soundNames = {
    rain: 'Chuva',
    forest: 'Floresta',
    ocean: 'Oceano',
    fireplace: 'Lareira',
    night: 'Noite',
    meditation: 'Meditação',
  };

  const handleVolumeChange = (sound: string, newValue: number) => {
    const newVolumes = { ...volumes, [sound]: newValue };
    setVolumes(newVolumes);
  };

  const saveVolumes = () => {
    localStorage.setItem('relaxSoundVolumes', JSON.stringify(volumes));
  };

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
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground/80">{soundNames[sound]}</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volumes[sound]}
                      onChange={(e) => handleVolumeChange(sound, parseInt(e.target.value))}
                      className="w-32 accent-primary"
                      style={{
                        background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${volumes[sound]}%, rgba(255, 255, 255, 0.1) ${volumes[sound]}%, rgba(255, 255, 255, 0.1) 100%)`,
                        height: '4px',
                        borderRadius: '4px',
                        outline: 'none',
                        WebkitAppearance: 'none'
                      }}
                    />
                    <span className="text-sm text-foreground/60 w-8">{volumes[sound]}%</span>
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
                  onClick={saveVolumes}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all shadow-lg shadow-primary/20"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFullscreen ? (
        // Visualização em tela cheia
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0"
          />
          
          {/* Botão para retornar ao Dashboard */}
          <div className="fixed top-8 left-8 z-10 opacity-50 hover:opacity-100 transition-opacity">
            <Link href="/dashboard" className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full py-2 px-4 text-white/80 hover:text-white transition-colors">
              <RiHome4Line className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
          </div>
          
          {/* Controles de tela cheia */}
          <div className="fixed bottom-8 left-0 right-0 flex justify-center z-10 opacity-50 hover:opacity-100 transition-opacity">
            <div className="bg-black/40 backdrop-blur-md rounded-full py-2 px-6 flex items-center gap-4">
              {/* Botão para sair da tela cheia */}
              <button 
                onClick={toggleFullscreen}
                className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10"
              >
                <RiFullscreenLine className="w-6 h-6" />
              </button>
              
              {/* Controles de som se um som estiver selecionado */}
              {ambientSound && (
                <>
                  <div className="h-8 w-px bg-white/20"></div>
                  
                  <button 
                    onClick={toggleSound}
                    className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10"
                  >
                    {isPlaying ? (
                      <RiVolumeUpLine className="w-6 h-6" />
                    ) : (
                      <RiVolumeMuteLine className="w-6 h-6" />
                    )}
                  </button>
                  
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume} 
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-24 accent-primary"
                    style={{
                      background: 'linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ' + volume + '%, rgba(255, 255, 255, 0.2) ' + volume + '%, rgba(255, 255, 255, 0.2) 100%)',
                      height: '3px',
                      borderRadius: '4px',
                      outline: 'none',
                      WebkitAppearance: 'none'
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Interface normal
        <div className="min-h-screen bg-background relative overflow-hidden">
          {/* Elementos decorativos espaciais */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary rounded-full animate-twinkle" />
            <div className="absolute top-40 right-1/3 w-1 h-1 bg-primary rounded-full animate-twinkle delay-100" />
            <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary rounded-full animate-twinkle delay-200" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Container principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Seção principal com visualizações relaxantes */}
              <div className="lg:col-span-8 space-y-8">
                {/* Visualizações */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Ambientes Relaxantes</h2>
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 text-foreground/60 hover:text-primary transition-colors rounded-lg hover:bg-white/5 flex items-center gap-2"
                    >
                      <RiFullscreenLine className="w-5 h-5" />
                      <span className="text-sm">Tela Cheia</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {scenes.map((scene) => (
                      <div 
                        key={scene.id}
                        onClick={() => setActiveScene(scene.id)}
                        className={`relative h-48 rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] ${
                          activeScene === scene.id ? 'ring-2 ring-primary' : 'ring-1 ring-white/10'
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${scene.color} opacity-70`}></div>
                        <div className="absolute inset-0 flex flex-col justify-end p-4">
                          <h3 className="text-lg font-medium text-white">{scene.name}</h3>
                          <p className="text-sm text-white/80">{scene.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Controles de som */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold mb-4">Sons Relaxantes</h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    <button 
                      onClick={() => setAmbientSound('rain')} 
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                        ambientSound === 'rain' ? 'bg-primary/20 border border-primary/50 text-white' : 'bg-white/5 border border-white/10 text-foreground/60 hover:bg-white/10'
                      }`}
                    >
                      Chuva
                    </button>
                    <button 
                      onClick={() => setAmbientSound('forest')} 
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                        ambientSound === 'forest' ? 'bg-primary/20 border border-primary/50 text-white' : 'bg-white/5 border border-white/10 text-foreground/60 hover:bg-white/10'
                      }`}
                    >
                      Floresta
                    </button>
                    <button 
                      onClick={() => setAmbientSound('ocean')} 
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                        ambientSound === 'ocean' ? 'bg-primary/20 border border-primary/50 text-white' : 'bg-white/5 border border-white/10 text-foreground/60 hover:bg-white/10'
                      }`}
                    >
                      Oceano
                    </button>
                    <button 
                      onClick={() => setAmbientSound('fireplace')} 
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                        ambientSound === 'fireplace' ? 'bg-primary/20 border border-primary/50 text-white' : 'bg-white/5 border border-white/10 text-foreground/60 hover:bg-white/10'
                      }`}
                    >
                      Lareira
                    </button>
                    <button 
                      onClick={() => setAmbientSound('night')} 
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                        ambientSound === 'night' ? 'bg-primary/20 border border-primary/50 text-white' : 'bg-white/5 border border-white/10 text-foreground/60 hover:bg-white/10'
                      }`}
                    >
                      Noite
                    </button>
                    <button 
                      onClick={() => setAmbientSound('meditation')} 
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                        ambientSound === 'meditation' ? 'bg-primary/20 border border-primary/50 text-white' : 'bg-white/5 border border-white/10 text-foreground/60 hover:bg-white/10'
                      }`}
                    >
                      Meditação
                    </button>
                  </div>
                  
                  {ambientSound && (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <button 
                        onClick={toggleSound}
                        className="p-3 text-white rounded-xl bg-primary hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 flex items-center justify-center"
                      >
                        {isPlaying ? (
                          <RiVolumeMuteLine className="w-5 h-5 mr-2" />
                        ) : (
                          <RiVolumeUpLine className="w-5 h-5 mr-2" />
                        )}
                        {isPlaying ? 'Pausar' : 'Reproduzir'}
                      </button>
                      
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm text-foreground/60">Volume:</span>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={volume} 
                          onChange={(e) => setVolume(Number(e.target.value))}
                          className="flex-1 accent-primary"
                          style={{
                            background: 'linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ' + volume + '%, rgba(255, 255, 255, 0.2) ' + volume + '%, rgba(255, 255, 255, 0.2) 100%)',
                            height: '3px',
                            borderRadius: '4px',
                            outline: 'none',
                            WebkitAppearance: 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Painel lateral - Meditações e técnicas de relaxamento */}
              <div className="lg:col-span-4 space-y-8">
                {/* Meditação Guiada */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold mb-4">Meditação Guiada</h2>
                  
                  {meditationType ? (
                    // Interface de meditação ativa
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-white mb-1">
                          {GUIDED_MEDITATIONS.find(m => m.id === meditationType)?.name}
                        </h3>
                        <p className="text-foreground/60 text-sm">
                          Tempo restante: {formatTime(meditationTimer)}
                        </p>
                      </div>
                      
                      {/* Instruções específicas baseadas no tipo de meditação */}
                      {meditationType === 'breathing' && (
                        <div className="flex flex-col items-center">
                          <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-1000 ease-in-out ${
                            breathingPhase === 'inhale' 
                              ? 'border-primary/50 bg-primary/10 scale-90' 
                              : breathingPhase === 'hold'
                              ? 'border-primary border-opacity-70 bg-primary/20 scale-100' 
                              : 'border-primary/30 bg-primary/5 scale-75'
                          }`}>
                            <span className="text-lg font-medium">
                              {breathingPhase === 'inhale' 
                                ? 'Inspire' 
                                : breathingPhase === 'hold' 
                                ? 'Segure' 
                                : 'Expire'}
                            </span>
                          </div>
                          <p className="mt-4 text-sm text-foreground/80">
                            {breathingPhase === 'inhale' 
                              ? 'Inspire lentamente pelo nariz por 4 segundos' 
                              : breathingPhase === 'hold' 
                              ? 'Segure o ar por 7 segundos' 
                              : 'Expire completamente pela boca por 8 segundos'}
                          </p>
                        </div>
                      )}
                      
                      {meditationType === 'bodyscan' && (
                        <p className="text-sm text-foreground/80">
                          Relaxe cada parte do seu corpo, começando pelos pés e subindo lentamente até a cabeça.
                          Sinta a tensão se dissolvendo em cada área.
                        </p>
                      )}
                      
                      {meditationType === 'gratitude' && (
                        <p className="text-sm text-foreground/80">
                          Pense em 3 coisas pelas quais você é grato hoje. Visualize cada uma e permita-se sentir a gratidão por completo.
                        </p>
                      )}
                      
                      {meditationType === 'mindfulness' && (
                        <p className="text-sm text-foreground/80">
                          Observe seus pensamentos sem julgamento. Quando sua mente divagar, gentilmente traga sua atenção de volta à respiração.
                        </p>
                      )}
                      
                      {meditationType === 'visualize' && (
                        <p className="text-sm text-foreground/80">
                          Visualize um lugar tranquilo e seguro. Explore os detalhes, as cores, os sons e sensações deste local especial.
                        </p>
                      )}
                      
                      <button
                        onClick={() => {
                          setMeditationType(null);
                          setIsBreathingActive(false);
                        }}
                        className="w-full py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition-colors"
                      >
                        Finalizar
                      </button>
                    </div>
                  ) : (
                    // Lista de meditações disponíveis
                    <div className="space-y-3">
                      {GUIDED_MEDITATIONS.map((meditation) => (
                        <button
                          key={meditation.id}
                          onClick={() => startMeditation(meditation.id)}
                          className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <span className="font-medium">{meditation.name}</span>
                          <span className="text-sm text-foreground/60">{meditation.duration} min</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Dicas de Neurociência */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <RiMindMap className="text-primary w-5 h-5" />
                    <h2 className="text-xl font-semibold">Neurociência do Relaxamento</h2>
                  </div>
                  
                  <ul className="space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p>A respiração lenta e profunda ativa o nervo vago, reduzindo a resposta ao estresse e ativando seu sistema nervoso parassimpático.</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p>Sons repetitivos e constantes como chuva ou ondas ajudam a sincronizar ondas cerebrais e estimular ondas alfa associadas ao relaxamento.</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p>Visualizações reduzem a atividade na amígdala, área do cérebro responsável pelo processamento do medo e ansiedade.</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p>Apenas 10 minutos diários de meditação podem aumentar a densidade da matéria cinzenta em áreas associadas ao foco e bem-estar.</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p>As técnicas de relaxamento reduzem o cortisol (hormônio do estresse) no sangue e aumentam a produção de serotonina e dopamina.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
} 