'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import GameView from '@/components/GameView';
import StatsPanel from '@/components/StatsPanel';
import GameControls from '@/components/GameControls';
import { GameState } from '@/types/game';

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
  });
  const [capyX, setCapyX] = useState(300);
  const [capyY, setCapyY] = useState(250);
  const [showBugReport, setShowBugReport] = useState(false);
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(true);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Load game state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('capyzen_game');
    if (saved) {
      const gameData = JSON.parse(saved);
      setGameState(gameData);
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
      ...gameState,
      playerName: playerName, capyName: capyName, level: 1, xp: 0, coins: 0, age: 0,
      hunger: 100, happiness: 100, poop: 0, energy: 100, thirst: 100, hygiene: 100, health: 100, equippedItems: [],
    };
    setGameState(newState);
    setIsLoggedIn(true);
    localStorage.setItem('capyzen_game', JSON.stringify(newState));
  };

  // Game actions
  const performAction = (action: string) => {
    const newState = { ...gameState };

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
    newState.hunger = Math.min(100, newState.hunger + 1);
    newState.thirst = Math.min(100, newState.thirst + 0.5);
    newState.poop = Math.min(100, newState.poop + 0.3);
    newState.hygiene = Math.max(0, newState.hygiene - 0.2);

    // Level up
    if (newState.xp >= 100) {
      newState.level += 1;
      newState.xp = 0;
    }

    setGameState(newState);
    localStorage.setItem('capyzen_game', JSON.stringify(newState));
  };

  // Keyboard movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLoggedIn) return;
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

    gameLoopRef.current = setInterval(() => {
      setGameState((prev) => {
        const newState = { ...prev };

        newState.hunger = Math.min(100, newState.hunger + 0.5);
        newState.thirst = Math.min(100, newState.thirst + 0.3);
        newState.poop = Math.min(100, newState.poop + 0.2);
        newState.hygiene = Math.max(0, newState.hygiene - 0.15);
        newState.energy = Math.max(0, newState.energy - 0.1);

        if (newState.hunger > 80 || newState.thirst > 80 || newState.poop > 80) {
          newState.happiness = Math.max(0, newState.happiness - 0.5);
        }

        newState.age = Math.floor((Date.now() - new Date(localStorage.getItem('capyzen_start') || Date.now()).getTime()) / 1000 / 60);

        localStorage.setItem('capyzen_game', JSON.stringify(newState));
        return newState;
      });
    }, 50);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isLoggedIn]);

  // Report bug
  const reportBug = async () => {
    if (!bugTitle.trim() || !bugDescription.trim()) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    try {
      const response = await fetch('/api/send-bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bugTitle,
          description: bugDescription,
          player: gameState.playerName,
          capybara: gameState.capyName,
        }),
      });

      if (response.ok) {
        alert('Bug reportado com sucesso! Obrigado por nos ajudar! 🐛');
        setBugTitle('');
        setBugDescription('');
        setShowBugReport(false);
      }
    } catch (error) {
      console.error('Erro ao reportar bug:', error);
      alert('Erro ao reportar bug. Tente novamente.');
    }
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
            className="w-full px-4 py-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-400"
          />

          <input
            type="text"
            placeholder="Nome da capivara"
            value={capyName}
            onChange={(e) => setCapyName(e.target.value)}
            className="w-full px-4 py-3 mb-6 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-400"
          />

          <Button onClick={startGame} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg">
            🎮 Começar Jogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">🐹 CapyZen</h1>
          <Button onClick={() => { setIsLoggedIn(false); }} variant="outline">
            🚪 Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg p-4 border border-purple-400">
              <GameView gameState={gameState} capyX={capyX} capyY={capyY} />
            </div>
          </div>

          {/* Stats */}
          <StatsPanel gameState={gameState} />
        </div>

        {/* Actions */}
        <GameControls onAction={performAction} />

        {/* Navigation */}
        <div className="mt-4 flex gap-2 flex-wrap">
          <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            💾 Salvar Jogo
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
            🛍️ Loja
          </Button>
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
            ⚙️ Admin
          </Button>
          <Button onClick={() => window.location.href = '/fnf'} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
            🎵 FNF Batalha
          </Button>
          <Button onClick={() => setShowBugReport(true)} className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
            🐛 Reportar Bug
          </Button>
        </div>

        {/* Tip */}
        <div className="mt-4 bg-blue-900 border border-blue-400 rounded-lg p-3 text-sm">
          💡 <strong>Dica:</strong> Use WASD ou Setas para mover a capivara! Cuide bem dela para ganhar mais moedas e experiência.
        </div>
      </div>

      {/* Bug Report Modal */}
      {showBugReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-purple-400">
            <h2 className="text-2xl font-bold mb-4">🐛 Reportar Bug</h2>
            <input
              type="text"
              placeholder="Título do bug"
              value={bugTitle}
              onChange={(e) => setBugTitle(e.target.value)}
              className="w-full px-4 py-2 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-400"
            />
            <textarea
              placeholder="Descrição do bug"
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              className="w-full px-4 py-2 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-400 h-24"
            />
            <div className="flex gap-2">
              <Button onClick={reportBug} className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                Enviar
              </Button>
              <Button onClick={() => setShowBugReport(false)} variant="outline" className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Popup */}
      {showWhatsAppPopup && (
        <div className="fixed bottom-4 right-4 bg-green-500 rounded-lg p-4 shadow-lg max-w-xs animate-bounce z-40">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white">💬 Siga nosso canal!</h3>
            <button onClick={() => { setShowWhatsAppPopup(false); localStorage.setItem('capyzen_popup_dismissed', 'true'); }} className="text-white font-bold">✕</button>
          </div>
          <p className="text-white text-sm mb-3">Siga o canal "Helu💜❤️" no WhatsApp para novidades!</p>
          <a href="https://whatsapp.com/channel/0029Vb7mvxBDOQIOgBSSJ71n" target="_blank" rel="noopener noreferrer" className="block bg-white text-green-500 font-bold py-2 px-4 rounded text-center hover:bg-gray-100">
            📱 Seguir Canal
          </a>
        </div>
      )}
    </div>
  );
}
