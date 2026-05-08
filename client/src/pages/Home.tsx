import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState({
    coins: 0,
    level: 1,
    xp: 0,
    food: 1,
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
  const [message, setMessage] = useState("Oi!");
  const [selectedFood, setSelectedFood] = useState(0);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showShop, setShowShop] = useState(false);

  const foods = [
    { name: "🌱 grama", poop: 0 },
    { name: "🥔 batata", poop: 2 },
    { name: "🍔 hamburger", poop: 5 },
    { name: "🥤 refri", poop: 20 },
    { name: "🫘 feijão", poop: 10 },
    { name: "🌭 hotdog", poop: 7 },
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

  const feed = () => {
    setState((prev) => {
      if (!prev.alive) return prev;
      if (prev.food <= 0) {
        setMessage("VAI COMPRAR COMIDA VAGABUNDO 💀🛒");
        return prev;
      }

      const f = foods[selectedFood];
      const newFood = prev.food - 1;
      const newPoop = prev.poop + f.poop;
      const newHunger = Math.min(100, prev.hunger + 20);
      const newCoins = prev.coins + 1;

      setMessage(`🍔 comeu ${f.name}`);
      gainXP(10);

      return { ...prev, food: newFood, poop: newPoop, hunger: newHunger, coins: newCoins };
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
  };

  const giveAffection = () => {
    setState((prev) => {
      if (!prev.alive) return prev;
      setMessage("❤️ capivara feliz!");
      gainXP(8);
      return { ...prev, happy: Math.min(100, prev.happy + 25) };
    });
  };

  const buyFood = () => {
    setState((prev) => {
      if (prev.coins < 5) {
        setMessage("💸 sem moedas (precisa de 5)");
        return prev;
      }
      setMessage("🛒 comida comprada");
      gainXP(3);
      return { ...prev, coins: prev.coins - 5, food: prev.food + 1 };
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
    setCooldown(true);
    setTimeout(() => setCooldown(false), 5000);
  };

  const handleAdminClick = () => {
    const pass = prompt("Senha:");
    if (pass === "capivarassaomuitofofas404") {
      setShowAdminPanel(true);
    } else {
      alert("❌ negado");
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

      if (cmd === "RESET") {
        const c = prompt("Escreva reset para confirmar");
        if (c === "reset") {
          updated = {
            coins: 0,
            level: 1,
            xp: 0,
            food: 1,
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
        updated.poop += 0.05;
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
  }, []);

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

      // Cor baseada no estado
      if (!state.alive) {
        ctx.fillStyle = "#888888";
      } else if (
        state.poop > 70 ||
        state.hunger < 20 ||
        state.happy < 20
      ) {
        ctx.fillStyle = "#c0392b";
      } else if (
        state.poop > 40 ||
        state.hunger < 50 ||
        state.happy < 50
      ) {
        ctx.fillStyle = "#e67e22";
      } else {
        ctx.fillStyle = "#a47148";
      }

      ctx.beginPath();
      ctx.ellipse(state.x, state.y, 70, 50, 0, 0, Math.PI * 2);
      ctx.fill();

      // Olhos
      ctx.fillStyle = state.alive ? "#000" : "#555";
      ctx.beginPath();
      ctx.arc(state.x + 20, state.y - 10, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(state.x - 20, state.y - 10, 5, 0, Math.PI * 2);
      ctx.fill();

      // Nariz
      ctx.fillStyle = "#5a3010";
      ctx.beginPath();
      ctx.arc(state.x, state.y, 8, 0, Math.PI * 2);
      ctx.fill();

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
            <div>💰 Moedas: <span className="font-bold">{state.coins}</span></div>
            <div>⭐ Nível: <span className="font-bold">{state.level}</span></div>
            <div>📊 XP: <span className="font-bold">{state.xp}/100</span></div>
            <div>🍔 Comida: <span className="font-bold">{state.food}</span></div>
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
              onClick={() => useCooldown(feed)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold transition"
            >
              🍔 Comer
            </button>
            <button
              onClick={() => useCooldown(useBathroom)}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded font-semibold transition"
            >
              🚽 Banheiro
            </button>
            <button
              onClick={() => useCooldown(giveAffection)}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded font-semibold transition"
            >
              ❤️ Carinho
            </button>
          </div>

          <button
            onClick={() => setShowShop(!showShop)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold transition mb-4"
          >
            🛒 Loja ({state.coins} moedas)
          </button>

          {showShop && (
            <div className="bg-blue-50 p-4 rounded mb-4 border-2 border-blue-300 space-y-2">
              <h3 className="font-bold text-center mb-3">🛍️ LOJA</h3>
              <button
                onClick={() => useCooldown(buyFood)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-1 rounded text-sm font-semibold transition"
              >
                🍖 Comida (5 moedas)
              </button>
              <button
                onClick={() => useCooldown(buyRoblox)}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-1 rounded text-sm font-semibold transition"
              >
                Roblox 🎮 (50 moedas)
              </button>
              <button
                onClick={() => useCooldown(buyMinecraft)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-1 rounded text-sm font-semibold transition"
              >
                Minecraft ⛏️ (100 moedas)
              </button>
              <button
                onClick={() => useCooldown(buyBrawl)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-1 rounded text-sm font-semibold transition"
              >
                Brawl Stars 🔥 (500 moedas)
              </button>
            </div>
          )}

          <button
            onClick={iAmNotSus}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded font-semibold transition mb-4"
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
                <h2 className="text-2xl font-bold mb-4">⚙️ Painel Admin</h2>

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
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    ➖ Remover Moedas
                  </button>

                  <button
                    onClick={() => applyAdminCommand("addLevel")}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    ⬆️ +1 Nível
                  </button>
                  <button
                    onClick={() => applyAdminCommand("removeLevel")}
                    className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    ⬇️ -1 Nível
                  </button>

                  <button
                    onClick={() => applyAdminCommand("RESET")}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    🔄 Reset Jogo
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
