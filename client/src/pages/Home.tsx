import { useRef, useState, useEffect } from "react";

export default function Home() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // User system
  const [currentUser, setCurrentUser] = useState<{ username: string; password: string } | null>(() => {
    const saved = localStorage.getItem("capyzen_current_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createError, setCreateError] = useState("");

  // Carregar estado do localStorage
  const [state, setState] = useState(() => {
    const userKey = currentUser ? `capyzen_state_${currentUser.username}` : "capyzen_state";
    const saved = localStorage.getItem(userKey);
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
      capySize: 1,
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
    const userKey = currentUser ? `capyzen_achievements_${currentUser.username}` : "capyzen_achievements";
    const saved = localStorage.getItem(userKey);
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
    const userKey = currentUser ? `capyzen_selected_food_${currentUser.username}` : "capyzen_selected_food";
    const saved = localStorage.getItem(userKey);
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
  const [playerName, setPlayerName] = useState(() => {
    const userKey = currentUser ? `capyzen_player_name_${currentUser.username}` : "capyzen_player_name";
    return localStorage.getItem(userKey) || "Anônimo";
  });
  const [minigameCooldown, setMinigameCooldown] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPasswordPrompt, setShowAdminPasswordPrompt] = useState(false);

  // Salvar estado no localStorage
  useEffect(() => {
    const userKey = currentUser ? `capyzen_state_${currentUser.username}` : "capyzen_state";
    localStorage.setItem(userKey, JSON.stringify(state));
  }, [state, currentUser]);

  // Salvar comida selecionada
  useEffect(() => {
    const userKey = currentUser ? `capyzen_selected_food_${currentUser.username}` : "capyzen_selected_food";
    localStorage.setItem(userKey, String(selectedFood));
  }, [selectedFood, currentUser]);

  // Salvar achievements
  useEffect(() => {
    const userKey = currentUser ? `capyzen_achievements_${currentUser.username}` : "capyzen_achievements";
    localStorage.setItem(userKey, JSON.stringify(achievements));
  }, [achievements, currentUser]);

  // Salvar leaderboard
  useEffect(() => {
    localStorage.setItem("capyzen_leaderboard", JSON.stringify(leaderboard));
  }, [leaderboard]);

  // Salvar player name
  useEffect(() => {
    const userKey = currentUser ? `capyzen_player_name_${currentUser.username}` : "capyzen_player_name";
    localStorage.setItem(userKey, playerName);
  }, [playerName, currentUser]);

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
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        case "work":
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        case "levelup":
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1000, now + 0.3);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        case "achievement":
          osc.frequency.setValueAtTime(1000, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
      }
    } catch (e) {
      // Silenciosamente falhar se o áudio não funcionar
    }
  };

  // Verificar achievements
  const checkAchievements = (newState: any) => {
    const newAchievements = { ...achievements };
    if (newState.level >= 10 && !achievements.level10) {
      newAchievements.level10 = true;
      setMessage("🏆 Achievement: Atingiu nível 10!");
      playSound("achievement");
    }
    if (newState.coins >= 1000 && !achievements.coins1000) {
      newAchievements.coins1000 = true;
      setMessage("🏆 Achievement: Ganhou 1000 moedas!");
      playSound("achievement");
    }
    if (newState.level >= 50 && !achievements.level50) {
      newAchievements.level50 = true;
      setMessage("🏆 Achievement: Atingiu nível 50!");
      playSound("achievement");
    }
    if (newState.coins >= 5000 && !achievements.coins5000) {
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

  const games = [
    { name: "🎮 Brawl Stars", minLevel: 1, cost: 10, reward: 50 },
    { name: "🎮 Roblox", minLevel: 3, cost: 15, reward: 75 },
    { name: "🎮 Gacha Life", minLevel: 5, cost: 20, reward: 100 },
    { name: "🎮 Minecraft", minLevel: 2, cost: 12, reward: 60 },
    { name: "🎮 Fortnite", minLevel: 4, cost: 18, reward: 85 },
    { name: "🎮 Among Us", minLevel: 1, cost: 8, reward: 40 },
    { name: "🎮 Clash Royale", minLevel: 6, cost: 25, reward: 120 },
    { name: "🎮 Candy Crush", minLevel: 2, cost: 10, reward: 55 },
  ];

  // Funções de login/registro
  const handleLogin = () => {
    if (loginUsername === "root" && loginPassword === "root") {
      setCurrentUser({ username: loginUsername, password: loginPassword });
      localStorage.setItem("capyzen_current_user", JSON.stringify({ username: loginUsername, password: loginPassword }));
      setLoginError("");
      setLoginUsername("");
      setLoginPassword("");
    } else {
      // Verificar se usuário existe
      const users = JSON.parse(localStorage.getItem("capyzen_users") || "[]");
      const user = users.find((u: any) => u.username === loginUsername && u.password === loginPassword);
      if (user) {
        setCurrentUser({ username: loginUsername, password: loginPassword });
        localStorage.setItem("capyzen_current_user", JSON.stringify({ username: loginUsername, password: loginPassword }));
        setLoginError("");
        setLoginUsername("");
        setLoginPassword("");
      } else {
        setLoginError("Usuario ou senha incorretos!");
      }
    }
  };

  const handleCreateUser = () => {
    if (!createUsername.trim()) {
      setCreateError("Nome de usuário não pode estar vazio!");
      return;
    }
    if (!createPassword.trim()) {
      setCreateError("Senha não pode estar vazia!");
      return;
    }
    if (createPassword.length < 3) {
      setCreateError("Senha deve ter pelo menos 3 caracteres!");
      return;
    }

    // Verificar se usuário já existe
    const users = JSON.parse(localStorage.getItem("capyzen_users") || "[]");
    if (users.find((u: any) => u.username === createUsername)) {
      setCreateError("Usuário já existe!");
      return;
    }

    // Criar novo usuário
    users.push({ username: createUsername, password: createPassword });
    localStorage.setItem("capyzen_users", JSON.stringify(users));

    setCurrentUser({ username: createUsername, password: createPassword });
    localStorage.setItem("capyzen_current_user", JSON.stringify({ username: createUsername, password: createPassword }));
    setCreateError("");
    setCreateUsername("");
    setCreatePassword("");
    setIsCreatingUser(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("capyzen_current_user");
    setLoginUsername("");
    setLoginPassword("");
    setLoginError("");
  };

  const handleAdminClick = () => {
    setShowAdminPasswordPrompt(true);
  };

  const handleAdminPasswordSubmit = () => {
    if (adminPassword === "capivarassaomuitofofas404") {
      setShowAdminPanel(true);
      setShowAdminPasswordPrompt(false);
      setAdminPassword("");
    } else {
      alert("Senha do admin incorreta!");
      setAdminPassword("");
    }
  };

  const gainXP = (v: number) => {
    setState((prev: any) => {
      let newXp = prev.xp + v;
      let newLevel = prev.level;
      let newSize = prev.capySize;
      while (newXp >= 100) {
        newXp -= 100;
        newLevel++;
        newSize += 0.15;
        setMessage("⭐ LEVEL UP!");
        playSound("levelup");
      }
      const newState = { ...prev, xp: newXp, level: newLevel, capySize: newSize, totalScore: prev.totalScore + v };
      checkAchievements(newState);
      return newState;
    });
  };

  const completeMinigame = (reward: number) => {
    setState((prev: any) => {
      const newState = { ...prev, coins: prev.coins + reward, totalScore: prev.totalScore + reward };
      setMessage(`🎮 Minigame completo! +${reward} moedas`);
      checkAchievements(newState);
      return newState;
    });
    setMinigameCooldown(true);
    setTimeout(() => setMinigameCooldown(false), 3000);
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
      setMessage("💩 Usou o banheiro! -20 coco");
      playSound("work");
      gainXP(2);
      const newState = { ...prev, poop: Math.max(0, prev.poop - 20), totalScore: prev.totalScore + 2 };
      checkAchievements(newState);
      return newState;
    });
    setCooldown(true);
    setTimeout(() => setCooldown(false), 5000);
  };

  const giveAffection = () => {
    setState((prev: any) => {
      if (!prev.alive) return prev;
      setMessage("❤️ Carinho dado! +10 felicidade");
      playSound("eat");
      gainXP(2);
      const newState = { ...prev, happy: Math.min(100, prev.happy + 10), totalScore: prev.totalScore + 5 };
      checkAchievements(newState);
      return newState;
    });
    setCooldown(true);
    setTimeout(() => setCooldown(false), 5000);
  };

  const buyFood = () => {
    const food = foods[selectedFood];
    if (state.coins < food.cost) {
      setMessage(`💰 Precisa de ${food.cost} moedas!`);
      return;
    }

    setState((prev: any) => {
      const foodNames = ["grama", "batata", "hamburger", "refri", "feijao", "hotdog"];
      const foodName = foodNames[selectedFood];
      const newState = {
        ...prev,
        coins: prev.coins - food.cost,
        inventory: {
          ...prev.inventory,
          [foodName]: (prev.inventory[foodName] || 0) + 1,
        },
      };
      setMessage(`🛒 Comprou ${food.name}!`);
      return newState;
    });
  };

  const playGame = (gameIndex: number) => {
    const game = games[gameIndex];
    if (state.level < game.minLevel) {
      setMessage(`🎮 Precisa estar no nível ${game.minLevel} para jogar!`);
      return;
    }
    if (state.coins < game.cost) {
      setMessage(`💰 Precisa de ${game.cost} moedas!`);
      return;
    }
    setState((prev: any) => ({
      ...prev,
      coins: prev.coins - game.cost,
    }));
    completeMinigame(game.reward);
  };

  const applyAdminCommand = (cmd: string) => {
    setState((prev: any) => {
      let updated = { ...prev };

      if (cmd === "+coins") updated.coins = Math.min(999999, updated.coins + 100);
      if (cmd === "-coins") updated.coins = Math.max(0, updated.coins - 100);

      if (cmd === "+happy") updated.happy = Math.min(100, updated.happy + 20);
      if (cmd === "-happy") updated.happy = Math.max(0, updated.happy - 20);

      if (cmd === "+hunger") updated.hunger = Math.min(100, updated.hunger + 20);
      if (cmd === "-hunger") updated.hunger = Math.max(0, updated.hunger - 20);

      if (cmd === "+sus") updated.sus = Math.min(100, updated.sus + 20);
      if (cmd === "-sus") updated.sus = Math.max(0, updated.sus - 20);

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

      if (cmd === "godMode") {
        setGodMode(true);
        setMessage("👻 GOD MODE ativado");
      }

      if (cmd === "normalMode") {
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
            capySize: 1,
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
          setMessage("🔄 RESETADO!");
        }
      }

      return updated;
    });
  };

  const askNum = (msg: string) => {
    const ans = prompt(msg);
    return ans ? parseInt(ans) : 0;
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
    const mailtoLink = `mailto:maio123232222222111@gmail.com?subject=Bug Report CapyZen&body=${encodeURIComponent(bugText)}`;
    window.location.href = mailtoLink;
    setBugText("");
    setShowBugReport(false);
  };

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
      ctx.fillRect(x, y, (w * value) / 100, h);
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = "#333";
      ctx.font = "10px Arial";
      ctx.fillText(label, x + w + 5, y + 8);
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

        const size = state.capySize || 1;

        // Corpo
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(state.x, state.y, 50 * size, 45 * size, 0, 0, Math.PI * 2);
        ctx.fill();

        // Patas
        ctx.fillStyle = bodyColor;
        ctx.fillRect(state.x - 35 * size, state.y + 35 * size, 15 * size, 20 * size);
        ctx.fillRect(state.x - 10 * size, state.y + 35 * size, 15 * size, 20 * size);
        ctx.fillRect(state.x + 10 * size, state.y + 35 * size, 15 * size, 20 * size);
        ctx.fillRect(state.x + 35 * size, state.y + 35 * size, 15 * size, 20 * size);

        // Cauda
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(state.x + 55 * size, state.y + 10 * size, 12 * size, 0, Math.PI * 2);
        ctx.fill();

        // Orelhas
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(state.x - 35 * size, state.y - 40 * size, 12 * size, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(state.x + 35 * size, state.y - 40 * size, 12 * size, 0, Math.PI * 2);
        ctx.fill();

        // Olhos
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(state.x - 22 * size, state.y - 42 * size, 2.5 * size, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(state.x + 22 * size, state.y - 42 * size, 2.5 * size, 0, Math.PI * 2);
        ctx.fill();

        // Nariz
        ctx.fillStyle = "#8B4513";
        ctx.beginPath();
        ctx.ellipse(state.x, state.y - 15 * size, 12 * size, 10 * size, 0, 0, Math.PI * 2);
        ctx.fill();

        // Narinas
        ctx.fillStyle = "#654321";
        ctx.beginPath();
        ctx.arc(state.x - 5 * size, state.y - 18 * size, 2 * size, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(state.x + 5 * size, state.y - 18 * size, 2 * size, 0, Math.PI * 2);
        ctx.fill();

        // Sorriso
        ctx.strokeStyle = "#654321";
        ctx.lineWidth = 2 * size;
        ctx.beginPath();
        ctx.arc(state.x, state.y - 5 * size, 15 * size, 0, Math.PI);
        ctx.stroke();

        // Info no canvas
        ctx.fillStyle = "#333";
        ctx.font = "bold 14px Arial";
        ctx.fillText(`Lv ${state.level} | XP ${state.xp}/100 | Tamanho: ${(state.capySize * 100).toFixed(0)}%`, 10, 290);
      } else {
        // Capivara morta
        ctx.fillStyle = "#888";
        ctx.font = "bold 40px Arial";
        ctx.fillText("💀", 130, 150);
        ctx.font = "14px Arial";
        ctx.fillStyle = "#333";
        ctx.fillText("Clique em 'Reviver' para trazer de volta", 50, 200);
      }
    };

    const gameLoop = setInterval(draw, 1000 / 30);

    // Lógica de fome/felicidade
    const lifeLoop = setInterval(() => {
      setState((prev: any) => {
        if (!prev.alive) return prev;
        let newHunger = Math.max(0, prev.hunger - 2);
        let newHappy = Math.max(0, prev.happy - 1);
        let newAlive = prev.alive;

        if (newHunger <= 0 || newHappy <= 0) {
          newAlive = false;
          setMessage("💀 Capivara morreu!");
        }

        return {
          ...prev,
          hunger: newHunger,
          happy: newHappy,
          alive: newAlive,
        };
      });
    }, 3000);

    return () => {
      clearInterval(gameLoop);
      clearInterval(lifeLoop);
    };
  }, [godMode]);

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
  }, [state.alive]);

  // Ganho passivo de moedas
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.alive) {
        setState((prev: any) => ({
          ...prev,
          coins: prev.coins + 3,
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [state.alive]);

  // Se não está logado, mostrar tela de login
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2 text-blue-600">Capyzen</h1>
          <p className="text-center text-gray-600 mb-6">Bem-vindo ao jogo da capivara!</p>

          {!isCreatingUser ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Usuário:</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Senha:</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              {loginError && <p className="text-red-600 text-sm mb-4">{loginError}</p>}
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold mb-2"
              >
                Entrar
              </button>
              <button
                onClick={() => setIsCreatingUser(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold"
              >
                Criar Usuário
              </button>
              <p className="text-center text-xs text-gray-600 mt-4">Usuário de teste: root / Senha: root</p>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Novo Usuário:</label>
                <input
                  type="text"
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  placeholder="Digite o novo usuário"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Senha:</label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              {createError && <p className="text-red-600 text-sm mb-4">{createError}</p>}
              <button
                onClick={handleCreateUser}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold mb-2"
              >
                Criar
              </button>
              <button
                onClick={() => {
                  setIsCreatingUser(false);
                  setCreateError("");
                  setCreateUsername("");
                  setCreatePassword("");
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-semibold"
              >
                Voltar
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

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
            <div className="text-sm text-gray-600 mb-2">👤 {currentUser?.username}</div>
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
              }}
              className="w-full p-2 border border-gray-300 rounded text-center font-bold mb-2"
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-2 mb-4 text-sm">
            <div>💰 Moedas: <span className="font-bold">{displayValue(state.coins, 999999)}</span></div>
            <div>⭐ Nível: <span className="font-bold">{displayValue(state.level, 999)}</span></div>
            <div>📊 XP: <span className="font-bold">{state.xp >= 99 ? "∞" : state.xp}/100</span></div>
            <div>📏 Tamanho: <span className="font-bold">{(state.capySize * 100).toFixed(0)}%</span></div>
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
              onClick={() => setShowMinigame(!showMinigame)}
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
            <button
              onClick={() => {
                if (!state.alive) {
                  setState(getInitialState());
                  setMessage("✨ Capivara revivida!");
                }
              }}
              disabled={state.alive}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition"
            >
              ✨ Reviver
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </div>

      {/* Loja */}
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
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Minigames */}
      {showMinigame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">🎮 Jogos</h2>
            <div className="space-y-2 mb-4">
              {games.map((g, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{g.name}</div>
                      <div className="text-xs text-gray-600">Nível: {g.minLevel} | Custo: {g.cost} moedas | Prêmio: {g.reward} moedas</div>
                      {state.level < g.minLevel && (
                        <div className="text-xs text-red-600">Bloqueado até nível {g.minLevel}</div>
                      )}
                    </div>
                    <button
                      onClick={() => playGame(i)}
                      disabled={state.level < g.minLevel || state.coins < g.cost}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
                    >
                      Jogar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowMinigame(false)}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Customizar */}
      {showCustomize && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">🎨 Customizar Capivara</h2>
            <div className="space-y-2">
              {[
                { name: "Marrom", color: "#8B6914" },
                { name: "Dourado", color: "#FFD700" },
                { name: "Cinza", color: "#808080" },
                { name: "Vermelho", color: "#DC143C" },
                { name: "Verde", color: "#228B22" },
                { name: "Azul", color: "#4169E1" },
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => setState((prev: any) => ({ ...prev, capyColor: c.color }))}
                  className="w-full p-2 rounded font-semibold text-white transition"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCustomize(false)}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded mt-4"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">🏅 Ranking</h2>
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <p className="text-gray-600">Sem jogadores no ranking ainda</p>
              ) : (
                leaderboard.map((entry: any, i: number) => (
                  <div key={i} className="p-2 bg-gray-50 rounded flex justify-between">
                    <span>#{i + 1} {entry.name}</span>
                    <span className="font-bold">Score: {entry.score}</span>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowLeaderboard(false)}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded mt-4"
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
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Descreva o bug..."
              rows={4}
            />
            <div className="space-y-2">
              <button
                onClick={sendBugReport}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded"
              >
                Enviar
              </button>
              <button
                onClick={() => setShowBugReport(false)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Password Prompt */}
      {showAdminPasswordPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">🔐 Painel Admin</h2>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Digite a senha do admin"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="space-y-2">
              <button
                onClick={handleAdminPasswordSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  setShowAdminPasswordPrompt(false);
                  setAdminPassword("");
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">⚙️ Painel Admin</h2>
            <div className="space-y-2 mb-4">
              <button
                onClick={() => applyAdminCommand("+coins")}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
              >
                +100 Moedas
              </button>
              <button
                onClick={() => applyAdminCommand("-coins")}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
              >
                -100 Moedas
              </button>
              <button
                onClick={() => applyAdminCommand("+happy")}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded"
              >
                +20 Felicidade
              </button>
              <button
                onClick={() => applyAdminCommand("-happy")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
              >
                -20 Felicidade
              </button>
              <button
                onClick={() => applyAdminCommand("+hunger")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
              >
                +20 Fome
              </button>
              <button
                onClick={() => applyAdminCommand("-hunger")}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded"
              >
                -20 Fome
              </button>
              <button
                onClick={() => applyAdminCommand("+sus")}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded"
              >
                +20 Sus
              </button>
              <button
                onClick={() => applyAdminCommand("-sus")}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded"
              >
                -20 Sus
              </button>
              <button
                onClick={() => applyAdminCommand("+poop")}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded"
              >
                +20 Coco
              </button>
              <button
                onClick={() => applyAdminCommand("-poop")}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white py-2 rounded"
              >
                -20 Coco
              </button>
              <button
                onClick={() => applyAdminCommand("setCoins")}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded"
              >
                💰 Setar Moedas (valor)
              </button>
              <button
                onClick={() => applyAdminCommand("setLevel")}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded"
              >
                ⭐ Setar Level (valor)
              </button>
              <button
                onClick={() => applyAdminCommand("godMode")}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded"
              >
                👻 GOD MODE
              </button>
              <button
                onClick={() => applyAdminCommand("normalMode")}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
              >
                😄 Modo Normal
              </button>
              <button
                onClick={() => applyAdminCommand("RESET")}
                className="w-full bg-red-700 hover:bg-red-800 text-white py-2 rounded"
              >
                🔄 RESET TOTAL
              </button>
            </div>
            <button
              onClick={() => setShowAdminPanel(false)}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
