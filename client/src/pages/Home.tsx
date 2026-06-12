import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Game State
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem("capyzen_game");
      return saved ? JSON.parse(saved) : getInitialState();
    } catch {
      return getInitialState();
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [capyName, setCapyName] = useState("");
  const [loginError, setLoginError] = useState("");

  function getInitialState() {
    return {
      player: {
        username: "",
        capyName: "",
        level: 1,
        xp: 0,
        maxXp: 100,
        coins: 1000,
        age: 0,
      },
      capybara: {
        hunger: 100,
        happiness: 100,
        energy: 100,
        health: 100,
        mood: "😊 Feliz",
      },
    };
  }

  // Save game
  const saveGame = () => {
    try {
      localStorage.setItem("capyzen_game", JSON.stringify(gameState));
    } catch (e) {
      console.error("Erro ao salvar:", e);
    }
  };

  // Start game
  const startGame = () => {
    if (!username.trim() || !capyName.trim()) {
      setLoginError("Preencha todos os campos!");
      return;
    }

    const newState = {
      ...gameState,
      player: {
        ...gameState.player,
        username: username.trim(),
        capyName: capyName.trim(),
      },
    };

    setGameState(newState);
    localStorage.setItem("capyzen_game", JSON.stringify(newState));
    setIsLoggedIn(true);
    setLoginError("");
  };

  // Draw capybara
  useEffect(() => {
    if (!isLoggedIn || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear canvas
    ctx.fillStyle = "rgba(15, 15, 35, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Corpo
    ctx.fillStyle = "#8B6F47";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 80, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeça
    ctx.fillStyle = "#A0826D";
    ctx.beginPath();
    ctx.arc(centerX + 40, centerY - 50, 50, 0, Math.PI * 2);
    ctx.fill();

    // Orelhas
    ctx.fillStyle = "#8B6F47";
    ctx.beginPath();
    ctx.arc(centerX + 20, centerY - 90, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 60, centerY - 90, 15, 0, Math.PI * 2);
    ctx.fill();

    // Olhos
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(centerX + 25, centerY - 60, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 55, centerY - 60, 8, 0, Math.PI * 2);
    ctx.fill();

    // Brilho nos olhos
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(centerX + 27, centerY - 62, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 57, centerY - 62, 3, 0, Math.PI * 2);
    ctx.fill();

    // Nariz
    ctx.fillStyle = "#654321";
    ctx.beginPath();
    ctx.arc(centerX + 40, centerY - 40, 8, 0, Math.PI * 2);
    ctx.fill();

    // Boca
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX + 40, centerY - 30, 12, 0, Math.PI, false);
    ctx.stroke();

    // Patas
    ctx.fillStyle = "#8B6F47";
    ctx.fillRect(centerX - 50, centerY + 50, 25, 40);
    ctx.fillRect(centerX + 25, centerY + 50, 25, 40);

    // Cauda
    ctx.strokeStyle = "#8B6F47";
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(centerX - 70, centerY);
    ctx.quadraticCurveTo(centerX - 120, centerY - 30, centerX - 100, centerY - 80);
    ctx.stroke();

    // Nome
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(gameState.player.capyName, centerX, canvas.height - 20);
  }, [isLoggedIn, gameState.player.capyName]);

  // Game loop
  useEffect(() => {
    if (!isLoggedIn) return;

    gameLoopRef.current = setInterval(() => {
      setGameState((prev: any) => {
        const updated = { ...prev };
        updated.capybara.hunger = Math.max(0, updated.capybara.hunger - 0.5);
        updated.capybara.happiness = Math.max(0, updated.capybara.happiness - 0.3);
        updated.capybara.energy = Math.max(0, updated.capybara.energy - 0.2);

        if (updated.capybara.hunger < 20) {
          updated.capybara.health = Math.max(0, updated.capybara.health - 0.5);
        }

        const avg =
          (updated.capybara.hunger +
            updated.capybara.happiness +
            updated.capybara.energy) /
          3;
        if (avg >= 80) updated.capybara.mood = "😊 Feliz";
        else if (avg >= 60) updated.capybara.mood = "😐 Normal";
        else if (avg >= 40) updated.capybara.mood = "😟 Triste";
        else updated.capybara.mood = "😢 Muito Triste";

        return updated;
      });
    }, 500);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isLoggedIn]);

  // Actions
  const feedCapy = () => {
    if (gameState.capybara.hunger >= 100) return;
    setGameState((prev: any) => ({
      ...prev,
      capybara: {
        ...prev.capybara,
        hunger: Math.min(100, prev.capybara.hunger + 30),
      },
      player: {
        ...prev.player,
        coins: prev.player.coins + 10,
        xp: prev.player.xp + 5,
      },
    }));
  };

  const playWithCapy = () => {
    if (gameState.capybara.energy < 20) return;
    setGameState((prev: any) => ({
      ...prev,
      capybara: {
        ...prev.capybara,
        happiness: Math.min(100, prev.capybara.happiness + 25),
        energy: Math.max(0, prev.capybara.energy - 20),
      },
      player: {
        ...prev.player,
        xp: prev.player.xp + 10,
      },
    }));
  };

  const workCapy = () => {
    if (gameState.capybara.energy < 30) return;
    const coinsEarned = Math.floor(Math.random() * 50) + 20;
    setGameState((prev: any) => ({
      ...prev,
      capybara: {
        ...prev.capybara,
        energy: Math.max(0, prev.capybara.energy - 30),
      },
      player: {
        ...prev.player,
        coins: prev.player.coins + coinsEarned,
        xp: prev.player.xp + 15,
      },
    }));
  };

  const sleepCapy = () => {
    setGameState((prev: any) => ({
      ...prev,
      capybara: {
        ...prev.capybara,
        energy: Math.min(100, prev.capybara.energy + 50),
        hunger: Math.max(0, prev.capybara.hunger - 10),
      },
      player: {
        ...prev.player,
        xp: prev.player.xp + 5,
      },
    }));
  };

  const bathCapy = () => {
    setGameState((prev: any) => ({
      ...prev,
      capybara: {
        ...prev.capybara,
        health: Math.min(100, prev.capybara.health + 30),
        happiness: Math.min(100, prev.capybara.happiness + 15),
      },
      player: {
        ...prev.player,
        xp: prev.player.xp + 8,
      },
    }));
  };

  const petCapy = () => {
    setGameState((prev: any) => ({
      ...prev,
      capybara: {
        ...prev.capybara,
        happiness: Math.min(100, prev.capybara.happiness + 20),
      },
      player: {
        ...prev.player,
        xp: prev.player.xp + 5,
      },
    }));
  };

  const logout = () => {
    saveGame();
    setIsLoggedIn(false);
    setUsername("");
    setCapyName("");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-slate-800 border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-2">🐹 CapyZen</h1>
            <p className="text-slate-400">Cuide de sua Capivara</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Seu nome"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Nome da capivara"
              value={capyName}
              onChange={(e) => setCapyName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />

            {loginError && (
              <p className="text-red-400 text-sm text-center">{loginError}</p>
            )}

            <Button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              🎮 Começar Jogo
            </Button>

            <div className="flex gap-2 pt-4">
              <Link href="/loja" className="flex-1">
                <Button variant="outline" className="w-full">
                  🛍️ Loja
                </Button>
              </Link>
              <Link href="/admin" className="flex-1">
                <Button variant="outline" className="w-full">
                  ⚙️ Admin
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const hunger = Math.max(0, Math.min(100, gameState.capybara.hunger));
  const happiness = Math.max(0, Math.min(100, gameState.capybara.happiness));
  const energy = Math.max(0, Math.min(100, gameState.capybara.energy));
  const xpPercent = (gameState.player.xp / gameState.player.maxXp) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">🐹 CapyZen</h1>
            <p className="text-slate-400">Cuide de sua Capivara</p>
          </div>
          <nav className="flex gap-4">
            <Link href="/loja">
              <Button variant="outline">🛍️ Loja</Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline">⚙️ Admin</Button>
            </Link>
            <Button onClick={logout} variant="destructive">
              🚪 Sair
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-bold mb-4">👤 Jogador</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Nome:</span>
              <span className="font-bold">{gameState.player.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Nível:</span>
              <span className="font-bold text-blue-400">
                {gameState.player.level}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Moedas:</span>
              <span className="font-bold text-yellow-400">
                {gameState.player.coins}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Idade:</span>
              <span className="font-bold">{gameState.player.age} dias</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-bold mb-2">Próximo Nível</h3>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full transition-all"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {gameState.player.xp}/{gameState.player.maxXp} XP
            </p>
          </div>

          <Button
            onClick={saveGame}
            className="w-full mt-6 bg-green-600 hover:bg-green-700"
          >
            💾 Salvar Jogo
          </Button>
        </Card>

        {/* Center: Game Area */}
        <Card className="bg-slate-800 border-slate-700 p-6 lg:col-span-1">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                {gameState.player.capyName}
              </h2>
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="w-full border-2 border-slate-700 rounded-lg"
              />
            </div>

            {/* Status Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>🍖 Fome</span>
                  <span>{Math.round(hunger)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-400 to-orange-400 h-full transition-all"
                    style={{ width: `${hunger}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>😊 Felicidade</span>
                  <span>{Math.round(happiness)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-400 to-purple-400 h-full transition-all"
                    style={{ width: `${happiness}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>⚡ Energia</span>
                  <span>{Math.round(energy)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full transition-all"
                    style={{ width: `${energy}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={feedCapy}
                variant="outline"
                className="text-sm"
                disabled={gameState.capybara.hunger >= 100}
              >
                🍖 Alimentar
              </Button>
              <Button
                onClick={playWithCapy}
                variant="outline"
                className="text-sm"
                disabled={gameState.capybara.energy < 20}
              >
                🎾 Brincar
              </Button>
              <Button
                onClick={workCapy}
                variant="outline"
                className="text-sm"
                disabled={gameState.capybara.energy < 30}
              >
                💼 Trabalhar
              </Button>
              <Button
                onClick={sleepCapy}
                variant="outline"
                className="text-sm"
              >
                😴 Dormir
              </Button>
              <Button
                onClick={bathCapy}
                variant="outline"
                className="text-sm"
              >
                🚿 Banho
              </Button>
              <Button
                onClick={petCapy}
                variant="outline"
                className="text-sm"
              >
                🤗 Carinho
              </Button>
            </div>
          </div>
        </Card>

        {/* Right Sidebar */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-bold mb-4">📊 Estatísticas</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Saúde:</span>
              <span className="font-bold text-green-400">
                {Math.round(gameState.capybara.health)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Humor:</span>
              <span className="font-bold">{gameState.capybara.mood}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-700 rounded-lg">
            <p className="text-center text-sm text-slate-300">
              💡 Dica: Cuide bem de sua capivara para ganhar mais moedas e
              experiência!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
