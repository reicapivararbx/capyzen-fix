import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState({
    coins: 0,
    level: 1,
    xp: 0,
    food: 0,
    poop: 0,
    hunger: 100,
    happy: 100,
    sus: 0,
    x: 150,
    y: 150,
    speed: 3,
    alive: true,
  });

  const [cooldown, setCooldown] = useState(false);
  const [susCooldown, setSusCooldown] = useState(false);
  const [message, setMessage] = useState("Oi! Clique em 'Trabalhar' para ganhar moedas!");
  const [selectedFood, setSelectedFood] = useState(0);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [godMode, setGodMode] = useState(false);

  const foods = [
    { name: "🌱 grama", poop: 0, cost: 2 },
    { name: "🥔 batata", poop: 2, cost: 3 },
    { name: "🍔 hamburger", poop: 5, cost: 5 },
    { name: "🥤 refri", poop: 20, cost: 8 },
    { name: "🫘 feijão", poop: 10, cost: 4 },
    { name: "🌭 hotdog", poop: 7, cost: 6 },
  ];

  const gainXP = (v: number) => {
    setState((prev) => {
      let newXp = prev.xp + v;
      let newLevel = prev.level;
      while (newXp >= 100) {
        newXp -= 100;
        newLevel++;
        setMessage("⭐ LEVEL UP!");
      }
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  const work = () => {
    setState((prev) => {
      const earnedCoins = 15; // Valor fixo de 15 moedas
      setMessage(`💼 trabalhou! +${earnedCoins} moedas`);
      gainXP(5);
      return { ...prev, coins: prev.coins + earnedCoins, hunger: Math.max(0, prev.hunger - 10) };
    });
    setCooldown(true);
    setTimeout(() => setCooldown(false), 10000); // 10 segundos de cooldown
  };

  const feed = () => {
    setState((prev) => {
      if (!prev.alive) return prev;
      if (prev.food <= 0) {
        setMessage("🍔 sem comida! Compre na loja");
        return prev;
      }

      const f = foods[selectedFood];
      const newFood = prev.food - 1;
      const newPoop = prev.poop + f.poop;
      const newHunger = Math.min(100, prev.hunger + 20);

      setMessage(`🍔 comeu ${f.name}`);
      gainXP(10);

      return { ...prev, food: newFood, poop: newPoop, hunger: newHunger };
    });
  };

  const useBathroom = () => {
    setState((prev) => {
      if (!prev.alive) return prev;
      if (prev.poop <= 0) {
        setMessage("💩 já limpinho!");
        return prev;
      }
      setMessage("🚽 foi ao banheiro");
      gainXP(5);
      return { ...prev, poop: Math.max(0, prev.poop - 50) };
    });
    setCooldown(true);
    setTimeout(() => setCooldown(false), 3000);
  };

  const giveAffection = () => {
    setState((prev) => {
      if (!prev.alive) return prev;
      setMessage("❤️ capivara feliz!");
      gainXP(8);
      return { ...prev, happy: Math.min(100, prev.happy + 25) };
    });
    setCooldown(true);
    setTimeout(() => setCooldown(false), 3000);
  };

  const revive = () => {
    setState((prev) => {
      setMessage("✨ ressuscitado!");
      return {
        ...prev,
        alive: true,
        hunger: 100,
        happy: 100,
        poop: 0,
        sus: 0,
      };
    });
  };

  const buyFood = (foodIndex: number) => {
    setState((prev) => {
      const f = foods[foodIndex];
      if (prev.coins < f.cost) {
        setMessage(`💸 faltam ${f.cost - prev.coins} moedas`);
        return prev;
      }
      setMessage(`🛒 comprou ${f.name}`);
      gainXP(2);
      return { ...prev, coins: prev.coins - f.cost, food: prev.food + 1 };
    });
  };

  const buyRoblox = () => {
    setState((prev) => {
      if (prev.coins < 50) {
        setMessage("💸 sem moedas (precisa 50)");
        return prev;
      }
      setMessage("🎮 Roblox + felicidade");
      gainXP(15);
      return {
        ...prev,
        coins: prev.coins - 50,
        happy: Math.min(100, prev.happy + 30),
      };
    });
  };

  const buyMinecraft = () => {
    setState((prev) => {
      if (prev.coins < 100) {
        setMessage("💸 sem moedas (precisa 100)");
        return prev;
      }
      setMessage("⛏️ Minecraft boost");
      gainXP(20);
      return {
        ...prev,
        coins: prev.coins - 100,
        happy: Math.min(100, prev.happy + 50),
        hunger: Math.min(100, prev.hunger + 10),
      };
    });
  };

  const buyBrawl = () => {
    setState((prev) => {
      if (prev.coins < 500) {
        setMessage("💸 sem moedas (precisa 500)");
        return prev;
      }
      setMessage("🔥 modo deus 20s");
      gainXP(30);
      setTimeout(() => setMessage("⛔ acabou"), 20000);
      return { ...prev, coins: prev.coins - 500, happy: 100, hunger: 100 };
    });
  };

  const iAmNotSus = () => {
    if (susCooldown) return;
    setMessage("I AM NOT SUS 😭");
    setSusCooldown(true);
    setState((prev) => ({ ...prev, sus: Math.min(100, prev.sus + 50) }));
    setTimeout(() => setSusCooldown(false), 10000);
  };

  const useCooldown = (action: () => void) => {
    if (cooldown) return;
    action();
    // Cooldown removido de aqui pois está na função work()
  };

  // Ganho passivo de moedas a cada 5 segundos
  useEffect(() => {
    const passiveInterval = setInterval(() => {
      setState((prev) => {
        if (!prev.alive) return prev;
        return { ...prev, coins: prev.coins + 3 };
      });
    }, 5000); // A cada 5 segundos

    return () => clearInterval(passiveInterval);
  }, []);

  // Função para exibir ∞ quando o valor é infinito
  const displayValue = (value: number, maxValue: number = 100) => {
    if (value >= maxValue) return "∞";
    return value.toString();
  };

  const handleAdminClick = () => {
    const pass = window.prompt("Senha:");
    if (pass === null) return; // Usuário cancelou
    if (pass === "capivarassaomuitofofas404") {
      setShowAdminPanel(true);
    } else {
      window.alert("❌ Senha incorreta!");
    }
  };

  const applyAdminCommand = (cmd: string) => {
    if (!cmd) return;

    const askNum = (t: string) => {
      let n = Number(prompt(t));
      return isNaN(n) ? 0 : Math.max(0, n);
    };

    setState((prev) => {
      let updated = { ...prev };

      if (cmd === "+happy") updated.happy = Math.min(100, updated.happy + 20);
      if (cmd === "-happy") updated.happy = Math.max(0, updated.happy - 20);

      if (cmd === "+hunger")
        updated.hunger = Math.min(100, updated.hunger + 20);
      if (cmd === "-hunger")
        updated.hunger = Math.max(0, updated.hunger - 20);

      if (cmd === "+sus") updated.sus = Math.min(100, updated.sus + 20);
      if (cmd === "-sus") updated.sus = Math.max(0, updated.sus - 20);

      if (cmd === "addCoins") updated.coins += askNum("quantos?");
      if (cmd === "removeCoins")
        updated.coins = Math.max(0, updated.coins - askNum("quantos?"));
      if (cmd === "setCoins") updated.coins = askNum("valor");

      if (cmd === "+poop") updated.poop = Math.min(100, updated.poop + 20);
      if (cmd === "-poop") updated.poop = Math.max(0, updated.poop - 20);

      if (cmd === "addLevel") updated.level++;
      if (cmd === "removeLevel")
        updated.level = Math.max(1, updated.level - askNum("quantos?"));
      if (cmd === "setLevel")
        updated.level = Math.max(1, askNum("valor"));

      if (cmd === "∞coins") {
        updated.coins = 999999;
        setMessage("💰 Moedas = ∞");
      }
      if (cmd === "∞happy") {
        updated.happy = 100;
        setMessage("😊 Felicidade = ∞");
      }
      if (cmd === "∞hunger") {
        updated.hunger = 100;
        setMessage("🍽️ Fome = ∞");
      }
      if (cmd === "∞level") {
        updated.level = 999;
        setMessage("⭐ Level = ∞");
      }
      if (cmd === "∞xp") {
        updated.xp = 99;
        setMessage("📊 XP = ∞");
      }
      if (cmd === "∞food") {
        updated.food = 999;
        setMessage("🍔 Comida = ∞");
      }

      if (cmd === "-∞coins") {
        updated.coins = 0;
        setMessage("💰 Moedas removidas");
      }
      if (cmd === "-∞happy") {
        updated.happy = 50;
        setMessage("😊 Felicidade removida");
      }
      if (cmd === "-∞hunger") {
        updated.hunger = 50;
        setMessage("🍽️ Fome removida");
      }
      if (cmd === "-∞level") {
        updated.level = 1;
        setMessage("⭐ Level removido");
      }
      if (cmd === "-∞xp") {
        updated.xp = 0;
        setMessage("📊 XP removido");
      }
      if (cmd === "-∞food") {
        updated.food = 0;
        setMessage("🍔 Comida removida");
      }

      if (cmd === "-∞all") {
        updated.coins = 0;
        updated.happy = 50;
        updated.hunger = 50;
        updated.level = 1;
        updated.xp = 0;
        updated.food = 0;
        setMessage("🔄 Todos os infinitos removidos");
      }

      if (cmd === "godmode") {
        updated.coins = 999999;
        updated.happy = 100;
        updated.hunger = 100;
        updated.level = 999;
        updated.xp = 99;
        updated.food = 999;
        updated.sus = 0;
        updated.poop = 0;
        setGodMode(true);
        setMessage("👻 GOD MODE ATIVADO!");
      }

      if (cmd === "normal") {
        updated.coins = 0;
        updated.happy = 50;
        updated.hunger = 50;
        updated.level = 1;
        updated.xp = 0;
        updated.food = 0;
        updated.sus = 0;
        updated.poop = 1;
        setGodMode(false);
        setMessage("😄 Modo Normal ativado");
      }

      if (cmd === "RESET") {
        const c = prompt("Escreva reset para confirmar");
        if (c === "reset") {
          updated = {
            coins: 0,
            level: 1,
            xp: 0,
            food: 0,
            poop: 0,
            hunger: 100,
            happy: 100,
            sus: 0,
            x: 150,
            y: 150,
            speed: 3,
            alive: true,
          };
          setMessage("🔄 resetado");
        }
      }

      return updated;
    });
  };

  // Movimento com setas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setState((prev) => {
        if (e.key === "ArrowUp")
          return { ...prev, y: Math.max(50, prev.y - prev.speed) };
        if (e.key === "ArrowDown")
          return { ...prev, y: Math.min(250, prev.y + prev.speed) };
        if (e.key === "ArrowLeft")
          return { ...prev, x: Math.max(70, prev.x - prev.speed) };
        if (e.key === "ArrowRight")
          return { ...prev, x: Math.min(230, prev.x + prev.speed) };
        return prev;
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev.alive) return prev;

        let updated = { ...prev };
        // Não aumenta cocô em god mode
        if (!godMode) {
          updated.poop += 0.05;
        }
        updated.hunger = Math.max(0, updated.hunger - 0.05);
        updated.happy = Math.max(0, updated.happy - 0.03);
        updated.sus = Math.max(0, updated.sus - 0.02);

        if (updated.poop >= 100) {
          updated.alive = false;
          setMessage("💀 Morreu por não ter cagado...");
        }

        if (updated.hunger <= 0 || updated.happy <= 0) {
          updated.alive = false;
          setMessage("💀 Morreu de fome e tristeza...");
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [godMode]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawBar = (
      x: number,
      y: number,
      value: number,
      color: string,
      label: string
    ) => {
      const w = 120;
      const h = 10;
      ctx.fillStyle = "#ddd";
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, Math.max(0, (value / 100) * w), h);
      ctx.fillStyle = "#333";
      ctx.font = "9px Arial";
      ctx.fillText(label, x + w + 4, y + h - 1);
    };

    const draw = () => {
      ctx.clearRect(0, 0, 300, 320);

      if (state.alive) {
        // Cor baseada no estado
        let bodyColor = "#a47148";
        if (state.poop > 70 || state.hunger < 20 || state.happy < 20) {
          bodyColor = "#c0392b";
        } else if (state.poop > 40 || state.hunger < 50 || state.happy < 50) {
          bodyColor = "#e67e22";
        }

        // Corpo principal (mais arredondado)
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(state.x, state.y, 75, 55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cabeça (círculo separado)
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(state.x, state.y - 35, 45, 0, Math.PI * 2);
        ctx.fill();

        // Orelhas
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(state.x - 35, state.y - 65, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(state.x + 35, state.y - 65, 18, 0, Math.PI * 2);
        ctx.fill();

        // Olhos (maiores e mais expressivos)
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(state.x - 20, state.y - 40, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(state.x + 20, state.y - 40, 7, 0, Math.PI * 2);
        ctx.fill();

        // Brilho nos olhos
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(state.x - 18, state.y - 42, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(state.x + 22, state.y - 42, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Nariz (maior e mais detalhado)
        ctx.fillStyle = "#8B4513";
        ctx.beginPath();
        ctx.ellipse(state.x, state.y - 15, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Narinas
        ctx.fillStyle = "#654321";
        ctx.beginPath();
        ctx.arc(state.x - 5, state.y - 18, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(state.x + 5, state.y - 18, 2, 0, Math.PI * 2);
        ctx.fill();

        // Boca (sorriso)
        ctx.strokeStyle = "#654321";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(state.x, state.y - 5, 15, 0, Math.PI, false);
        ctx.stroke();

        // Patas dianteiras
        ctx.fillStyle = bodyColor;
        ctx.fillRect(state.x - 40, state.y + 50, 20, 25);
        ctx.fillRect(state.x + 20, state.y + 50, 20, 25);

        // Patas traseiras
        ctx.fillStyle = bodyColor;
        ctx.fillRect(state.x - 60, state.y + 35, 18, 20);
        ctx.fillRect(state.x + 42, state.y + 35, 18, 20);

        // Cauda
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(state.x + 70, state.y + 20, 20, 15, 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Capivara morta (X nos olhos)
        ctx.fillStyle = "#888888";
        ctx.beginPath();
        ctx.ellipse(state.x, state.y, 75, 55, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(state.x, state.y - 35, 45, 0, Math.PI * 2);
        ctx.fill();

        // X nos olhos
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(state.x - 30, state.y - 50);
        ctx.lineTo(state.x - 10, state.y - 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(state.x - 10, state.y - 50);
        ctx.lineTo(state.x - 30, state.y - 30);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(state.x + 10, state.y - 50);
        ctx.lineTo(state.x + 30, state.y - 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(state.x + 30, state.y - 50);
        ctx.lineTo(state.x + 10, state.y - 30);
        ctx.stroke();
      }

      // Barras de status
      drawBar(10, 10, state.hunger, "#27ae60", "🍔");
      drawBar(10, 28, state.happy, "#2980b9", "😊");
      drawBar(10, 46, 100 - state.poop, "#8e44ad", "💩");
      drawBar(10, 64, state.sus, "#e74c3c", "😱");
      
      // Info do level
      ctx.fillStyle = "#333";
      ctx.font = "bold 12px Arial";
      ctx.fillText(`Lvl ${state.level} | XP ${state.xp}/100`, 10, 290);
    };

    draw();
  }, [state]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="flex gap-6 flex-wrap justify-center">
        <div className="bg-blue-100 rounded-lg p-4 shadow-lg">
          <canvas
            ref={canvasRef}
            width={300}
            height={320}
            className="bg-blue-50 rounded border-2 border-blue-300"
          />
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg w-80">
          <div className="space-y-2 mb-4 text-sm">
            <div>💰 Moedas: <span className="font-bold">{displayValue(state.coins, 999999)}</span></div>
            <div>⭐ Nível: <span className="font-bold">{displayValue(state.level, 999)}</span></div>
            <div>📊 XP: <span className="font-bold">{state.xp >= 99 ? "∞" : state.xp}/100</span></div>
            <div>🍔 Comida Total: <span className="font-bold">{displayValue(state.food, 999)}</span></div>
            <div>💩 Coco: <span className="font-bold">{Math.floor(state.poop)}</span></div>
          </div>

          <div className="bg-yellow-50 p-3 rounded mb-4 text-center font-semibold text-sm">
            💬 {message}
          </div>

          {/* Seletor de Comida */}
          <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
            <label className="block text-sm font-semibold mb-2">🍽️ Selecionar Comida:</label>
            <select
              value={selectedFood}
              onChange={(e) => setSelectedFood(Number(e.target.value))}
              className="w-full p-2 border border-blue-300 rounded bg-white text-sm"
            >
              {foods.map((f, i) => (
                <option key={i} value={i}>
                  {f.name} (💩 {f.poop})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 mb-4">
            <button
              onClick={() => useCooldown(work)}
              disabled={!state.alive}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition"
            >
              💼 Trabalhar
            </button>
            <button
              onClick={feed}
              disabled={!state.alive}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition"
            >
              🍔 Comer
            </button>
            <button
              onClick={() => useCooldown(useBathroom)}
              disabled={!state.alive}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition"
            >
              🚽 Banheiro
            </button>
            <button
              onClick={() => useCooldown(giveAffection)}
              disabled={!state.alive}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition"
            >
              ❤️ Carinho
            </button>

            {!state.alive && (
              <button
                onClick={() => useCooldown(revive)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition animate-pulse"
              >
                ✨ Reviver
              </button>
            )}
          </div>

          <button
            onClick={() => setShowShop(!showShop)}
            disabled={!state.alive}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition mb-4"
          >
            🛒 Loja ({state.coins} moedas)
          </button>

          {showShop && (
            <div className="bg-blue-50 p-4 rounded mb-4 border-2 border-blue-300 space-y-2 max-h-48 overflow-y-auto">
              <h3 className="font-bold text-center mb-3">🍖 COMIDAS</h3>
              {foods.map((f, i) => (
                <button
                  key={i}
                  onClick={() => useCooldown(() => buyFood(i))}
                  disabled={!state.alive}
                  className="w-full bg-orange-400 hover:bg-orange-500 disabled:bg-gray-400 text-white py-1 rounded text-xs font-semibold transition"
                >
                  {f.name} ({f.cost} moedas)
                </button>
              ))}
              
              <div className="border-t pt-2 mt-2">
                <h3 className="font-bold text-center mb-2">🎮 JOGOS</h3>
                <button
                  onClick={() => useCooldown(buyRoblox)}
                  disabled={!state.alive}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white py-1 rounded text-xs font-semibold transition mb-1"
                >
                  Roblox 🎮 (50 moedas)
                </button>
                <button
                  onClick={() => useCooldown(buyMinecraft)}
                  disabled={!state.alive}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-1 rounded text-xs font-semibold transition mb-1"
                >
                  Minecraft ⛏️ (100 moedas)
                </button>
                <button
                  onClick={() => useCooldown(buyBrawl)}
                  disabled={!state.alive}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-1 rounded text-xs font-semibold transition"
                >
                  Brawl Stars 🔥 (500 moedas)
                </button>
              </div>
            </div>
          )}

          <button
            onClick={iAmNotSus}
            disabled={!state.alive}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition mb-4"
          >
            I AM NOT SUS
          </button>

          <div className="border-t pt-4">
            <button
              onClick={handleAdminClick}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded font-semibold transition"
            >
              ⚙️ Painel Admin
            </button>
          </div>

          {/* Admin Panel Modal */}
          {showAdminPanel && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">⚙️ Painel Admin</h2>
                  <button
                    onClick={() => setShowAdminPanel(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 mb-6">
                  <button
                    onClick={() => applyAdminCommand("+happy")}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    +20 Felicidade
                  </button>
                  <button
                    onClick={() => applyAdminCommand("-happy")}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    -20 Felicidade
                  </button>

                  <button
                    onClick={() => applyAdminCommand("+hunger")}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    +20 Fome
                  </button>
                  <button
                    onClick={() => applyAdminCommand("-hunger")}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    -20 Fome
                  </button>

                  <button
                    onClick={() => applyAdminCommand("+sus")}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    +20 Sus
                  </button>
                  <button
                    onClick={() => applyAdminCommand("-sus")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    -20 Sus
                  </button>

                  <button
                    onClick={() => applyAdminCommand("+poop")}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    +20 Coco
                  </button>
                  <button
                    onClick={() => applyAdminCommand("-poop")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    -20 Coco
                  </button>

                  <button
                    onClick={() => applyAdminCommand("addCoins")}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    ➕ Adicionar Moedas
                  </button>
                  <button
                    onClick={() => applyAdminCommand("removeCoins")}
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    ➖ Remover Moedas
                  </button>
                  <button
                    onClick={() => applyAdminCommand("setCoins")}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    💰 Setar Moedas (valor)
                  </button>

                  <button
                    onClick={() => applyAdminCommand("addLevel")}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    ⬆️ +1 Nível
                  </button>
                  <button
                    onClick={() => applyAdminCommand("removeLevel")}
                    className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    ⬇️ -1 Nível
                  </button>
                  <button
                    onClick={() => applyAdminCommand("setLevel")}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    ⭐ Setar Level (valor)
                  </button>

                  <button
                    onClick={() => applyAdminCommand("∞coins")}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    💰 Moedas = ∞
                  </button>
                  <button
                    onClick={() => applyAdminCommand("∞happy")}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    😊 Felicidade = ∞
                  </button>
                  <button
                    onClick={() => applyAdminCommand("∞hunger")}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    🍽️ Fome = ∞
                  </button>
                  <button
                    onClick={() => applyAdminCommand("∞level")}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    ⭐ Level = ∞
                  </button>
                  <button
                    onClick={() => applyAdminCommand("∞xp")}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    📊 XP = ∞
                  </button>
                  <button
                    onClick={() => applyAdminCommand("∞food")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    🍔 Comida = ∞
                  </button>

                  <button
                    onClick={() => applyAdminCommand("-∞coins")}
                    className="w-full bg-purple-400 hover:bg-purple-500 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    ❌ Remover ∞ Moedas
                  </button>
                  <button
                    onClick={() => applyAdminCommand("-∞happy")}
                    className="w-full bg-pink-400 hover:bg-pink-500 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    ❌ Remover ∞ Felicidade
                  </button>
                  <button
                    onClick={() => applyAdminCommand("-∞hunger")}
                    className="w-full bg-orange-400 hover:bg-orange-500 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    ❌ Remover ∞ Fome
                  </button>
                  <button
                    onClick={() => applyAdminCommand("-∞level")}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    ❌ Remover ∞ Level
                  </button>
                  <button
                    onClick={() => applyAdminCommand("-∞xp")}
                    className="w-full bg-cyan-400 hover:bg-cyan-500 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    ❌ Remover ∞ XP
                  </button>
                  <button
                    onClick={() => applyAdminCommand("-∞food")}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    ❌ Remover ∞ Comida
                  </button>

                  <button
                    onClick={() => applyAdminCommand("-∞all")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    🔄 Remover ∞ Todos
                  </button>

                  <button
                    onClick={() => applyAdminCommand("godmode")}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    👻 GOD MODE
                  </button>
                  <button
                    onClick={() => applyAdminCommand("normal")}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1 rounded text-xs font-semibold transition mb-1"
                  >
                    😄 Modo Normal
                  </button>

                  <button
                    onClick={() => applyAdminCommand("RESET")}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    🔄 RESET
                  </button>
                </div>

                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="w-full bg-gray-400 hover:bg-gray-500 text-white py-2 rounded font-semibold transition"
                >
                  ✕ Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
