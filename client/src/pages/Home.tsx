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
    x: 150,
    y: 150,
    speed: 3,
    alive: true,
  });

  const [cooldown, setCooldown] = useState(false);
  const [susCooldown, setSusCooldown] = useState(false);
  const [message, setMessage] = useState("Oi!");

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
      if (newXp >= 100) {
        newXp = 0;
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

      const f = foods[Math.floor(Math.random() * foods.length)];
      const newFood = prev.food - 1;
      const newPoop = prev.poop + f.poop;
      const newHunger = Math.min(100, prev.hunger + 20);

      setMessage(`🍔 comeu ${f.name}`);
      gainXP(10);

      return { ...prev, food: newFood, poop: newPoop, hunger: newHunger };
    });
  };

  const buyFood = () => {
    setState((prev) => {
      if (prev.coins < 5) {
        setMessage("💸 sem moedas (precisa de 5)");
        return prev;
      }
      setMessage("🛒 comida comprada");
      return { ...prev, coins: prev.coins - 5, food: prev.food + 1 };
    });
  };

  const buyRoblox = () => {
    setState((prev) => {
      if (prev.level < 2) {
        setMessage("🔒 lvl baixo");
        return prev;
      }
      if (prev.coins < 50) {
        setMessage("💸 sem moedas");
        return prev;
      }
      setMessage("🎮 Roblox + felicidade");
      return {
        ...prev,
        coins: prev.coins - 50,
        happy: Math.min(100, prev.happy + 30),
      };
    });
  };

  const buyMinecraft = () => {
    setState((prev) => {
      if (prev.level < 3) {
        setMessage("🔒 lvl baixo");
        return prev;
      }
      if (prev.coins < 100) {
        setMessage("💸 sem moedas");
        return prev;
      }
      setMessage("⛏️ Minecraft boost");
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
      if (prev.level < 5) {
        setMessage("🔒 lvl baixo");
        return prev;
      }
      if (prev.coins < 500) {
        setMessage("💸 sem moedas");
        return prev;
      }
      setMessage("🔥 modo deus 20s");
      setTimeout(() => setMessage("⛔ acabou"), 20000);
      return { ...prev, coins: prev.coins - 500, happy: 100, hunger: 100 };
    });
  };

  const iAmNotSus = () => {
    if (susCooldown) return;
    setMessage("I AM NOT SUS 😭");
    setSusCooldown(true);
    setTimeout(() => setSusCooldown(false), 10000);
  };

  const useCooldown = (action: () => void) => {
    if (cooldown) return;
    action();
    setCooldown(true);
    setTimeout(() => setCooldown(false), 5000);
  };

  const openAdmin = () => {
    const pass = prompt("Senha:");
    if (pass !== "capivarassaomuitofofas404") {
      alert("❌ negado");
      return;
    }

    const cmd = prompt(
      `FELICIDADE:
+happy / -happy

FOME:
+hunger / -hunger

SUS:
+sus / -sus

MOEDAS:
addCoins / removeCoins / setCoins

POOP:
+poop / -poop

LEVEL:
addLevel / removeLevel / setLevel

RESET`
    );

    if (cmd === null) return;

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

      if (cmd === "+sus") setMessage("I AM NOT SUS 😭");
      if (cmd === "-sus") setMessage("Sus removido ✅");

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
      ctx.clearRect(0, 0, 300, 300);

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
            height={300}
            className="bg-blue-50 rounded border-2 border-blue-300"
          />
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg w-64">
          <div className="space-y-2 mb-4 text-sm">
            <div>💰 Moedas: <span className="font-bold">{state.coins}</span></div>
            <div>⭐ Nível: <span className="font-bold">{state.level}</span></div>
            <div>🍔 Comida: <span className="font-bold">{state.food}</span></div>
            <div>💩 Coco: <span className="font-bold">{Math.floor(state.poop)}</span></div>
          </div>

          <div className="bg-yellow-50 p-3 rounded mb-4 text-center font-semibold text-sm">
            💬 {message}
          </div>

          <div className="space-y-2 mb-4">
            <button
              onClick={() => useCooldown(feed)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold transition"
            >
              🍔 Comer
            </button>
            <button
              onClick={() => useCooldown(buyFood)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold transition"
            >
              🛒 Loja
            </button>
          </div>

          <div className="mb-4">
            <div className="font-semibold text-sm mb-2">🎮 Jogos:</div>
            <div className="space-y-2">
              <button
                onClick={() => useCooldown(buyRoblox)}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded font-semibold transition text-sm"
              >
                Roblox 🎮
              </button>
              <button
                onClick={() => useCooldown(buyMinecraft)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded font-semibold transition text-sm"
              >
                Minecraft ⛏️
              </button>
              <button
                onClick={() => useCooldown(buyBrawl)}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded font-semibold transition text-sm"
              >
                Brawl Stars 🔥
              </button>
            </div>
          </div>

          <button
            onClick={iAmNotSus}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded font-semibold transition mb-4"
          >
            I AM NOT SUS
          </button>

          <div className="border-t pt-4">
            <div className="font-semibold text-sm mb-2">🔐 ADMIN:</div>
            <button
              onClick={openAdmin}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded font-semibold transition"
            >
              ⚙️ Painel Admin
            </button>
          </div>

          <div className="mt-4 bg-gray-50 p-3 rounded text-xs">
            <div className="font-semibold mb-2">🐛 Achou um bug?</div>
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="bugToggle" />
              <span>Ativar envio</span>
            </label>
            <div className="text-gray-600">📧 Conta:</div>
            <input
              value="acontasecundaria222@gmail.com"
              readOnly
              className="w-full text-xs p-1 border rounded bg-white mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
