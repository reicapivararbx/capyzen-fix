'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import GameView from '@/components/GameView';
import StatsPanel from '@/components/StatsPanel';
import GameControls from '@/components/GameControls';
import ShopModal from '@/components/ShopModal';
import { GameState } from '@/types/game';
import { loadGameState, saveGameState, DEFAULT_GAME_STATE } from '@/lib/game-save';
import { tickLifeState, calculateAgeFromGameState, clampStat } from '@/features/game/life';
import type { LifeState } from '@/features/game/life';

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [capyName, setCapyName] = useState('');
  const [gameState, setGameState] = useState<GameState>({
    playerName: '', capyName: '', level: 1, xp: 0, coins: 0, age: 0,
    hunger: 100, happiness: 100, poop: 0, energy: 100, thirst: 100, hygiene: 100, health: 100, equippedItems: [],
    food: 0, sus: 0, x: 0, y: 0, speed: 0, alive: true, capyColor: '#8B7355', capySize: 50,
    totalScore: 0, totalXP: 0, foodEaten: 0, gamesPlayed: 0, workCount: 0, affectionCount: 0,
    bathroomCount: 0, colorChanges: 0, size: 50, inventory: {} as any,
    fnfSongsCompleted: 0, fnfHighestCombo: 0, millionRewardClaimed: false,
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

  useEffect(() => {
    latestGameStateRef.current = gameState;
  }, [gameState]);

  // Load game state
  useEffect(() => {
    const state = loadGameState();
    if (state.playerName) {
      setGameState(state);
      setIsLoggedIn(true);
    }
    const popupDismissed = localStorage.getItem('capyzen_popup_dismissed');
    if (popupDismissed) {
      setShowWhatsAppPopup(false);
    }
  }, []);

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
    saveGameState(newState);
    setGameState(newState);
    setIsLoggedIn(true);
  };

  // Game actions
  const performAction = (action: string) => {
    const newState = { ...latestGameStateRef.current };

    switch (action) {
      case 'feed':
        newState.hunger = Math.max(0, newState.hunger - 30);
        newState.happiness = Math.min(100, newState.happiness + 10);
        newState.coins += 5;
        newState.xp += 10;
        break;
      case 'play':
        newState.happiness = Math.min(100, newState.happiness + 25);
        newState.energy = Math.max(0, newState.energy - 20);
        newState.hunger = Math.min(100, newState.hunger + 15);
        newState.coins += 8;
        newState.xp += 15;
        break;
      case 'work':
        newState.coins += 20;
        newState.xp += 20;
        newState.energy = Math.max(0, newState.energy - 30);
        newState.hunger = Math.min(100, newState.hunger + 20);
        break;
      case 'sleep':
        newState.energy = Math.min(100, newState.energy + 40);
        newState.hunger = Math.min(100, newState.hunger + 10);
        break;
      case 'bath':
        newState.hygiene = Math.min(100, newState.hygiene + 30);
        newState.energy = Math.max(0, newState.energy - 15);
        break;
      case 'pet':
        newState.happiness = Math.min(100, newState.happiness + 15);
        newState.energy = Math.max(0, newState.energy - 5);
        newState.xp += 5;
        break;
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
    saveGameState(newState);
  };

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
      const step = 15;
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

        const minutes = deltaMs / 60000;
        next.poop = clampStat(next.poop + 0.3 * minutes);

        if (next.hunger > 80 || next.thirst > 80 || next.poop > 80) {
          next.happiness = Math.max(0, next.happiness - 5 * minutes);
        }

        saveGameState(next);
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

  if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full border border-purple-400">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🐹</div>
            <h1 className="text-3xl font-bold text-purple-300 mb-2">CapyZen</h1>
            <p className="text-gray-300">Cuide de sua Capivara</p>
          </div>

          <input
            type="text"
            placeholder="Seu nome"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-700 min-h-[44px]"
          />

          <input
            type="text"
            placeholder="Nome da capivara"
            value={capyName}
            onChange={(e) => setCapyName(e.target.value)}
            className="w-full px-4 py-3 mb-6 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-700 min-h-[44px]"
          />

          <Button onClick={startGame} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg min-h-[44px]">
            🎮 Começar Jogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header + Nav */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold shrink-0">🐹 CapyZen</h1>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button onClick={() => setShowShop(true)} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 min-h-[44px] text-sm sm:text-base">
              🛍️ Loja
            </Button>
            <Button onClick={() => window.location.href = '/admin'} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 min-h-[44px] text-sm sm:text-base">
              ⚙️ Admin
            </Button>
            <Button onClick={() => window.location.href = '/fnf'} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 min-h-[44px] text-sm sm:text-base">
              🎵 FNF
            </Button>
            <Button onClick={() => { setIsLoggedIn(false); }} variant="outline" className="min-h-[44px] min-w-[44px] text-sm sm:text-base">
              🚪 Sair
            </Button>
          </div>
        </div>

        {/* Main area: canvas + stats + actions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Canvas + Actions column */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-purple-400">
              <div className="aspect-[560/400] max-w-full">
                <GameView gameState={gameState} capyX={capyX} capyY={capyY} />
              </div>
            </div>
            <GameControls onAction={performAction} />
          </div>

          {/* Stats + Tools column */}
          <div className="flex flex-col gap-4">
            <StatsPanel gameState={gameState} />
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 min-h-[44px]">
              💾 Salvar
            </Button>
            <Button onClick={() => setShowBugReport(true)} className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 min-h-[44px]">
              🐛 Reportar Bug
            </Button>
            <div className="bg-blue-900/50 border border-blue-400/50 rounded-lg p-3 text-xs leading-relaxed">
              💡 <strong>Dica:</strong> Use WASD ou Setas para mover a capivara!
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Dialog */}
      {!gameState.alive && isLoggedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-label="Game Over">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-red-400 text-center max-h-[85dvh] overflow-y-auto">
            <div className="text-6xl mb-4">💀</div>
            <h2 className="text-3xl font-bold mb-2 text-red-400">Game Over</h2>
            <p className="text-gray-300 mb-6">Sua capivara faleceu...</p>
            <div className="space-y-2 text-sm text-gray-400 mb-6">
              <p>Nível alcançado: <span className="text-purple-300">{gameState.level}</span></p>
              <p>Moedas coletadas: 💰 <span className="text-yellow-300">{gameState.coins}</span></p>
              <p>Idade: <span className="text-purple-300">{gameState.age} dias</span></p>
            </div>
            <Button
              onClick={() => {
                saveGameState({ ...DEFAULT_GAME_STATE, inventory: { ...DEFAULT_GAME_STATE.inventory } });
                localStorage.removeItem('capyzen_start');
                setIsLoggedIn(false);
              }}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold min-h-[44px] min-w-[44px]"
            >
              🔄 Novo Jogo
            </Button>
          </div>
        </div>
      )}

      {/* Bug Report Modal */}
      {showBugReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-label="Reportar bug">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-purple-400 max-h-[85dvh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">🐛 Reportar Bug</h2>
            <input
              type="text"
              placeholder="Título do bug"
              value={bugTitle}
              onChange={(e) => setBugTitle(e.target.value)}
              className="w-full px-4 py-2 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-700 min-h-[44px]"
            />
            <textarea
              placeholder="Descrição do bug"
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              className="w-full px-4 py-2 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-700 h-24 min-h-[44px]"
            />
            <div className="flex gap-2">
              <Button onClick={reportBug} className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 min-h-[44px]">
                Enviar
              </Button>
              <Button onClick={() => setShowBugReport(false)} variant="outline" className="flex-1 min-h-[44px]">
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
