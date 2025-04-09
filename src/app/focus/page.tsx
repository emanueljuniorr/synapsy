'use client';

import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  RiTimeLine, 
  RiPauseLine, 
  RiPlayLine, 
  RiRestartLine, 
  RiSettings4Line,
  RiArrowLeftLine,
  RiVolumeUpLine,
  RiVolumeMuteLine,
  RiFullscreenLine,
  RiCloseLine,
  RiHome4Line
} from 'react-icons/ri';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';

// Sons para diferentes fases do Pomodoro
const SOUNDS = {
  startFocus: '/sounds/focus-start.mp3',
  startBreak: '/sounds/break-start.mp3',
  tick: '/sounds/tick.mp3',
  complete: '/sounds/complete.mp3',
};

// Configurações padrão de tempo (em minutos)
const DEFAULT_TIMES = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

// Tipos de sessão
type SessionType = 'focus' | 'shortBreak' | 'longBreak';

export default function FocusPage() {
  // Estado para controlar as configurações
  const [settings, setSettings] = useState({
    focusTime: DEFAULT_TIMES.focus,
    shortBreakTime: DEFAULT_TIMES.shortBreak,
    longBreakTime: DEFAULT_TIMES.longBreak,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    volume: 50,
    whiteNoise: 'none',
  });

  // Estados para o timer
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Referências para áudio
  const tickSound = useRef<HTMLAudioElement | null>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  const backgroundSound = useRef<HTMLAudioElement | null>(null);
  
  // Estado para ruído branco
  const [whiteNoise, setWhiteNoise] = useState('none');
  const whiteNoiseOptions = [
    { value: 'none', label: 'Nenhum' },
    { value: 'rain', label: 'Chuva' },
    { value: 'forest', label: 'Floresta' },
    { value: 'cafe', label: 'Café' },
    { value: 'waves', label: 'Ondas' },
    { value: 'whitenoise', label: 'Ruído Branco' },
  ];

  // Efeito para inicializar sons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      tickSound.current = new Audio(SOUNDS.tick);
      notificationSound.current = new Audio(SOUNDS.complete);

      // Carrega as configurações salvas do localStorage
      const savedSettings = localStorage.getItem('focusSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        setTimeLeft(parsedSettings.focusTime * 60);
      }
    }

    return () => {
      backgroundSound.current?.pause();
    };
  }, []);

  // Efeito para gerenciar o temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          
          // Tocar som de tique a cada segundo se o volume estiver ligado
          if (settings.volume > 0 && tickSound.current) {
            tickSound.current.volume = settings.volume / 100;
            tickSound.current.currentTime = 0;
            tickSound.current.play().catch(e => console.error('Erro ao tocar o som:', e));
          }
          
          return newTime;
        });
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Sessão concluída
      handleSessionComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, settings.volume]);

  // Efeito para gerenciar a reprodução do ruído branco
  useEffect(() => {
    if (whiteNoise === 'none') {
      backgroundSound.current?.pause();
      return;
    }

    if (typeof window !== 'undefined') {
      if (backgroundSound.current) {
        backgroundSound.current.pause();
      }
      
      backgroundSound.current = new Audio(`/sounds/${whiteNoise}.mp3`);
      
      if (backgroundSound.current) {
        backgroundSound.current.loop = true;
        backgroundSound.current.volume = settings.volume / 100;
        
        if (isActive) {
          backgroundSound.current.play().catch(e => console.error('Erro ao tocar o som de fundo:', e));
        }
      }
    }
  }, [whiteNoise, isActive, settings.volume]);

  // Função para lidar com o fim de uma sessão
  const handleSessionComplete = () => {
    // Tocar som de notificação
    if (settings.volume > 0 && notificationSound.current) {
      notificationSound.current.volume = settings.volume / 100;
      notificationSound.current.currentTime = 0;
      notificationSound.current.play().catch(e => console.error('Erro ao tocar notificação:', e));
    }

    // Determinar próxima sessão
    if (sessionType === 'focus') {
      // Incrementar contador de pomodoros
      setPomodorosCompleted(prev => {
        const newCount = prev + 1;
        // A cada 4 pomodoros, fazer uma pausa longa
        const nextSession = newCount % 4 === 0 ? 'longBreak' : 'shortBreak';
        
        // Atualizar tipo de sessão e tempo
        setSessionType(nextSession);
        setTimeLeft(
          nextSession === 'longBreak' 
            ? settings.longBreakTime * 60
            : settings.shortBreakTime * 60
        );
        
        // Auto-iniciar a pausa se configurado
        if (settings.autoStartBreaks) {
          setIsActive(true);
        } else {
          setIsActive(false);
        }
        
        return newCount;
      });
    } else {
      // Após uma pausa, voltar ao foco
      setSessionType('focus');
      setTimeLeft(settings.focusTime * 60);
      
      // Auto-iniciar o próximo pomodoro se configurado
      if (settings.autoStartPomodoros) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    }
  };

  // Função para iniciar/pausar o timer
  const toggleTimer = () => {
    // Se estiver iniciando um timer, certifique-se de que o som de fundo esteja tocando
    if (!isActive && backgroundSound.current && whiteNoise !== 'none') {
      backgroundSound.current.play().catch(e => console.error('Erro ao tocar o som de fundo:', e));
    }
    
    setIsActive(!isActive);
  };

  // Função para resetar o timer
  const resetTimer = () => {
    setIsActive(false);
    
    // Resetar para o tempo configurado da sessão atual
    if (sessionType === 'focus') {
      setTimeLeft(settings.focusTime * 60);
    } else if (sessionType === 'shortBreak') {
      setTimeLeft(settings.shortBreakTime * 60);
    } else {
      setTimeLeft(settings.longBreakTime * 60);
    }
  };

  // Função para alternar entre os tipos de sessão
  const changeSessionType = (type: SessionType) => {
    setSessionType(type);
    setIsActive(false);
    
    // Atualizar o tempo baseado no tipo de sessão
    if (type === 'focus') {
      setTimeLeft(settings.focusTime * 60);
    } else if (type === 'shortBreak') {
      setTimeLeft(settings.shortBreakTime * 60);
    } else {
      setTimeLeft(settings.longBreakTime * 60);
    }
  };

  // Função para formatar o tempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Função para salvar configurações
  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem('focusSettings', JSON.stringify(newSettings));
    
    // Atualizar tempo restante baseado na sessão atual
    if (sessionType === 'focus') {
      setTimeLeft(newSettings.focusTime * 60);
    } else if (sessionType === 'shortBreak') {
      setTimeLeft(newSettings.shortBreakTime * 60);
    } else {
      setTimeLeft(newSettings.longBreakTime * 60);
    }
    
    setShowSettings(false);
  };

  // Calcular progresso do timer para o círculo de progresso
  const calculateProgress = () => {
    let totalTime;
    
    if (sessionType === 'focus') {
      totalTime = settings.focusTime * 60;
    } else if (sessionType === 'shortBreak') {
      totalTime = settings.shortBreakTime * 60;
    } else {
      totalTime = settings.longBreakTime * 60;
    }
    
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const progressPercent = calculateProgress();
  const circumference = 2 * Math.PI * 120; // 120 é o raio do círculo
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Cabeçalho */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  Modo Focus
                </h1>
                <p className="text-foreground/60 mt-1">
                  Temporizador Pomodoro para melhorar sua produtividade
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-foreground/60 hover:text-primary"
              >
                <RiSettings4Line className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Container principal */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Seção do timer */}
            <div className="md:col-span-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-lg">
              {/* Tabs para selecionar o tipo de sessão */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex bg-white/5 backdrop-blur-md rounded-xl p-1">
                  <button 
                    onClick={() => changeSessionType('focus')}
                    className={`px-4 py-2 rounded-lg ${sessionType === 'focus' ? 'bg-primary text-white' : 'text-foreground/60 hover:text-foreground/80'}`}
                  >
                    Foco
                  </button>
                  <button 
                    onClick={() => changeSessionType('shortBreak')}
                    className={`px-4 py-2 rounded-lg ${sessionType === 'shortBreak' ? 'bg-primary text-white' : 'text-foreground/60 hover:text-foreground/80'}`}
                  >
                    Pausa Curta
                  </button>
                  <button 
                    onClick={() => changeSessionType('longBreak')}
                    className={`px-4 py-2 rounded-lg ${sessionType === 'longBreak' ? 'bg-primary text-white' : 'text-foreground/60 hover:text-foreground/80'}`}
                  >
                    Pausa Longa
                  </button>
                </div>
              </div>

              {/* Timer circular */}
              <div className="flex justify-center my-10">
                <div className="relative w-64 h-64">
                  {/* Círculo de progresso */}
                  <svg className="w-full h-full" viewBox="0 0 256 256">
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="text-primary transition-all duration-300"
                      transform="rotate(-90 128 128)"
                    />
                  </svg>

                  {/* Tempo no centro */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white font-mono">
                      {formatTime(timeLeft)}
                    </span>
                    <span className="text-foreground/60 capitalize mt-2">
                      {sessionType === 'focus' ? 'Foco' : sessionType === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controles do timer */}
              <div className="flex justify-center items-center gap-6">
                <button
                  onClick={resetTimer}
                  className="p-3 text-foreground/60 hover:text-primary transition-colors rounded-full hover:bg-white/5"
                >
                  <RiRestartLine className="w-6 h-6" />
                </button>
                <button
                  onClick={toggleTimer}
                  className="p-6 bg-primary hover:bg-primary/90 text-white rounded-full transition-colors shadow-lg shadow-primary/20 flex items-center justify-center"
                >
                  {isActive ? <RiPauseLine className="w-8 h-8" /> : <RiPlayLine className="w-8 h-8" />}
                </button>
              </div>

              {/* Status e contadores */}
              <div className="mt-10 flex justify-between items-center">
                <div className="text-foreground/60">
                  <p className="text-sm">Status: <span className="text-foreground/90">{isActive ? 'Em andamento' : 'Pausado'}</span></p>
                </div>
                <div className="text-foreground/60">
                  <p className="text-sm">Pomodoros Completados: <span className="text-primary font-medium">{pomodorosCompleted}</span></p>
                </div>
              </div>
            </div>

            {/* Painel lateral */}
            <div className="md:col-span-4 space-y-8">
              {/* Card de ruído branco */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-medium mb-4">Sons Ambientes</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {whiteNoiseOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setWhiteNoise(option.value)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          whiteNoise === option.value 
                            ? 'bg-primary text-white' 
                            : 'bg-white/5 text-foreground/60 hover:bg-white/10'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  
                  {whiteNoise !== 'none' && (
                    <div className="mt-4">
                      <label className="block text-sm text-foreground/60 mb-2">Volume</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={settings.volume} 
                        onChange={(e) => setSettings({...settings, volume: Number(e.target.value)})}
                        className="w-full accent-primary"
                        style={{
                          background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${settings.volume}%, rgba(255, 255, 255, 0.1) ${settings.volume}%, rgba(255, 255, 255, 0.1) 100%)`,
                          height: '4px',
                          borderRadius: '4px',
                          outline: 'none',
                          WebkitAppearance: 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Dicas de neurociência */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-medium mb-4">Dicas de Neurociência</h3>
                <ul className="space-y-3 text-sm text-foreground/80">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <p>A alternância entre foco intenso e pausas aumenta a capacidade cognitiva e reduz a fadiga mental.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <p>O córtex pré-frontal recupera melhor a capacidade de atenção após pausas regulares.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <p>Sons de fundo sem letra (como ruído branco) estimulam a concentração sem distrair o cérebro.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de configurações */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div 
              className="bg-background border border-white/10 rounded-2xl shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 bg-gradient-to-r from-primary/10 to-accent/10">
                <h3 className="text-xl font-bold text-white">
                  Configurações do Pomodoro
                </h3>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label htmlFor="focusTime" className="block text-sm font-medium text-foreground/80 mb-1">
                      Tempo de Foco (min)
                    </label>
                    <input
                      type="number"
                      id="focusTime"
                      value={settings.focusTime}
                      onChange={(e) => setSettings({...settings, focusTime: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="shortBreakTime" className="block text-sm font-medium text-foreground/80 mb-1">
                      Pausa Curta (min)
                    </label>
                    <input
                      type="number"
                      id="shortBreakTime"
                      value={settings.shortBreakTime}
                      onChange={(e) => setSettings({...settings, shortBreakTime: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="longBreakTime" className="block text-sm font-medium text-foreground/80 mb-1">
                      Pausa Longa (min)
                    </label>
                    <input
                      type="number"
                      id="longBreakTime"
                      value={settings.longBreakTime}
                      onChange={(e) => setSettings({...settings, longBreakTime: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3 mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoStartBreaks"
                      checked={settings.autoStartBreaks}
                      onChange={(e) => setSettings({...settings, autoStartBreaks: e.target.checked })}
                      className="w-4 h-4 accent-primary mr-2"
                    />
                    <label htmlFor="autoStartBreaks" className="text-sm text-foreground/80">
                      Auto-iniciar pausas
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoStartPomodoros"
                      checked={settings.autoStartPomodoros}
                      onChange={(e) => setSettings({...settings, autoStartPomodoros: e.target.checked })}
                      className="w-4 h-4 accent-primary mr-2"
                    />
                    <label htmlFor="autoStartPomodoros" className="text-sm text-foreground/80">
                      Auto-iniciar pomodoros
                    </label>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label htmlFor="volume" className="block text-sm font-medium text-foreground/80 mb-1">
                    Volume do Alarme
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      id="volume"
                      min="0"
                      max="100"
                      value={settings.volume}
                      onChange={(e) => setSettings({...settings, volume: parseInt(e.target.value) })}
                      className="w-full accent-primary"
                      style={{
                        background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${settings.volume}%, rgba(255, 255, 255, 0.1) ${settings.volume}%, rgba(255, 255, 255, 0.1) 100%)`,
                        height: '4px',
                        borderRadius: '4px',
                        outline: 'none',
                        WebkitAppearance: 'none'
                      }}
                    />
                    <span className="text-sm text-foreground/60 w-8">{settings.volume}%</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setShowSettings(false);
                      saveSettings(settings);
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
      </div>
    </MainLayout>
  );
} 