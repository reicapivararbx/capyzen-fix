import { useRef, useState, useEffect } from "react";

export default function Home() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Carregar estado do localStorage
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem("capyzen_state");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getInitialState();
      }
    }
    return getInitialState();
  });

  function getInitialState() {
    return {
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
      capyColor: "#8B6914",
      totalScore: 0,
      inventory: {
        grama: 0,
        batata: 0,
        hamburger: 0,
        refri: 0,
        feijao: 0,
        hotdog: 0,
      },
    };
  }

  // Achievements
  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem("capyzen_achievements");
    return saved ? JSON.parse(saved) : {};
  });

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem("capyzen_leaderboard");
    return saved ? JSON.parse(saved) : [];
  });

  const [cooldown, setCooldown] = useState(false);
  const [susCooldown, setSusCooldown] = useState(false);
  const [message, setMessage] = useState("Oi! Clique em 'Trabalhar' para ganhar moedas!");
  const [selectedFood, setSelectedFood] = useState(() => {
    const saved = localStorage.getItem("capyzen_selected_food");
    return saved ? Number(saved) : 0;
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [godMode, setGodMode] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [bugText, setBugText] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMinigame, setShowMinigame] = useState(false);
  const [minigameType, setMinigameType] = useState("");
  const [showCustomize, setShowCustomize] = useState(false);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem("capyzen_player_name") || "Anônimo");
  const [minigameCooldown, setMinigameCooldown] = useState(false);

  // Salvar estado no localStorage
  useEffect(() => {
    localStorage.setItem("capyzen_state", JSON.stringify(state));
  }, [state]);

  // Salvar comida selecionada
  useEffect(() => {
    localStorage.setItem("capyzen_selected_food", String(selectedFood));
  }, [selectedFood]);

  // Salvar achievements
  useEffect(() => {
    localStorage.setItem("capyzen_achievements", JSON.stringify(achievements));
  }, [achievements]);

  // Salvar leaderboard
  useEffect(() => {
    localStorage.setItem("capyzen_leaderboard", JSON.stringify(leaderboard));
  }, [leaderboard]);

  // Função para tocar sons
  const playSound = (type: "eat" | "work" | "levelup" | "achievement") => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      switch (type) {
        case "eat":
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.setValueAtTime(600, now + 0.1);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.setValueAtTime(0, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        case "work":
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.setValueAtTime(400, now + 0.05);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.setValueAtTime(0, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        case "levelup":
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.setValueAtTime(1000, now + 0.1);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.setValueAtTime(0, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        case "achievement":
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.setValueAtTime(800, now + 0.1);
          osc.frequency.setValueAtTime(1000, now + 0.2);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.setValueAtTime(0, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
      }
    } catch (e) {
      console.log("Som desabilitado");
    }
  };

  // Sistema de achievements
  const checkAchievements = (newState: any) => {
    const newAchievements = { ...achievements };

    if (newState.level >= 10 && !newAchievements.level10) {
      newAchievements.level10 = true;
      setMessage("🏆 Achievement: Atingiu nível 10!");
      playSound("achievement");
    }

    if (newState.coins >= 1000 && !newAchievements.coins1000) {
      newAchievements.coins1000 = true;
      setMessage("🏆 Achievement: Ganhou 1000 moedas!");
      playSound("achievement");
    }

    if (newState.level >= 50 && !newAchievements.level50) {
      newAchievements.level50 = true;
      setMessage("🏆 Achievement: Atingiu nível 50!");
      playSound("achievement");
    }

    if (newState.coins >= 5000 && !newAchievements.coins5000) {
      newAchievements.coins5000 = true;
      setMessage("🏆 Achievement: Ganhou 5000 moedas!");
      playSound("achievement");
    }

    setAchievements(newAchievements);
  };

  const foods = [
    { name: "🌱 grama", poop: 0, cost: 2 },
    { name: "🥔 batata", poop: 2, cost: 3 },
    { name: "🍔 hamburger", poop: 5, cost: 5 },
    { name: "🥤 refri", poop: 20, cost: 8 },
    { name: "🫘 feijão", poop: 10, cost: 4 },
    { name: "🌭 hotdog", poop: 7, cost: 6 },
  ];

  const capyColors = [
    { name: "Marrom", color: "#8B6914" },
    { name: "Dourado", color: "#FFD700" },
    { name: "Cinza", color: "#808080" },
    { name: "Vermelho", color: "#DC143C" },
    { name: "Verde", color: "#228B22" },
    { name: "Azul", color: "#4169E1" },
  ];

  const gainXP = (v: number) => {
    setState((prev: any) => {
      let newXp = prev.xp + v;
      let newLevel = prev.level;
      while (newXp >= 100) {
        newXp -= 100;
        newLevel++;
        setMessage("⭐ LEVEL UP!");
        playSound("levelup");
      }
      const newState = { ...prev, xp: newXp, level: newLevel, totalScore: prev.totalScore + v };
      checkAchievements(newState);
      return newState;
    });
  };

  const work = () => {
    setState((prev: any) => {
      const earnedCoins = 15;
      setMessage(`💼 trabalhou! +${earnedCoins} moedas`);
      playSound("work");
      gainXP(5);
      const newState = { ...prev, coins: prev.coins + earnedCoins, hunger: Math.max(0, prev.hunger - 10), totalScore: prev.totalScore + 15 };
      checkAchievements(newState);
      return newState;
    });
    setCooldown(true);
    setTimeout(() => setCooldown(false), 10000);
  };

  const feed = () => {
    setState((prev: any) => {
      const foodNames = ["grama", "batata", "hamburger", "refri", "feijao", "hotdog"];
      const foodName = foodNames[selectedFood];
      const inv = prev.inventory || {};
      const foodCount = (inv && inv[foodName]) || 0;
      
      if (!prev.alive || foodCount <= 0) {
        setMessage("🍔 sem comida!");
        return prev;
      }
      const food = foods[selectedFood];
      setMessage(`🍔 comeu ${food.name}! +1 moeda`);
      playSound("eat");
      gainXP(3);
      const newPoop = godMode ? 0 : Math.min(100, prev.poop + food.poop);
      const newHunger = Math.min(100, prev.hunger + 30);
      const newState = { 
        ...prev, 
        poop: newPoop, 
        hunger: newHunger, 
        coins: prev.coins + 1, 
        totalScore: prev.totalScore + 3,
        inventory: {
          ...prev.inventory,
          [foodName]: foodCount - 1,
        },
      };
      checkAchievements(newState);
      return newState;
    });
  };

  const useBathroom = () => {
    setState((prev: any) => {
      if (!prev.alive) return prev;
      if (prev.poop <= 0) {
        setMessage("💩 já limpinho!");
        return prev;
      }
      setMessage("🚽 foi ao banheiro");
      playSound("eat");
      gainXP(5);
      return { ...prev, poop: Math.max(0, prev.poop - 50), totalScore: prev.totalScore + 5 };
    });
    setCooldown(true);
    setTimeout(() => setCooldown(false), 3000);
  };

  const giveAffection = () => {
    setState((prev: any) => {
      if (!prev.alive) return prev;
      setMessage("❤️ capivara feliz!");
      playSound("eat");
      gainXP(8);
      return { ...prev, happy: Math.min(100, prev.happy + 25), totalScore: prev.totalScore + 8 };
    });
    setCooldown(true);
    setTimeout(() => setCooldown(false), 3000);
  };

  const revive = () => {
    // Salvar score no leaderboard
    const newScore = { name: playerName, score: state.totalScore, level: state.level, date: new Date().toLocaleDateString() };
    const newLeaderboard = [...leaderboard, newScore].sort((a: any, b: any) => b.score - a.score).slice(0, 10);
    setLeaderboard(newLeaderboard);

    setState((prev: any) => ({
      ...prev,
      alive: true,
      hunger: 100,
      happy: 100,
      poop: 0,
      totalScore: 0,
      level: 1,
      xp: 0,
      coins: 0,
      food: 0,
    }));
    setMessage("✨ Revivido!");
    playSound("levelup");
  };

  const buyFood = () => {
    const food = foods[selectedFood];
    if (state.coins < food.cost) {
      setMessage(`💰 precisa ${food.cost} moedas!`);
      return;
    }
    const foodNames = ["grama", "batata", "hamburger", "refri", "feijao", "hotdog"];
    const foodName = foodNames[selectedFood];
    setState((prev: any) => ({
      ...prev,
      coins: prev.coins - food.cost,
      inventory: {
        ...prev.inventory,
        [foodName]: (prev.inventory[foodName] || 0) + 1,
      },
    }));
    setMessage(`✅ Comprou ${food.name}`);
    playSound("work");
  };

  const playMinigame = (type: string) => {
    setMinigameType(type);
    setShowMinigame(true);
  };

  const completeMinigame = (reward: number) => {
    if (minigameCooldown) {
      setMessage("⏱️ Aguarde 1 minuto para jogar novamente!");
      return;
    }
    setState((prev: any) => {
      const newState = { ...prev, coins: prev.coins + reward, totalScore: prev.totalScore + reward };
      checkAchievements(newState);
      return newState;
    });
    setMessage(`🎮 Minigame completo! +${reward} moedas`);
    playSound("levelup");
    setShowMinigame(false);
    setMinigameCooldown(true);
    setTimeout(() => setMinigameCooldown(false), 60000);
  };

  const handleAdminClick = () => {
    const pass = window.prompt("Senha:");
    if (pass === null) return;
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

    setState((prev: any) => {
      let updated = { ...prev };

      if (cmd === "+happy") updated.happy = Math.min(100, updated.happy + 20);
      if (cmd === "-happy") updated.happy = Math.max(0, updated.happy - 20);

      if (cmd === "+hunger")
        updated.hunger = Math.min(100, updated.hunger + 20);
      if (cmd === "-hunger")
        updated.hunger = Math.max(0, updated.hunger - 20);

      if (cmd === "+sus") updated.sus = Math.min(100, updated.sus + 20);
      if (cmd === "-sus") {
        setMessage("✅ Sus removido");
        updated.sus = 0;
      }

      if (cmd === "+poop") updated.poop = Math.min(100, updated.poop + 20);
      if (cmd === "-poop") updated.poop = Math.max(0, updated.poop - 20);

      if (cmd === "setCoins")
        updated.coins = Math.max(0, askNum("quantas moedas?"));
      if (cmd === "setLevel")
        updated.level = Math.max(1, askNum("qual level?"));

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
            capyColor: "#8B6914",
            totalScore: 0,
          };
          setMessage("🔄 RESETADO!");
        }
      }

      return updated;
    });
  };

  const displayValue = (value: number, maxValue: number = 100) => {
    if (value >= maxValue) return "∞";
    return value.toString();
  };

  const sendBugReport = async () => {
    if (!bugText.trim()) {
      alert("Por favor, descreva o bug!");
      return;
    }

    try {
      const emailContent = `Bug Report:\n${bugText}\n\nGame State: ${JSON.stringify(state)}\nTimestamp: ${new Date().toISOString()}`;
      
      // Tentar enviar via API backend
      const response = await fetch('/api/send-bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'maio123232222222111@gmail.com',
          subject: 'CapyZen Bug Report',
          message: emailContent,
          playerName: playerName || 'Anônimo'
        })
      });

      if (response.ok) {
        setMessage("✅ Bug reportado com sucesso!");
        setBugText("");
        setShowBugReport(false);
      } else {
        // Fallback para mailto se API falhar
        const mailtoLink = `mailto:maio123232222222111@gmail.com?subject=CapyZen Bug Report&body=${encodeURIComponent(emailContent)}`;
        window.location.href = mailtoLink;
        setMessage("✅ Abrindo cliente de email...");
      }
    } catch (error) {
      console.error(error);
      // Fallback para mailto
      const emailContent = `Bug Report:\n${bugText}\n\nGame State: ${JSON.stringify(state)}\nTimestamp: ${new Date().toISOString()}`;
      const mailtoLink = `mailto:maio123232222222111@gmail.com?subject=CapyZen Bug Report&body=${encodeURIComponent(emailContent)}`;
      window.location.href = mailtoLink;
      setMessage("✅ Abrindo cliente de email...");
    }
  };

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const interval = setInterval(() => {
      setState((prev: any) => {
        if (!prev.alive) return prev;

        let updated = { ...prev };
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

  // Ganho passivo de moedas a cada 5 segundos
  useEffect(() => {
    const passiveInterval = setInterval(() => {
      setState((prev: any) => {
        if (!prev.alive) return prev;
        return { ...prev, coins: prev.coins + 3 };
      });
    }, 5000);

    return () => clearInterval(passiveInterval);
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

      if (state.alive) {
        // Barras de status
        drawBar(10, 10, state.hunger, "#4CAF50", "Fome");
        drawBar(10, 25, state.happy, "#FF9800", "Feliz");
        drawBar(10, 40, state.poop, "#8B4513", "Coco");
        drawBar(10, 55, state.sus, "#FF0000", "Sus");

        // Cor da capivara baseada em saúde
        let bodyColor = state.capyColor;
        if (state.hunger < 30 || state.happy < 30) bodyColor = "#FF6B35";
        if (state.hunger < 10 || state.happy < 10) bodyColor = "#DC143C";

        // Corpo
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(state.x, state.y, 50, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Patas
        ctx.fillStyle = bodyColor;
        ctx.fillRect(state.x - 35, state.y + 35, 15, 20);
        ctx.fillRect(state.x - 10, state.y + 35, 15, 20);
        ctx.fillRect(state.x + 10, state.y + 35, 15, 20);
        ctx.fillRect(state.x + 35, state.y + 35, 15, 20);

        // Cauda
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(state.x + 55, state.y + 10, 12, 0, Math.PI * 2);
        ctx.fill();

        // Orelhas
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(state.x - 35, state.y - 65, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(state.x + 35, state.y - 65, 18, 0, Math.PI * 2);
        ctx.fill();

        // Olhos
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

        // Nariz
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

        // Sorriso
        ctx.strokeStyle = "#654321";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(state.x, state.y - 5, 15, 0, Math.PI);
        ctx.stroke();

        // Info no canvas
        ctx.fillStyle = "#333";
        ctx.font = "bold 14px Arial";
        ctx.fillText(`Lv1 ${state.level} | XP ${state.xp}/100`, 10, 290);
      } else {
        // Capivara morta
        ctx.fillStyle = "#888";
        ctx.font = "bold 40px Arial";
        ctx.fillText("💀", state.x - 20, state.y);
        ctx.fillStyle = "#333";
        ctx.font = "16px Arial";
        ctx.fillText("Morreu!", state.x - 30, state.y + 50);
      }
    };

    draw();
  }, [state]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!state.alive) return;
    setState((prev: any) => {
      let newX = prev.x;
      let newY = prev.y;
      if (e.key === "ArrowUp") newY = Math.max(50, newY - prev.speed);
      if (e.key === "ArrowDown") newY = Math.min(270, newY + prev.speed);
      if (e.key === "ArrowLeft") newX = Math.max(50, newX - prev.speed);
      if (e.key === "ArrowRight") newX = Math.min(250, newX + prev.speed);
      return { ...prev, x: newX, y: newY };
    });
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-4">
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
          <div className="text-center mb-3">
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                localStorage.setItem("capyzen_player_name", e.target.value);
              }}
              className="w-full p-2 border border-gray-300 rounded text-center font-bold mb-2"
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-2 mb-4 text-sm">
            <div>💰 Moedas: <span className="font-bold">{displayValue(state.coins, 999999)}</span></div>
            <div>⭐ Nível: <span className="font-bold">{displayValue(state.level, 999)}</span></div>
            <div>📊 XP: <span className="font-bold">{state.xp >= 99 ? "∞" : state.xp}/100</span></div>
            <div>🍔 Comida Total: <span className="font-bold">{displayValue(state.food, 999)}</span></div>
            <div>💩 Coco: <span className="font-bold">{Math.floor(state.poop)}</span></div>
            <div>📈 Score: <span className="font-bold">{state.totalScore}</span></div>
          </div>

          <div className="bg-yellow-50 p-3 rounded mb-4 text-center font-semibold text-sm">
            💬 {message}
          </div>

          {/* Achievements */}
          {Object.keys(achievements).length > 0 && (
            <div className="bg-purple-50 p-3 rounded mb-4 text-xs">
              <div className="font-bold mb-1">🏆 Achievements:</div>
              {achievements.level10 && <div>✅ Atingiu nível 10</div>}
              {achievements.coins1000 && <div>✅ Ganhou 1000 moedas</div>}
              {achievements.level50 && <div>✅ Atingiu nível 50</div>}
              {achievements.coins5000 && <div>✅ Ganhou 5000 moedas</div>}
            </div>
          )}

          {/* Seletor de Comida */}
          <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
            <label className="block text-sm font-semibold mb-2">🍽️ Selecionar Comida:</label>
            <select
              value={String(selectedFood)}
              onChange={(e) => setSelectedFood(Number(e.target.value))}
              className="w-full p-2 border border-blue-300 rounded bg-white text-sm"
            >
              {foods.map((f, i) => {
                const foodNames = ["grama", "batata", "hamburger", "refri", "feijao", "hotdog"];
                const count = (state.inventory && state.inventory[foodNames[i]]) || 0;
                return (
                  <option key={i} value={i}>
                    {f.name} (💩 {f.poop}) - {count}x
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-2 mb-4">
            <button
              onClick={work}
              disabled={!state.alive || cooldown}
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
              onClick={() => useBathroom()}
              disabled={!state.alive || cooldown}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition"
            >
              🚽 Banheiro
            </button>
            <button
              onClick={() => giveAffection()}
              disabled={!state.alive || cooldown}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition"
            >
              ❤️ Carinho
            </button>
            <button
              onClick={() => setShowShop(!showShop)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold transition"
            >
              🛒 Loja ({state.coins} moedas)
            </button>
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded font-semibold transition"
            >
              🎨 Customizar
            </button>
            <button
              onClick={() => setShowMinigame(true)}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded font-semibold transition"
            >
              🎮 Minigames
            </button>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded font-semibold transition"
            >
              🏅 Ranking
            </button>
            <button
              onClick={handleAdminClick}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded font-semibold transition"
            >
              ⚙️ Painel Admin
            </button>
            <button
              onClick={() => setShowBugReport(!showBugReport)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition"
            >
              🐛 Reportar Bug
            </button>
            {!state.alive && (
              <button
                onClick={revive}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded font-semibold transition"
              >
                ✨ Reviver
              </button>
            )}
          </div>

          {/* Shop */}
          {showShop && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl max-h-96 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">🛒 Loja</h2>
                <div className="space-y-2 mb-4">
                  {foods.map((f, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{f.name} - {f.cost} moedas</span>
                      <button
                        onClick={() => {
                          setSelectedFood(i);
                          buyFood();
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Comprar
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowShop(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {/* Customization */}
          {showCustomize && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
                <h2 className="text-2xl font-bold mb-4">🎨 Customizar Capivara</h2>
                <div className="space-y-2 mb-4">
                  {capyColors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setState((prev: any) => ({ ...prev, capyColor: c.color }))}
                      className="w-full p-2 rounded text-white font-semibold transition"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowCustomize(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {/* Minigames */}
          {showMinigame && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
                <h2 className="text-2xl font-bold mb-4">🎮 Minigames</h2>
                {minigameType === "" ? (
                  <div className="space-y-2 mb-4">
                    <button
                      onClick={() => setMinigameType("memory")}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold"
                    >
                      🧠 Jogo da Memória (+50 moedas)
                    </button>
                    <button
                      onClick={() => setMinigameType("clicker")}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold"
                    >
                      🖱️ Clicker (+30 moedas)
                    </button>
                    <button
                      onClick={() => setMinigameType("quiz")}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded font-semibold"
                    >
                      ❓ Quiz (+40 moedas)
                    </button>
                  </div>
                ) : minigameType === "memory" ? (
                  <div className="text-center">
                    <p className="mb-4">Clique nos botões na sequência correta!</p>
                    <button
                      onClick={() => completeMinigame(50)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold mb-2"
                    >
                      ✅ Completar
                    </button>
                    <button
                      onClick={() => { setMinigameType(""); setShowMinigame(false); }}
                      className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded font-semibold"
                    >
                      ❌ Desistir
                    </button>
                  </div>
                ) : minigameType === "clicker" ? (
                  <div className="text-center">
                    <p className="mb-4">Clique o máximo que conseguir em 10 segundos!</p>
                    <button
                      onClick={() => completeMinigame(30)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold mb-2"
                    >
                      ✅ Completar
                    </button>
                    <button
                      onClick={() => { setMinigameType(""); setShowMinigame(false); }}
                      className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded font-semibold"
                    >
                      ❌ Desistir
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-4">Responda as perguntas corretamente!</p>
                    <button
                      onClick={() => completeMinigame(40)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold mb-2"
                    >
                      ✅ Completar
                    </button>
                    <button
                      onClick={() => { setMinigameType(""); setShowMinigame(false); }}
                      className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded font-semibold"
                    >
                      ❌ Desistir
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {showLeaderboard && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl max-h-96 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">🏅 Ranking</h2>
                {leaderboard.length === 0 ? (
                  <p className="text-center text-gray-500">Nenhum score ainda!</p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry: any, i: number) => (
                      <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-bold">#{i + 1} {entry.name}</span>
                        <span className="text-right">
                          <div>{entry.score} pts</div>
                          <div className="text-xs text-gray-500">Lv {entry.level}</div>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-semibold mt-4"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {/* Admin Panel */}
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
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    +20 Coco
                  </button>
                  <button
                    onClick={() => applyAdminCommand("-poop")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    -20 Coco
                  </button>

                  <button
                    onClick={() => applyAdminCommand("setCoins")}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1 rounded text-xs font-semibold transition"
                  >
                    💰 Setar Moedas (valor)
                  </button>
                  <button
                    onClick={() => applyAdminCommand("setLevel")}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white py-1 rounded text-xs font-semibold transition"
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
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {/* Bug Report */}
          {showBugReport && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
                <h2 className="text-2xl font-bold mb-4">🐛 Reportar Bug</h2>
                <textarea
                  value={bugText}
                  onChange={(e) => setBugText(e.target.value)}
                  placeholder="Descreva o bug aqui..."
                  className="w-full p-3 border border-gray-300 rounded mb-4 h-24"
                />
                <div className="space-y-2">
                  <button
                    onClick={sendBugReport}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold"
                  >
                    📧 Enviar
                  </button>
                  <button
                    onClick={() => setShowBugReport(false)}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded font-semibold"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
