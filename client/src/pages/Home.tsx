import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

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
  const [capyX, setCapyX] = useState(200);
  const [capyY, setCapyY] = useState(250);

  function getInitialState() {
    return {
      player: {
        username: "",
        capyName: "",
        level: 1,
        xp: 0,
        maxXp: 100,
        coins: 0,
        food: 3,
        days: 0,
        streakDays: 0,
        alive: true,
      },
      capybara: {
        hunger: 99,
        happiness: 99,
        poop: 0,
        energy: 99,
        thirst: 79,
        hygiene: 99,
        health: 100,
        mood: "😊 Feliz",
      },
      achievements: [],
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

    // Clear canvas with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#E0F6FF");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    drawCloud(ctx, 80, 60, 60);
    drawCloud(ctx, 300, 80, 80);
    drawCloud(ctx, 450, 50, 70);

    // Draw sun
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(500, 80, 40, 0, Math.PI * 2);
    ctx.fill();

    // Draw rainbow
    drawRainbow(ctx, 150, 200, 100);

    // Draw tree
    ctx.fillStyle = "#228B22";
    ctx.beginPath();
    ctx.arc(450, 200, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(430, 250, 40, 80);

    // Draw grass
    ctx.fillStyle = "#90EE90";
    ctx.fillRect(0, 350, canvas.width, 150);

    // Draw flowers
    drawFlower(ctx, 100, 320);
    drawFlower(ctx, 200, 330);
    drawFlower(ctx, 350, 310);
    drawFlower(ctx, 480, 320);

    // Draw capybara
    drawCapybara(ctx, capyX, capyY);

    // Draw name and level
    ctx.fillStyle = "#333";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(gameState.player.capyName, capyX, capyY - 100);
    
    ctx.font = "bold 12px Arial";
    ctx.fillText(`Lv${gameState.player.level}`, capyX, capyY - 85);
  }, [isLoggedIn, gameState, capyX, capyY]);

  // Draw capybara function
  function drawCapybara(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Corpo
    ctx.fillStyle = "#9B7653";
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 85, 75, 0, 0, Math.PI * 2);
    ctx.fill();

    // Barriga
    ctx.fillStyle = "#B8956A";
    ctx.beginPath();
    ctx.ellipse(x, y + 15, 60, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeça
    ctx.fillStyle = "#A68968";
    ctx.beginPath();
    ctx.arc(x, y - 35, 55, 0, Math.PI * 2);
    ctx.fill();

    // Focinho
    ctx.fillStyle = "#C4A574";
    ctx.beginPath();
    ctx.ellipse(x, y - 20, 35, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orelhas
    ctx.fillStyle = "#9B7653";
    ctx.beginPath();
    ctx.arc(x - 35, y - 70, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 35, y - 70, 18, 0, Math.PI * 2);
    ctx.fill();

    // Interior das orelhas
    ctx.fillStyle = "#8B6F47";
    ctx.beginPath();
    ctx.arc(x - 35, y - 70, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 35, y - 70, 10, 0, Math.PI * 2);
    ctx.fill();

    // Olhos
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(x - 18, y - 45, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 18, y - 45, 10, 0, Math.PI * 2);
    ctx.fill();

    // Brilho nos olhos
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x - 15, y - 48, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 21, y - 48, 4, 0, Math.PI * 2);
    ctx.fill();

    // Nariz
    ctx.fillStyle = "#5C4033";
    ctx.beginPath();
    ctx.arc(x, y - 15, 10, 0, Math.PI * 2);
    ctx.fill();

    // Narinas
    ctx.fillStyle = "#3D2817";
    ctx.beginPath();
    ctx.arc(x - 5, y - 15, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 5, y - 15, 3, 0, Math.PI * 2);
    ctx.fill();

    // Boca
    ctx.strokeStyle = "#5C4033";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y - 5, 15, 0, Math.PI, false);
    ctx.stroke();

    // Patas
    ctx.fillStyle = "#9B7653";
    ctx.fillRect(x - 55, y + 60, 30, 50);
    ctx.fillRect(x + 25, y + 60, 30, 50);

    // Patas traseiras
    ctx.fillStyle = "#8B6F47";
    ctx.fillRect(x - 70, y + 40, 25, 45);
    ctx.fillRect(x + 45, y + 40, 25, 45);

    // Cauda
    ctx.strokeStyle = "#9B7653";
    ctx.lineWidth = 25;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 80, y + 20);
    ctx.quadraticCurveTo(x - 140, y - 20, x - 110, y - 90);
    ctx.stroke();
  }

  function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.6, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRainbow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    const colors = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"];
    for (let i = colors.length - 1; i >= 0; i--) {
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(x, y, radius - i * 8, 0, Math.PI, false);
      ctx.stroke();
    }
  }

  function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Pétalas
    ctx.fillStyle = "#FF69B4";
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * 15, y + Math.sin(angle) * 15, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    // Centro
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!isLoggedIn) return;

    gameLoopRef.current = setInterval(() => {
      // Movement
      let newX = capyX;
      let newY = capyY;

      if (keysPressed.current["w"] || keysPressed.current["arrowup"]) newY = Math.max(100, newY - 5);
      if (keysPressed.current["s"] || keysPressed.current["arrowdown"]) newY = Math.min(300, newY + 5);
      if (keysPressed.current["a"] || keysPressed.current["arrowleft"]) newX = Math.max(50, newX - 5);
      if (keysPressed.current["d"] || keysPressed.current["arrowright"]) newX = Math.min(450, newX + 5);

      setCapyX(newX);
      setCapyY(newY);

      // Decrease stats
      setGameState((prev: any) => {
        const updated = { ...prev };
        updated.capybara.hunger = Math.max(0, updated.capybara.hunger - 0.3);
        updated.capybara.happiness = Math.max(0, updated.capybara.happiness - 0.2);
        updated.capybara.energy = Math.max(0, updated.capybara.energy - 0.15);
        updated.capybara.thirst = Math.max(0, updated.capybara.thirst - 0.25);
        updated.capybara.hygiene = Math.max(0, updated.capybara.hygiene - 0.1);
        updated.capybara.poop = Math.min(100, updated.capybara.poop + 0.2);

        // Update mood
        if (updated.capybara.hunger < 30) updated.capybara.mood = "😢 Faminto";
        else if (updated.capybara.happiness < 30) updated.capybara.mood = "😞 Triste";
        else if (updated.capybara.energy < 20) updated.capybara.mood = "😴 Cansado";
        else updated.capybara.mood = "😊 Feliz";

        // Check if dead
        if (updated.capybara.hunger <= 0 || updated.capybara.health <= 0) {
          updated.player.alive = false;
        }

        return updated;
      });
    }, 1000);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isLoggedIn, capyX, capyY]);

  // Actions
  const feed = () => {
    setGameState((prev: any) => ({
      ...prev,
      capybara: {
        ...prev.capybara,
        hunger: Math.min(100, prev.capybara.hunger + 20),
      },
      player: {
        ...prev.player,
        coins: prev.player.coins + 10,
        xp: prev.player.xp + 5,
      },
    }));
  };

  const play = () => {
    setGameState((prev: any) => ({
      ...prev,
      capybara: {
        ...prev.capybara,
        happiness: Math.min(100, prev.capybara.happiness + 15),
        energy: Math.max(0, prev.capybara.energy - 10),
      },
      player: {
        ...prev.player,
        coins: prev.player.coins + 15,
        xp: prev.player.xp + 10,
      },
    }));
  };

  const work = () => {
    setGameState((prev: any) => ({
      ...prev,
      player: {
        ...prev.player,
        coins: prev.player.coins + 50,
        xp: prev.player.xp + 20,
      },
      capybara: {
        ...prev.capybara,
        energy: Math.max(0, prev.capybara.energy - 20),
      },
    }));
  };

  const sleep = () => {
    setGameState((prev: any) => ({
      ...prev,
      capybara: {
        ...prev.capybara,
        energy: Math.min(100, prev.capybara.energy + 40),
      },
      player: {
        ...prev.player,
        xp: prev.player.xp + 5,
      },
    }));
  };

  const bath = () => {
    setGameState((prev: any) => ({
      ...prev,
      capybara: {
        ...prev.capybara,
        hygiene: Math.min(100, prev.capybara.hygiene + 30),
        poop: Math.max(0, prev.capybara.poop - 20),
      },
      player: {
        ...prev.player,
        coins: prev.player.coins + 5,
        xp: prev.player.xp + 8,
      },
    }));
  };

  const pet = () => {
    setGameState((prev: any) => ({
      ...prev,
      capybara: {
        ...prev.capybara,
        happiness: Math.min(100, prev.capybara.happiness + 10),
      },
      player: {
        ...prev.player,
        xp: prev.player.xp + 3,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-purple-500 border-2">
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl">🐹</div>
              <h1 className="text-3xl font-bold text-white">CapyZen</h1>
              <p className="text-gray-300">Cuide de sua Capivara</p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Seu nome"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white placeholder-gray-400 rounded-lg border border-purple-500 focus:outline-none focus:border-purple-300"
              />
              <input
                type="text"
                placeholder="Nome da capivara"
                value={capyName}
                onChange={(e) => setCapyName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white placeholder-gray-400 rounded-lg border border-purple-500 focus:outline-none focus:border-purple-300"
              />
              {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            </div>

            <Button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2"
            >
              🎮 Começar Jogo
            </Button>

            <div className="flex gap-2">
              <Link href="/loja" className="flex-1">
                <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white">
                  🛍️ Loja
                </Button>
              </Link>
              <Link href="/admin" className="flex-1">
                <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white">
                  ⚙️ Admin
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Game Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">🐹 CapyZen</h1>
            <Button onClick={logout} className="bg-red-600 hover:bg-red-700">
              🚪 Sair
            </Button>
          </div>

          <Card className="bg-slate-800 border-purple-500 border-2 p-4">
            <canvas
              ref={canvasRef}
              width={500}
              height={400}
              className="w-full border-4 border-purple-500 rounded-lg"
            />
          </Card>

          <div className="grid grid-cols-3 gap-2">
            <Button onClick={feed} className="bg-orange-500 hover:bg-orange-600">
              🍖 Alimentar
            </Button>
            <Button onClick={play} className="bg-blue-500 hover:bg-blue-600">
              🎾 Brincar
            </Button>
            <Button onClick={work} className="bg-green-500 hover:bg-green-600">
              💼 Trabalhar
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button onClick={sleep} className="bg-purple-500 hover:bg-purple-600">
              😴 Dormir
            </Button>
            <Button onClick={bath} className="bg-cyan-500 hover:bg-cyan-600">
              🚿 Banho
            </Button>
            <Button onClick={pet} className="bg-pink-500 hover:bg-pink-600">
              🤗 Carinho
            </Button>
          </div>

          <Button onClick={saveGame} className="w-full bg-slate-700 hover:bg-slate-600">
            💾 Salvar Jogo
          </Button>
        </div>

        {/* Status Panel */}
        <div className="space-y-4">
          <Card className="bg-slate-800 border-purple-500 border-2 p-4">
            <h2 className="text-xl font-bold text-white mb-4">👤 Jogador</h2>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Nome:</span>
                <span className="text-white font-bold">{gameState.player.username}</span>
              </div>
              <div className="flex justify-between">
                <span>Nível:</span>
                <span className="text-white font-bold">{gameState.player.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Moedas:</span>
                <span className="text-yellow-400 font-bold">💰 {gameState.player.coins}</span>
              </div>
              <div className="flex justify-between">
                <span>Idade:</span>
                <span className="text-white font-bold">{gameState.player.days} dias</span>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800 border-purple-500 border-2 p-4">
            <h2 className="text-xl font-bold text-white mb-4">📊 Capybara</h2>
            <div className="space-y-3">
              {[
                { label: "🍔 Fome", value: gameState.capybara.hunger, color: "bg-orange-500" },
                { label: "❤️ Felicidade", value: gameState.capybara.happiness, color: "bg-pink-500" },
                { label: "💩 Coco", value: gameState.capybara.poop, color: "bg-yellow-700" },
                { label: "⚡ Energia", value: gameState.capybara.energy, color: "bg-blue-500" },
                { label: "💧 Sede", value: gameState.capybara.thirst, color: "bg-cyan-500" },
                { label: "🧴 Higiene", value: gameState.capybara.hygiene, color: "bg-green-500" },
                { label: "❤️‍🩹 Saúde", value: gameState.capybara.health, color: "bg-red-500" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>{stat.label}</span>
                    <span>{Math.round(stat.value)}/100</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${stat.color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, stat.value)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-slate-800 border-purple-500 border-2 p-4">
            <h2 className="text-xl font-bold text-white mb-2">💡 Dica</h2>
            <p className="text-xs text-gray-300">
              Use WASD ou Setas para mover a capivara! Cuide bem dela para ganhar mais moedas e experiência.
            </p>
          </Card>

          <div className="flex gap-2">
            <Link href="/loja" className="flex-1">
              <Button className="w-full bg-slate-700 hover:bg-slate-600">
                🛍️ Loja
              </Button>
            </Link>
            <Link href="/admin" className="flex-1">
              <Button className="w-full bg-slate-700 hover:bg-slate-600">
                ⚙️ Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
