import { useEffect, useRef, useState } from "react";
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
  const [capyX, setCapyX] = useState(250);
  const [capyY, setCapyY] = useState(280);
  const [raindrops, setRaindrops] = useState<Array<{ x: number; y: number }>>([]);
  const [isRaining, setIsRaining] = useState(false);

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
      setCapyX((prev: number) => {
        let newX = prev;
        if (keysPressed.current["w"] || keysPressed.current["arrowup"]) newX -= 5;
        if (keysPressed.current["s"] || keysPressed.current["arrowdown"]) newX += 5;
        if (keysPressed.current["a"] || keysPressed.current["arrowleft"]) newX -= 5;
        if (keysPressed.current["d"] || keysPressed.current["arrowright"]) newX += 5;
        return Math.max(80, Math.min(520, newX));
      });

      setCapyY((prev: number) => {
        let newY = prev;
        if (keysPressed.current["w"] || keysPressed.current["arrowup"]) newY -= 5;
        if (keysPressed.current["s"] || keysPressed.current["arrowdown"]) newY += 5;
        return Math.max(150, Math.min(320, newY));
      });

      // Update game state
      setGameState((prev: any) => {
        const updated = { ...prev };
        updated.capybara.hunger = Math.max(0, updated.capybara.hunger - 0.05);
        updated.capybara.thirst = Math.max(0, updated.capybara.thirst - 0.08);
        updated.capybara.energy = Math.max(0, updated.capybara.energy - 0.02);
        updated.capybara.happiness = Math.max(0, updated.capybara.happiness - 0.03);
        updated.capybara.poop = Math.min(100, updated.capybara.poop + 0.1);
        updated.capybara.hygiene = Math.max(0, updated.capybara.hygiene - 0.02);
        return updated;
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
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#8BA3D9");
    gradient.addColorStop(1, "#C5D9F0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    drawCloud(ctx, 80, 60, 70, "#FFFFFF");
    drawCloud(ctx, 320, 100, 90, "#FFFFFF");
    drawCloud(ctx, 480, 50, 75, "#FFFFFF");

    // Draw sun
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(500, 80, 35, 0, Math.PI * 2);
    ctx.fill();

    // Draw tree
    ctx.fillStyle = "#2D5016";
    ctx.beginPath();
    ctx.arc(450, 200, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#654321";
    ctx.fillRect(430, 250, 40, 100);

    // Draw grass
    ctx.fillStyle = "#5FD068";
    ctx.fillRect(0, 350, canvas.width, 150);

    // Draw flowers
    drawFlower(ctx, 100, 330, "#FF69B4");
    drawFlower(ctx, 200, 340, "#FFB6C1");
    drawFlower(ctx, 350, 320, "#FF69B4");
    drawFlower(ctx, 480, 330, "#FFB6C1");

    // Draw capybara - IMPROVED VERSION
    drawCapybaraImproved(ctx, capyX, capyY);

    // Draw name and level
    ctx.fillStyle = "#2C3E50";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(gameState.player.capyName, capyX, capyY - 120);

    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#555";
    ctx.fillText(`Lv${gameState.player.level}`, capyX, capyY - 100);
  }, [isLoggedIn, gameState, capyX, capyY]);

  // Draw improved capybara - MUCH BETTER DESIGN
  function drawCapybaraImproved(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Corpo principal - mais arredondado e fofo
    ctx.fillStyle = "#A0826D";
    ctx.beginPath();
    ctx.ellipse(x, y + 15, 90, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    // Barriga clara
    ctx.fillStyle = "#C4B5A0";
    ctx.beginPath();
    ctx.ellipse(x, y + 20, 65, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeça grande e fofa
    ctx.fillStyle = "#A0826D";
    ctx.beginPath();
    ctx.arc(x, y - 40, 60, 0, Math.PI * 2);
    ctx.fill();

    // Focinho/Rosto
    ctx.fillStyle = "#C4B5A0";
    ctx.beginPath();
    ctx.ellipse(x, y - 25, 40, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orelhas - MAIORES E MAIS VISÍVEIS
    ctx.fillStyle = "#A0826D";
    ctx.beginPath();
    ctx.arc(x - 40, y - 75, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 40, y - 75, 22, 0, Math.PI * 2);
    ctx.fill();

    // Interior das orelhas
    ctx.fillStyle = "#8B7355";
    ctx.beginPath();
    ctx.arc(x - 40, y - 75, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 40, y - 75, 12, 0, Math.PI * 2);
    ctx.fill();

    // Olhos GRANDES e expressivos
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x - 20, y - 45, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 20, y - 45, 13, 0, Math.PI * 2);
    ctx.fill();

    // Pupilas
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(x - 20, y - 45, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 20, y - 45, 8, 0, Math.PI * 2);
    ctx.fill();

    // Brilho nos olhos - MAIS VISÍVEL
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x - 17, y - 48, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 23, y - 48, 5, 0, Math.PI * 2);
    ctx.fill();

    // Nariz grande e fofo
    ctx.fillStyle = "#8B7355";
    ctx.beginPath();
    ctx.ellipse(x, y - 15, 12, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Narinas
    ctx.fillStyle = "#5C4033";
    ctx.beginPath();
    ctx.arc(x - 6, y - 15, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 6, y - 15, 3, 0, Math.PI * 2);
    ctx.fill();

    // Boca - SORRISO GRANDE E FOFO
    ctx.strokeStyle = "#8B7355";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y - 2, 18, 0, Math.PI, false);
    ctx.stroke();

    // Patas dianteiras
    ctx.fillStyle = "#A0826D";
    ctx.fillRect(x - 60, y + 65, 35, 55);
    ctx.fillRect(x + 25, y + 65, 35, 55);

    // Patas traseiras
    ctx.fillStyle = "#8B7355";
    ctx.fillRect(x - 75, y + 45, 28, 50);
    ctx.fillRect(x + 47, y + 45, 28, 50);

    // Cauda fofa
    ctx.strokeStyle = "#A0826D";
    ctx.lineWidth = 28;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 85, y + 25);
    ctx.quadraticCurveTo(x - 150, y - 10, x - 120, y - 85);
    ctx.stroke();

    // Sombreado para profundidade
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.beginPath();
    ctx.ellipse(x, y + 85, 95, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw cloud
  function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - size / 2, y, size / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y - size / 3, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size / 2, y, size / 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw flower
  function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    // Pétalas
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const px = x + Math.cos(angle) * 12;
      const py = y + Math.sin(angle) * 12;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    // Centro
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Action handlers
  const performAction = (action: string) => {
    setGameState((prev: any) => {
      const updated = { ...prev };
      switch (action) {
        case "feed":
          updated.capybara.hunger = Math.min(100, updated.capybara.hunger + 20);
          updated.player.coins += 10;
          break;
        case "play":
          updated.capybara.happiness = Math.min(100, updated.capybara.happiness + 15);
          updated.capybara.energy = Math.max(0, updated.capybara.energy - 10);
          updated.player.coins += 5;
          break;
        case "work":
          updated.player.coins += 30;
          updated.capybara.energy = Math.max(0, updated.capybara.energy - 20);
          break;
        case "sleep":
          updated.capybara.energy = Math.min(100, updated.capybara.energy + 30);
          break;
        case "bath":
          updated.capybara.hygiene = Math.min(100, updated.capybara.hygiene + 25);
          updated.capybara.thirst = Math.max(0, updated.capybara.thirst - 10);
          break;
        case "pet":
          updated.capybara.happiness = Math.min(100, updated.capybara.happiness + 10);
          break;
      }
      return updated;
    });
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-slate-800 border-slate-700">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🐹</div>
            <h1 className="text-3xl font-bold mb-2">CapyZen</h1>
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

            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}

            <Button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              🎮 Começar Jogo
            </Button>

            <div className="flex gap-2">
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

  // Game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold">🐹 CapyZen</h1>
          </div>
          <Button
            onClick={() => {
              setIsLoggedIn(false);
              setUsername("");
              setCapyName("");
            }}
            variant="destructive"
          >
            🚪 Sair
          </Button>
        </header>

        {/* Main game area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="w-full border-4 border-slate-600 rounded-lg"
              />
            </Card>
          </div>

          {/* Stats */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold mb-6">👤 Jogador</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-400">Nome:</span>
                <p className="font-bold">{gameState.player.username}</p>
              </div>
              <div>
                <span className="text-slate-400">Nível:</span>
                <p className="font-bold text-blue-400">{gameState.player.level}</p>
              </div>
              <div>
                <span className="text-slate-400">Moedas:</span>
                <p className="font-bold text-yellow-400">💰 {gameState.player.coins}</p>
              </div>
              <div>
                <span className="text-slate-400">Idade:</span>
                <p className="font-bold">{gameState.player.days} dias</p>
              </div>
            </div>

            <div className="border-t border-slate-600 my-6"></div>

            <h2 className="text-2xl font-bold mb-6">📊 Capybara</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>🍔 Fome</span>
                  <span>{Math.round(gameState.capybara.hunger)}/100</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${gameState.capybara.hunger}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>❤️ Felicidade</span>
                  <span>{Math.round(gameState.capybara.happiness)}/100</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full"
                    style={{ width: `${gameState.capybara.happiness}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>💩 Coco</span>
                  <span>{Math.round(gameState.capybara.poop)}/100</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-yellow-700 h-2 rounded-full"
                    style={{ width: `${gameState.capybara.poop}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>⚡ Energia</span>
                  <span>{Math.round(gameState.capybara.energy)}/100</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${gameState.capybara.energy}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>💧 Sede</span>
                  <span>{Math.round(gameState.capybara.thirst)}/100</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${gameState.capybara.thirst}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>🧴 Higiene</span>
                  <span>{Math.round(gameState.capybara.hygiene)}/100</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full"
                    style={{ width: `${gameState.capybara.hygiene}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>❤️‍🩹 Saúde</span>
                  <span>{Math.round(gameState.capybara.health)}/100</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${gameState.capybara.health}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Button
            onClick={() => performAction("feed")}
            className="bg-orange-600 hover:bg-orange-700"
          >
            🍖 Alimentar
          </Button>
          <Button
            onClick={() => performAction("play")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            🎾 Brincar
          </Button>
          <Button
            onClick={() => performAction("work")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            💼 Trabalhar
          </Button>
          <Button
            onClick={() => performAction("sleep")}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            😴 Dormir
          </Button>
          <Button
            onClick={() => performAction("bath")}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            🚿 Banho
          </Button>
          <Button
            onClick={() => performAction("pet")}
            className="bg-pink-600 hover:bg-pink-700"
          >
            🤗 Carinho
          </Button>
        </div>

        {/* Save and Navigation */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={saveGame}
            variant="outline"
            className="bg-slate-700 hover:bg-slate-600"
          >
            💾 Salvar Jogo
          </Button>
          <Link href="/loja">
            <Button variant="outline" className="bg-slate-700 hover:bg-slate-600">
              🛍️ Loja
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" className="bg-slate-700 hover:bg-slate-600">
              ⚙️ Admin
            </Button>
          </Link>
        </div>

        {/* Tips */}
        <Card className="bg-slate-800 border-slate-700 p-4 mt-6">
          <h3 className="font-bold mb-2">💡 Dica</h3>
          <p className="text-slate-400 text-sm">
            Use WASD ou Setas para mover a capivara! Cuide bem dela para ganhar mais moedas e experiência.
          </p>
        </Card>
      </div>
    </div>
  );
}
