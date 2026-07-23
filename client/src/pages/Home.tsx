'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { getLoginUrl } from '@/const';
import { useLocation } from 'wouter';
import GameView from '@/components/GameView';
import StatsPanel from '@/components/StatsPanel';
import GameControls from '@/components/GameControls';
import ShopModal from '@/components/ShopModal';
import { LoginScreen } from '@/components/LoginScreen';
import { GameState } from '@/types/game';
import { loadGameState, saveGameState, DEFAULT_GAME_STATE } from '@/lib/game-save';
import { tickLifeState, calculateAgeFromGameState, clampStat } from '@/features/game/life';
import type { LifeState } from '@/features/game/life';
import { applyActionBoosts, applySpeedBoost, hasShield, applyShieldAbsorb } from '@/lib/boost-effects';

const NAV_BUTTONS = [
  {
    href: '/fnf',
    icon: '🐹',
    label: 'FNF',
    subtitle: 'Jogar Friday Night Funkin\'',
    gradient: 'from-orange-500 to-red-500',
    hoverGradient: 'from-orange-600 to-red-600',
    shadow: 'shadow-orange-500/25',
  },
  {
    href: '/admin',
    icon: '⚙️',
    label: 'ADMIN',
    subtitle: 'Painel Administrativo',
    gradient: 'from-indigo-500 to-purple-500',
    hoverGradient: 'from-indigo-600 to-purple-600',
    shadow: 'shadow-indigo-500/25',
  },
  {
    href: '/chat',
    icon: '💬',
    label: 'CHAT',
    subtitle: 'Conversar com amigos',
    gradient: 'from-teal-500 to-green-500',
    hoverGradient: 'from-teal-600 to-green-600',
    shadow: 'shadow-teal-500/25',
  },
] as const;

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth({});
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [capyName, setCapyName] = useState('');
  const [isNight, setIsNight] = useState(false);
  const [isRaining, setIsRaining] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    playerName: '', capyName: '', level: 1, xp: 0, coins: 0, age: 0,
    hunger: 100, happiness: 100, poop: 0, energy: 100, thirst: 100, hygiene: 100, health: 100, equippedItems: [], ownedClothing: [],
    food: 0, sus: 0, x: 0, y: 0, speed: 0, alive: true, capyColor: '#8B7355', capySize: 50,
    totalScore: 0, totalXP: 0, foodEaten: 0, gamesPlayed: 0, workCount: 0, affectionCount: 0,
    bathroomCount: 0, colorChanges: 0, size: 50, inventory: {} as any,
    fnfSongsCompleted: 0, fnfHighestCombo: 0, millionRewardClaimed: false,
    speedBoost: 0, shieldActive: false, luckBoost: 0, xpBoost: 0, coinBoost: 0,
  });
  const [capyX, setCapyX] = useState(300);
  const [capyY, setCapyY] = useState(250);
  const [showBugReport, setShowBugReport] = useState(false);
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(true);
  const [showShop, setShowShop] = useState(false);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestGameStateRef = useRef<GameState>(gameState);

  const { data: dbGameState, isLoading: loadingGameState } = trpc.game.load.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  const saveToDbMutation = trpc.game.save.useMutation();

  useEffect(() => {
    latestGameStateRef.current = gameState;
  }, [gameState]);

  // Load game state
  useEffect(() => {
    if (isAuthenticated && dbGameState && dbGameState.playerName) {
      setGameState(dbGameState);
      setIsLoggedIn(true);
    } else if (!isAuthenticated) {
      const state = loadGameState();
      if (state.playerName) {
        setGameState(state);
        setIsLoggedIn(true);
      }
    }
    const popupDismissed = localStorage.getItem('capyzen_popup_dismissed');
    if (popupDismissed) {
      setShowWhatsAppPopup(false);
    }
  }, [isAuthenticated, dbGameState]);

  const saveToDb = useCallback((state: GameState) => {
    saveGameState(state);
    if (isAuthenticated) {
      saveToDbMutation.mutate(state);
    }
  }, [isAuthenticated, saveToDbMutation]);

  // Start game
  const startGame = () => {
    if (!playerName.trim() || !capyName.trim()) {
      alert('Por favor, preencha os campos!');
      return;
    }
    const newState: GameState = {
      ...DEFAULT_GAME_STATE,
      inventory: { ...DEFAULT_GAME_STATE.inventory },
      playerName: playerName.trim(),
      capyName: capyName.trim(),
    };
    localStorage.setItem('capyzen_start', new Date().toISOString());
    saveToDb(newState);
    setGameState(newState);
    setIsLoggedIn(true);
  };

  // Game actions
  const performAction = (action: string) => {
    const newState = { ...latestGameStateRef.current };

    switch (action) {
      case 'feed': {
        newState.hunger = Math.max(0, newState.hunger - 30);
        newState.happiness = Math.min(100, newState.happiness + 10);
        const feedRewards = applyActionBoosts(5, 10, newState);
        newState.coins += feedRewards.coins;
        newState.xp += feedRewards.xp;
        break;
      }
      case 'play': {
        newState.happiness = Math.min(100, newState.happiness + 25);
        newState.energy = Math.max(0, newState.energy - 20);
        newState.hunger = Math.min(100, newState.hunger + 15);
        const playRewards = applyActionBoosts(8, 15, newState);
        newState.coins += playRewards.coins;
        newState.xp += playRewards.xp;
        break;
      }
      case 'work': {
        const workRewards = applyActionBoosts(20, 20, newState);
        newState.coins += workRewards.coins;
        newState.xp += workRewards.xp;
        newState.energy = Math.max(0, newState.energy - 30);
        newState.hunger = Math.min(100, newState.hunger + 20);
        break;
      }
      case 'sleep':
        newState.energy = Math.min(100, newState.energy + 40);
        newState.hunger = Math.min(100, newState.hunger + 10);
        break;
      case 'bath':
        newState.hygiene = Math.min(100, newState.hygiene + 30);
        newState.energy = Math.max(0, newState.energy - 15);
        break;
      case 'pet': {
        newState.happiness = Math.min(100, newState.happiness + 15);
        newState.energy = Math.max(0, newState.energy - 5);
        const petRewards = applyActionBoosts(0, 5, newState);
        newState.xp += petRewards.xp;
        break;
      }
    }

    // Natural decay
    newState.hunger = clampStat(newState.hunger + 1);
    newState.thirst = clampStat(newState.thirst + 0.5);
    newState.poop = clampStat(newState.poop + 0.3);
    newState.hygiene = clampStat(newState.hygiene - 0.2);

    // Level up
    if (newState.xp >= 100) {
      newState.level += 1;
      newState.xp = 0;
    }

    latestGameStateRef.current = newState;
    setGameState(newState);
    saveToDb(newState);
  };

  useEffect(() => {
    const cycleDuration = 30000;
    let nightTimeout: ReturnType<typeof setTimeout>;
    let dayTimeout: ReturnType<typeof setTimeout>;
    let rainTimeout: ReturnType<typeof setTimeout>;

    const scheduleCycle = () => {
      nightTimeout = setTimeout(() => {
        setIsNight(true);
        dayTimeout = setTimeout(() => {
          setIsNight(false);
          scheduleCycle();
        }, cycleDuration / 2);
      }, cycleDuration / 2);
    };

    const scheduleWeather = () => {
      rainTimeout = setTimeout(() => {
        setIsRaining((prev) => !prev);
        scheduleWeather();
      }, 45000 + Math.random() * 30000);
    };

    scheduleCycle();
    scheduleWeather();

    return () => {
      clearTimeout(nightTimeout);
      clearTimeout(dayTimeout);
      clearTimeout(rainTimeout);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showBugReport) {
          setShowBugReport(false);
          e.stopPropagation();
        } else if (showWhatsAppPopup) {
          setShowWhatsAppPopup(false);
          localStorage.setItem('capyzen_popup_dismissed', 'true');
          e.stopPropagation();
        }
      }
    };
    window.addEventListener('keydown', handleEscape, true);
    return () => window.removeEventListener('keydown', handleEscape, true);
  }, [showBugReport, showWhatsAppPopup]);

  // Keyboard movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLoggedIn || !latestGameStateRef.current.alive) return;
      const step = applySpeedBoost(15, latestGameStateRef.current.speedBoost);
      const canvasWidth = 560;
      const canvasHeight = 400;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setCapyY((prev) => Math.max(100, prev - step));
          break;
        case 's':
        case 'arrowdown':
          setCapyY((prev) => Math.min(canvasHeight - 50, prev + step));
          break;
        case 'a':
        case 'arrowleft':
          setCapyX((prev) => Math.max(50, prev - step));
          break;
        case 'd':
        case 'arrowright':
          setCapyX((prev) => Math.min(canvasWidth - 50, prev + step));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoggedIn]);

  // Game loop
  useEffect(() => {
    if (!isLoggedIn) return;

    const TICK_INTERVAL_MS = 2000;
    let lastTickTime = Date.now();

    gameLoopRef.current = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastTickTime;
      lastTickTime = now;

      setGameState((prev) => {
        if (!prev.alive) return prev;

        const lifeState: LifeState = {
          alive: prev.alive,
          age: prev.age,
          stats: {
            hunger: 100 - prev.hunger,
            happiness: prev.happiness,
            energy: prev.energy,
            thirst: 100 - prev.thirst,
            hygiene: prev.hygiene,
            health: prev.health,
          },
          totalScore: prev.totalScore,
        };

        const nextLife = tickLifeState(lifeState, deltaMs);

        const next: GameState = {
          ...prev,
          alive: nextLife.alive,
          age: calculateAgeFromGameState(prev),
          hunger: 100 - nextLife.stats.hunger,
          happiness: nextLife.stats.happiness,
          energy: nextLife.stats.energy,
          thirst: 100 - nextLife.stats.thirst,
          hygiene: nextLife.stats.hygiene,
          health: nextLife.stats.health,
          totalScore: nextLife.totalScore,
        };

        // Shield absorption: prevent fatal death and absorb damage
        if (hasShield(next) && !nextLife.alive) {
          // Shield prevents fatal event: absorb damage, keep capy alive, consume shield
          const deathDamage = Math.abs(prev.health - next.health);
          const absorbedDamage = applyShieldAbsorb(deathDamage, true, 100);
          next.health = Math.max(1, prev.health - absorbedDamage);
          next.alive = true;
          next.shieldActive = false;
        } else if (hasShield(next) && next.health < prev.health) {
          // Shield absorbs ongoing damage proportionally
          const damage = prev.health - next.health;
          const absorbedDamage = applyShieldAbsorb(damage, true, 50);
          next.health = prev.health - absorbedDamage;
        }

        const minutes = deltaMs / 60000;
        next.poop = clampStat(next.poop + 0.3 * minutes);

        if (next.hunger > 80 || next.thirst > 80 || next.poop > 80) {
          next.happiness = Math.max(0, next.happiness - 5 * minutes);
        }

        saveToDb(next);
        return next;
      });
    }, TICK_INTERVAL_MS);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [isLoggedIn]);

  // Report bug
  const reportBug = () => {
    if (!bugTitle.trim() || !bugDescription.trim()) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    const subject = encodeURIComponent(`[CapyZen Bug] ${bugTitle}`);
    const body = encodeURIComponent(
      `Jogador: ${gameState.playerName}\nCapivara: ${gameState.capyName}\n\n${bugDescription}`,
    );
    window.open(`mailto:acontasecundaria222@gmail.com?subject=${subject}&body=${body}`, '_blank');
    setBugTitle('');
    setBugDescription('');
    setShowBugReport(false);
  };

  // Logout handler: calls tRPC auth.logout if authenticated, then clears local game state
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      if (isAuthenticated) {
        await logout();
      }
    } catch {
      // Silently handle — useAuth already manages errors, just clear local state
    } finally {
      setIsLoggedIn(false);
      setIsLoggingOut(false);
    }
  }, [isAuthenticated, logout]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950 relative overflow-hidden">
      <div className="habitat-sky" />
      <div className="habitat-ground" />
      <div className="habitat-water" />
      <div className="habitat-vegetation">
        <div className="habitat-tree habitat-tree-left-1" />
        <div className="habitat-tree habitat-tree-left-2" />
        <div className="habitat-tree habitat-tree-right-1" />
        <div className="habitat-cloud habitat-cloud-1" />
        <div className="habitat-cloud habitat-cloud-2" />
        <div className="habitat-cloud habitat-cloud-3" />
        <div className="habitat-cloud habitat-cloud-4" />
      </div>
      <div className="habitat-lighting" />
      <div className="habitat-sunrays" />
      <div className={`habitat-rain${isRaining ? ' active' : ''}`} />
      <div className="habitat-mist" />
      {/* Background meshes */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[32rem] h-[32rem] bg-green-500/[0.06] rounded-full blur-[5rem] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-emerald-500/[0.06] rounded-full blur-[6rem] animate-pulse [animation-delay:1s]" />
      </div>
      <div className="flex flex-col items-center gap-5">
        <div className="text-7xl animate-bounce" aria-hidden="true">🐹</div>
        <p className="text-gray-400 text-lg font-medium tracking-wide">Carregando...</p>
        <div className="flex gap-2">
          <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={() => {}}
        onCreateUser={() => {}}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-green-950 to-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Habitat background */}
        <div className="habitat-sky" />
        <div className="habitat-ground" />
        <div className="habitat-water" />
        <div className="habitat-vegetation">
          <div className="habitat-tree habitat-tree-left-1" />
          <div className="habitat-tree habitat-tree-left-2" />
          <div className="habitat-tree habitat-tree-right-1" />
          <div className="habitat-cloud habitat-cloud-1" />
          <div className="habitat-cloud habitat-cloud-2" />
          <div className="habitat-cloud habitat-cloud-3" />
          <div className="habitat-cloud habitat-cloud-4" />
        </div>
        <div className="habitat-lighting" />
        <div className="habitat-sunrays" />
        <div className={`habitat-rain${isRaining ? ' active' : ''}`} />
        <div className="habitat-mist" />
        {/* Background meshes */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-10 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1.5s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/[0.05] rounded-full blur-3xl animate-pulse [animation-delay:0.8s]" />
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl max-w-md w-full border border-green-500/20 relative z-10">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4 animate-bounce" aria-hidden="true">🐹</div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter mb-2">
              <span className="bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                CAPYZEN
              </span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg">
              Olá, {user?.username || user?.name}! Crie sua capivara
            </p>
          </div>

          <input
            type="text"
            placeholder="Seu nome"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-5 py-4 mb-4 bg-gray-800/80 text-white rounded-2xl border border-gray-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 min-h-[56px] text-lg placeholder:text-gray-500 transition-all duration-200"
          />

          <input
            type="text"
            placeholder="Nome da capivara"
            value={capyName}
            onChange={(e) => setCapyName(e.target.value)}
            className="w-full px-5 py-4 mb-6 bg-gray-800/80 text-white rounded-2xl border border-gray-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 min-h-[56px] text-lg placeholder:text-gray-500 transition-all duration-200"
          />

          <Button
            onClick={startGame}
            className="w-full bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-extrabold py-4 rounded-2xl min-h-[60px] text-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-green-500/25"
          >
            <span className="text-xl mr-2" aria-hidden="true">🎮</span>
            Começar Jogo
          </Button>

          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="outline"
            className="w-full mt-3 min-h-[52px] rounded-2xl font-bold border-red-500/30 text-red-300 hover:bg-red-500/10 hover:border-red-400/60 transition-all duration-200"
          >
            {isLoggingOut ? 'Saindo...' : '🚪 Sair da conta'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* === T3: Natural Habitat Background === */}
      <div className="habitat-sky" />
      <div className="habitat-ground" />
      <div className="habitat-water" />
      <div className="habitat-vegetation">
        <div className="habitat-tree habitat-tree-left-1" />
        <div className="habitat-tree habitat-tree-left-2" />
        <div className="habitat-tree habitat-tree-left-3" />
        <div className="habitat-tree habitat-tree-right-1" />
        <div className="habitat-tree habitat-tree-right-2" />
        <div className="habitat-tree habitat-tree-right-3" />
        <div className="habitat-grass" />
        <div className="habitat-cloud habitat-cloud-1" />
        <div className="habitat-cloud habitat-cloud-2" />
        <div className="habitat-cloud habitat-cloud-3" />
        <div className="habitat-cloud habitat-cloud-4" />
      </div>
      <div className={`habitat-lighting ${isNight ? 'habitat-lighting-night' : 'habitat-lighting-day'}`} />
      <div className="habitat-sunrays" />
      <div className={`habitat-rain${isRaining ? ' active' : ''}`} />
      <div className="habitat-mist" />

      {/* === SHELL: Animated background meshes === */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[32rem] h-[32rem] bg-green-500/[0.06] rounded-full blur-[5rem] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-emerald-500/[0.06] rounded-full blur-[6rem] animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24rem] h-[24rem] bg-teal-500/[0.04] rounded-full blur-[4rem] animate-pulse [animation-delay:2s]" />
      </div>

      {/* === SHELL: Title + Navigation Buttons === */}
      <header className="border-b border-green-500/10 bg-gray-900/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            {/* Title */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-4xl sm:text-5xl select-none drop-shadow-lg" aria-hidden="true">🐹</span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none">
                <span className="bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                  CAPYZEN
                </span>
              </h1>
            </div>

            {/* Navigation buttons — LARGE, responsive grid */}
            <nav
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto"
              role="navigation"
              aria-label="Menu principal"
            >
              {NAV_BUTTONS.map((btn) => (
                <button
                  key={btn.href}
                  type="button"
                  onClick={() => setLocation(btn.href)}
                  className={`
                    group relative flex flex-col items-center justify-center gap-1
                    px-4 py-4 sm:px-6 sm:py-5
                    min-h-[72px] sm:min-h-[80px]
                    rounded-2xl font-bold
                    bg-gradient-to-br ${btn.gradient}
                    shadow-lg ${btn.shadow}
                    transition-all duration-200 ease-out
                    hover:scale-[1.06] hover:shadow-xl hover:${btn.hoverGradient}
                    active:scale-[0.95] active:shadow-md
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
                    overflow-hidden
                  `}
                  aria-label={`Navegar para ${btn.label}`}
                >
                  {/* Shine sweep on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" aria-hidden="true" />
                  <span className="text-2xl sm:text-3xl leading-none drop-shadow-md" aria-hidden="true">{btn.icon}</span>
                  <span className="text-white/95 text-sm sm:text-base font-extrabold tracking-wide leading-tight drop-shadow-sm">
                    {btn.label}
                  </span>
                </button>
              ))}

              {/* SAIR — destructive variant with loading state */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`
                  group relative flex flex-col items-center justify-center gap-1
                  px-4 py-4 sm:px-6 sm:py-5
                  min-h-[72px] sm:min-h-[80px]
                  rounded-2xl font-bold
                  border-2 border-red-500/30 text-red-300
                  bg-red-500/5 hover:bg-red-500/15 hover:border-red-400/60
                  shadow-lg shadow-red-500/10
                  transition-all duration-200 ease-out
                  hover:scale-[1.06] hover:shadow-xl hover:shadow-red-500/25
                  active:scale-[0.95] active:shadow-md
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  overflow-hidden
                `}
                aria-label="Sair do jogo"
                aria-busy={isLoggingOut}
              >
                {/* Shine sweep on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" aria-hidden="true" />
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-red-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-extrabold tracking-wide leading-tight">Saindo...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl sm:text-3xl leading-none drop-shadow-md" aria-hidden="true">🚪</span>
                    <span className="text-white/95 text-sm sm:text-base font-extrabold tracking-wide leading-tight drop-shadow-sm">SAIR</span>
                  </>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* === Game Area === */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Game canvas + controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Canvas + Actions column */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-gray-800/80 rounded-xl p-4 border border-green-500/20">
              <div className="aspect-[560/400] max-w-full">
                <GameView gameState={gameState} capyX={capyX} capyY={capyY} />
              </div>
            </div>
            <GameControls onAction={performAction} />
          </div>

          {/* Stats + Tools column */}
          <div className="flex flex-col gap-4">
            <StatsPanel gameState={gameState} />
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 min-h-[52px] rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/20">
              💾 Salvar
            </Button>
            <Button onClick={() => setShowBugReport(true)} className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 min-h-[52px] rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20">
              🐛 Reportar Bug
            </Button>
            <div className="bg-blue-900/50 border border-blue-400/30 rounded-xl p-3 text-xs leading-relaxed">
              💡 <strong>Dica:</strong> Use WASD ou Setas para mover a capivara!
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Dialog */}
      {!gameState.alive && isLoggedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-label="Game Over">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-red-400/50 text-center max-h-[85dvh] overflow-y-auto shadow-2xl">
            <div className="text-6xl mb-4">💀</div>
            <h2 className="text-3xl font-extrabold mb-2 text-red-400">Game Over</h2>
            <p className="text-gray-300 mb-6">Sua capivara faleceu...</p>
            <div className="space-y-2 text-sm text-gray-400 mb-6">
              <p>Nível alcançado: <span className="text-green-300">{gameState.level}</span></p>
              <p>Moedas coletadas: 💰 <span className="text-yellow-300">{gameState.coins}</span></p>
              <p>Idade: <span className="text-green-300">{gameState.age} dias</span></p>
            </div>
            <Button
              onClick={() => {
                const defaultState = { ...DEFAULT_GAME_STATE, inventory: { ...DEFAULT_GAME_STATE.inventory } };
                saveToDb(defaultState);
                localStorage.removeItem('capyzen_start');
                setIsLoggedIn(false);
              }}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold min-h-[52px] min-w-[52px] rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-red-500/25"
            >
              🔄 Novo Jogo
            </Button>
          </div>
        </div>
      )}

      {/* Bug Report Modal */}
      {showBugReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-label="Reportar bug">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-purple-400/30 max-h-[85dvh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-extrabold mb-4">🐛 Reportar Bug</h2>
            <input
              type="text"
              placeholder="Título do bug"
              value={bugTitle}
              onChange={(e) => setBugTitle(e.target.value)}
              className="w-full px-4 py-3 mb-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 min-h-[48px]"
            />
            <textarea
              placeholder="Descrição do bug"
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              className="w-full px-4 py-3 mb-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 h-24 min-h-[48px]"
            />
            <div className="flex gap-3">
              <Button onClick={reportBug} className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 min-h-[48px] rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Enviar
              </Button>
              <Button onClick={() => setShowBugReport(false)} variant="outline" className="flex-1 min-h-[48px] rounded-xl font-bold">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Shop Modal */}
      <ShopModal isOpen={showShop} onClose={() => setShowShop(false)} />

      {/* WhatsApp Popup */}
      {showWhatsAppPopup && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-green-500 rounded-lg p-4 shadow-lg max-w-xs animate-bounce z-40 mx-auto sm:mx-0">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-bold text-white">💬 Siga nosso canal!</h3>
            <button
              onClick={() => { setShowWhatsAppPopup(false); localStorage.setItem('capyzen_popup_dismissed', 'true'); }}
              className="text-white font-bold shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
          <p className="text-white text-sm mb-3">Siga o canal "Helu💜❤️" no WhatsApp para novidades!</p>
          <a href="https://whatsapp.com/channel/0029Vb7mvxBDOQIOgBSSJ71n" target="_blank" rel="noopener noreferrer" className="block bg-white text-green-500 font-bold py-3 px-4 rounded text-center hover:bg-gray-100 min-h-[44px] flex items-center justify-center">
            📱 Seguir Canal
          </a>
        </div>
      )}
    </div>
  );
}
