'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

interface GameState {
  player: {
    name: string;
    capyName: string;
    level: number;
    xp: number;
    coins: number;
    age: number;
  };
  capybara: {
    hunger: number;
    happiness: number;
    poop: number;
    energy: number;
    thirst: number;
    hygiene: number;
    health: number;
    equippedItems: string[];
  };
}

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [capyName, setCapyName] = useState('');
  const [gameState, setGameState] = useState<GameState>({
    player: { name: '', capyName: '', level: 1, xp: 0, coins: 0, age: 0 },
    capybara: { hunger: 100, happiness: 100, poop: 0, energy: 100, thirst: 100, hygiene: 100, health: 100, equippedItems: [] },
  });
  const [capyX, setCapyX] = useState(300);
  const [capyY, setCapyY] = useState(250);
  const [showBugReport, setShowBugReport] = useState(false);
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      player: { name: playerName, capyName, level: 1, xp: 0, coins: 0, age: 0 },
      capybara: { hunger: 100, happiness: 100, poop: 0, energy: 100, thirst: 100, hygiene: 100, health: 100, equippedItems: [] },
    };
    setGameState(newState);
    setIsLoggedIn(true);
    localStorage.setItem('capyzen_game', JSON.stringify(newState));
  };

  // Game actions
  const performAction = (action: string) => {
    const newState = { ...gameState };
    const capy = newState.capybara;

    switch (action) {
      case 'feed':
        capy.hunger = Math.max(0, capy.hunger - 30);
        capy.happiness = Math.min(100, capy.happiness + 10);
        newState.player.coins += 5;
        newState.player.xp += 10;
        break;
      case 'play':
        capy.happiness = Math.min(100, capy.happiness + 25);
        capy.energy = Math.max(0, capy.energy - 20);
        capy.hunger = Math.min(100, capy.hunger + 15);
        newState.player.coins += 8;
        newState.player.xp += 15;
        break;
      case 'work':
        newState.player.coins += 20;
        newState.player.xp += 20;
        capy.energy = Math.max(0, capy.energy - 30);
        capy.hunger = Math.min(100, capy.hunger + 20);
        break;
      case 'sleep':
        capy.energy = Math.min(100, capy.energy + 40);
        capy.hunger = Math.min(100, capy.hunger + 10);
        break;
      case 'bath':
        capy.hygiene = Math.min(100, capy.hygiene + 30);
        capy.energy = Math.max(0, capy.energy - 15);
        break;
      case 'pet':
        capy.happiness = Math.min(100, capy.happiness + 15);
        capy.energy = Math.max(0, capy.energy - 5);
        newState.player.xp += 5;
        break;
    }

    // Natural decay
    capy.hunger = Math.min(100, capy.hunger + 1);
    capy.thirst = Math.min(100, capy.thirst + 0.5);
    capy.poop = Math.min(100, capy.poop + 0.3);
    capy.hygiene = Math.max(0, capy.hygiene - 0.2);

    // Level up
    if (newState.player.xp >= 100) {
      newState.player.level += 1;
      newState.player.xp = 0;
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
        const capy = newState.capybara;

        capy.hunger = Math.min(100, capy.hunger + 0.5);
        capy.thirst = Math.min(100, capy.thirst + 0.3);
        capy.poop = Math.min(100, capy.poop + 0.2);
        capy.hygiene = Math.max(0, capy.hygiene - 0.15);
        capy.energy = Math.max(0, capy.energy - 0.1);

        if (capy.hunger > 80 || capy.thirst > 80 || capy.poop > 80) {
          capy.happiness = Math.max(0, capy.happiness - 0.5);
        }

        newState.player.age = Math.floor((Date.now() - new Date(localStorage.getItem('capyzen_start') || Date.now()).getTime()) / 1000 / 60);

        localStorage.setItem('capyzen_game', JSON.stringify(newState));
        return newState;
      });
    }, 50);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isLoggedIn]);

  // Draw canvas
  useEffect(() => {
    if (!isLoggedIn || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#8BA3D9');
    gradient.addColorStop(1, '#C5D9F0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    drawCloud(ctx, 80, 60, 70, '#FFFFFF');
    drawCloud(ctx, 320, 100, 90, '#FFFFFF');
    drawCloud(ctx, 480, 50, 75, '#FFFFFF');

    // Draw sun
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(500, 80, 35, 0, Math.PI * 2);
    ctx.fill();

    // Draw tree
    ctx.fillStyle = '#2D5016';
    ctx.beginPath();
    ctx.arc(450, 200, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#654321';
    ctx.fillRect(430, 250, 40, 100);

    // Draw grass
    ctx.fillStyle = '#5FD068';
    ctx.fillRect(0, 350, canvas.width, 150);

    // Draw flowers
    drawFlower(ctx, 100, 330, '#FF69B4');
    drawFlower(ctx, 200, 340, '#FFB6C1');
    drawFlower(ctx, 350, 320, '#FF69B4');
    drawFlower(ctx, 480, 330, '#FFB6C1');

    // Draw capybara - USANDO IMAGEM REAL
    drawCapybaraWithImage(ctx, capyX, capyY, gameState.capybara.equippedItems);

    // Draw name and level
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.player.capyName, capyX, capyY - 130);

    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#555';
    ctx.fillText(`Lv${gameState.player.level}`, capyX, capyY - 110);
  }, [isLoggedIn, gameState, capyX, capyY]);

  // Draw capybara using the real image
  function drawCapybaraWithImage(ctx: CanvasRenderingContext2D, x: number, y: number, equippedItems: string[]) {
    const img = new Image();
    img.src = '/capybara.png';
    img.onload = () => {
      ctx.drawImage(img, x - 50, y - 50, 100, 100);
      equippedItems.forEach((item, idx) => {
        drawItemOnCapybara(ctx, x, y - 60 - (idx * 25), item);
      });
    };
  }

  function drawItemOnCapybara(ctx: CanvasRenderingContext2D, x: number, y: number, item: string) {
    if (item.includes('food')) {
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.arc(x + 30, y, 12, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.includes('hat')) {
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.ellipse(x, y - 55, 25, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw realistic capybara based on the photo
  function drawCapybaraRealistic(ctx: CanvasRenderingContext2D, x: number, y: number, equippedItems: string[]) {
    // Corpo principal - GRANDE, RECHONCHUDO E FOFO
    ctx.fillStyle = '#D4C5B9'; // Bege claro
    ctx.beginPath();
    ctx.ellipse(x, y + 20, 95, 75, 0, 0, Math.PI * 2);
    ctx.fill();

    // Barriga ainda mais clara
    ctx.fillStyle = '#E8DDD2';
    ctx.beginPath();
    ctx.ellipse(x, y + 25, 70, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeça MUITO GRANDE - característica principal da capivara
    ctx.fillStyle = '#D4C5B9';
    ctx.beginPath();
    ctx.arc(x, y - 35, 70, 0, Math.PI * 2);
    ctx.fill();

    // Focinho GRANDE E ARREDONDADO - como na foto
    ctx.fillStyle = '#E8DDD2';
    ctx.beginPath();
    ctx.ellipse(x + 15, y - 20, 45, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // SEM ORELHAS VISÍVEIS (ou MUITO PEQUENAS)
    ctx.fillStyle = '#C4B5A0';
    ctx.beginPath();
    ctx.arc(x - 50, y - 65, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 50, y - 65, 8, 0, Math.PI * 2);
    ctx.fill();

    // Olhos PEQUENOS E REDONDOS (não grandes como antes)
    ctx.fillStyle = '#2C2C2C';
    ctx.beginPath();
    ctx.arc(x - 10, y - 50, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 30, y - 50, 7, 0, Math.PI * 2);
    ctx.fill();

    // Brilho nos olhos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - 8, y - 52, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 32, y - 52, 3, 0, Math.PI * 2);
    ctx.fill();

    // Nariz GRANDE, AZULADO/CINZENTO - como na foto
    ctx.fillStyle = '#9BA8B5'; // Cinza azulado
    ctx.beginPath();
    ctx.ellipse(x + 20, y - 10, 15, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Narinas
    ctx.fillStyle = '#6B7A8A';
    ctx.beginPath();
    ctx.arc(x + 12, y - 10, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 28, y - 10, 4, 0, Math.PI * 2);
    ctx.fill();

    // Boca - expressão dócil
    ctx.strokeStyle = '#9BA8B5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 20, y + 5, 12, 0, Math.PI, false);
    ctx.stroke();

    // Patas dianteiras - CURTAS E GROSSAS
    ctx.fillStyle = '#D4C5B9';
    ctx.fillRect(x - 60, y + 70, 32, 50);
    ctx.fillRect(x + 30, y + 70, 32, 50);

    // Patas traseiras - CURTAS E GROSSAS
    ctx.fillStyle = '#C4B5A0';
    ctx.fillRect(x - 70, y + 50, 25, 45);
    ctx.fillRect(x + 45, y + 50, 25, 45);

    // Cauda fofa
    ctx.strokeStyle = '#D4C5B9';
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 85, y + 25);
    ctx.quadraticCurveTo(x - 150, y - 10, x - 120, y - 85);
    ctx.stroke();

    // Sombreado para profundidade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(x, y + 85, 95, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw equipped items
    if (equippedItems.includes('hat')) {
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.arc(x, y - 105, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw cloud
  function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - size / 2, y, size / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size / 2, y, size / 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw flower
  function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(x + Math.cos((i / 5) * Math.PI * 2) * 8, y + Math.sin((i / 5) * Math.PI * 2) * 8, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

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
          player: gameState.player.name,
          capybara: gameState.player.capyName,
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
              <canvas ref={canvasRef} width={560} height={400} className="w-full border-2 border-purple-400 rounded" />
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-400">
            <h2 className="text-xl font-bold mb-4">👤 Jogador</h2>
            <div className="space-y-2 text-sm mb-6">
              <p>Nome: <span className="text-purple-300">{gameState.player.name}</span></p>
              <p>Nível: <span className="text-purple-300">{gameState.player.level}</span></p>
              <p>Moedas: 💰 <span className="text-yellow-300">{gameState.player.coins}</span></p>
              <p>Idade: <span className="text-purple-300">{gameState.player.age} dias</span></p>
            </div>

            <h2 className="text-xl font-bold mb-4">📊 Capybara</h2>
            <div className="space-y-2">
              {[
                { label: '🍔 Fome', value: gameState.capybara.hunger, color: 'bg-orange-500' },
                { label: '❤️ Felicidade', value: gameState.capybara.happiness, color: 'bg-pink-500' },
                { label: '💩 Coco', value: gameState.capybara.poop, color: 'bg-yellow-700' },
                { label: '⚡ Energia', value: gameState.capybara.energy, color: 'bg-yellow-400' },
                { label: '💧 Sede', value: gameState.capybara.thirst, color: 'bg-blue-400' },
                { label: '🧴 Higiene', value: gameState.capybara.hygiene, color: 'bg-cyan-400' },
                { label: '❤️‍🩹 Saúde', value: gameState.capybara.health, color: 'bg-green-500' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{stat.label}</span>
                    <span>{Math.round(stat.value)}/100</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`${stat.color} h-2 rounded-full`} style={{ width: `${stat.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2">
          {[
            { label: '🍖 Alimentar', action: 'feed' },
            { label: '🎾 Brincar', action: 'play' },
            { label: '💼 Trabalhar', action: 'work' },
            { label: '😴 Dormir', action: 'sleep' },
            { label: '🚿 Banho', action: 'bath' },
            { label: '🤗 Carinho', action: 'pet' },
          ].map((btn) => (
            <Button key={btn.action} onClick={() => performAction(btn.action)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold">
              {btn.label}
            </Button>
          ))}
        </div>

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
