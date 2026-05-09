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
  const [showSaveMenu, setShowSaveMenu] = useState(false);

  // Carregar estado do localStorage
  const [state, setState] = useState(() => {
    try {
      const userKey = currentUser ? `capyzen_state_${currentUser.username}` : "capyzen_state";
      const saved = localStorage.getItem(userKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed || getInitialState();
        } catch {
          return getInitialState();
        }
      }
      return getInitialState();
    } catch {
      return getInitialState();
    }
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
        grama: 0, batata: 0, hamburger: 0, refri: 0, feijao: 0, hotdog: 0,
        pizza: 0, sushi: 0, tacos: 0, sorvete: 0, bolo: 0, chocolate: 0,
        maçã: 0, banana: 0, melancia: 0, morango: 0, uva: 0, cenoura: 0,
        brócolis: 0, espinafre: 0, tomate: 0, queijo: 0, iogurte: 0, leite: 0,
        pão: 0, arroz: 0,
      },
    };
  }

  // Achievements
  const [achievements, setAchievements] = useState(() => {
    try {
      const userKey = currentUser ? `capyzen_achievements_${currentUser.username}` : "capyzen_achievements";
      const saved = localStorage.getItem(userKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState(() => {
    try {
      const saved = localStorage.getItem("capyzen_leaderboard");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cooldown, setCooldown] = useState(false);
  const [susCooldown, setSusCooldown] = useState(false);
  const [message, setMessage] = useState("✨ Bem-vindo ao CapyZen! Clique em 'Trabalhar' para ganhar moedas!");
  const [selectedFood, setSelectedFood] = useState(() => {
    try {
      const userKey = currentUser ? `capyzen_selected_food_${currentUser.username}` : "capyzen_selected_food";
      const saved = localStorage.getItem(userKey);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
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
    try {
      const userKey = currentUser ? `capyzen_player_name_${currentUser.username}` : "capyzen_player_name";
      return localStorage.getItem(userKey) || "Anônimo";
    } catch {
      return "Anônimo";
    }
  });
  const [minigameCooldown, setMinigameCooldown] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPasswordPrompt, setShowAdminPasswordPrompt] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

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
    
    // Achievements de Level
    if (newState.level >= 5 && !achievements.level5) { newAchievements.level5 = true; setMessage("🏆 Atingiu nível 5!"); playSound("achievement"); }
    if (newState.level >= 10 && !achievements.level10) { newAchievements.level10 = true; setMessage("🏆 Atingiu nível 10!"); playSound("achievement"); }
    if (newState.level >= 15 && !achievements.level15) { newAchievements.level15 = true; setMessage("🏆 Atingiu nível 15!"); playSound("achievement"); }
    if (newState.level >= 20 && !achievements.level20) { newAchievements.level20 = true; setMessage("🏆 Atingiu nível 20!"); playSound("achievement"); }
    if (newState.level >= 30 && !achievements.level30) { newAchievements.level30 = true; setMessage("🏆 Atingiu nível 30!"); playSound("achievement"); }
    if (newState.level >= 50 && !achievements.level50) { newAchievements.level50 = true; setMessage("🏆 Atingiu nível 50!"); playSound("achievement"); }
    if (newState.level >= 100 && !achievements.level100) { newAchievements.level100 = true; setMessage("🏆 LENDÁRIO! Atingiu nível 100!"); playSound("achievement"); }

    // Achievements de Moedas
    if (newState.coins >= 100 && !achievements.coins100) { newAchievements.coins100 = true; setMessage("🏆 Ganhou 100 moedas!"); playSound("achievement"); }
    if (newState.coins >= 500 && !achievements.coins500) { newAchievements.coins500 = true; setMessage("🏆 Ganhou 500 moedas!"); playSound("achievement"); }
    if (newState.coins >= 1000 && !achievements.coins1000) { newAchievements.coins1000 = true; setMessage("🏆 Ganhou 1000 moedas!"); playSound("achievement"); }
    if (newState.coins >= 5000 && !achievements.coins5000) { newAchievements.coins5000 = true; setMessage("🏆 Ganhou 5000 moedas!"); playSound("achievement"); }
    if (newState.coins >= 10000 && !achievements.coins10000) { newAchievements.coins10000 = true; setMessage("🏆 Ganhou 10000 moedas!"); playSound("achievement"); }
    if (newState.coins >= 50000 && !achievements.coins50000) { newAchievements.coins50000 = true; setMessage("🏆 MILIONÁRIO! Ganhou 50000 moedas!"); playSound("achievement"); }

    // Achievements de Score
    if (newState.totalScore >= 100 && !achievements.score100) { newAchievements.score100 = true; setMessage("🏆 Score 100!"); playSound("achievement"); }
    if (newState.totalScore >= 500 && !achievements.score500) { newAchievements.score500 = true; setMessage("🏆 Score 500!"); playSound("achievement"); }
    if (newState.totalScore >= 1000 && !achievements.score1000) { newAchievements.score1000 = true; setMessage("🏆 Score 1000!"); playSound("achievement"); }
    if (newState.totalScore >= 5000 && !achievements.score5000) { newAchievements.score5000 = true; setMessage("🏆 Score 5000!"); playSound("achievement"); }

    // Achievements de Tamanho
    if (newState.capySize >= 1.5 && !achievements.size1_5) { newAchievements.size1_5 = true; setMessage("🏆 Capivara cresceu 50%!"); playSound("achievement"); }
    if (newState.capySize >= 2 && !achievements.size2) { newAchievements.size2 = true; setMessage("🏆 Capivara ficou GIGANTE!"); playSound("achievement"); }
    if (newState.capySize >= 3 && !achievements.size3) { newAchievements.size3 = true; setMessage("🏆 Capivara é um MONSTRO!"); playSound("achievement"); }

    // Achievements de Fome/Felicidade
    if (newState.hunger === 100 && !achievements.fullHunger) { newAchievements.fullHunger = true; setMessage("🏆 Capivara SUPER satisfeita!"); playSound("achievement"); }
    if (newState.happy === 100 && !achievements.fullHappy) { newAchievements.fullHappy = true; setMessage("🏆 Capivara MUITO feliz!"); playSound("achievement"); }
    if (newState.poop === 0 && !achievements.noPoop) { newAchievements.noPoop = true; setMessage("🏆 Capivara limpinha!"); playSound("achievement"); }

    // Achievements de Comida
    if (newState.inventory.grama >= 10 && !achievements.grama10) { newAchievements.grama10 = true; setMessage("🏆 Colecionador de grama!"); playSound("achievement"); }
    if (newState.inventory.pizza >= 5 && !achievements.pizza5) { newAchievements.pizza5 = true; setMessage("🏆 Amante de pizza!"); playSound("achievement"); }
    if (newState.inventory.sushi >= 5 && !achievements.sushi5) { newAchievements.sushi5 = true; setMessage("🏆 Gourmet!"); playSound("achievement"); }
    if (newState.inventory.sorvete >= 10 && !achievements.sorvete10) { newAchievements.sorvete10 = true; setMessage("🏆 Viciado em sorvete!"); playSound("achievement"); }

    // Achievements Especiais
    if (newState.sus >= 80 && !achievements.susSuspicious) { newAchievements.susSuspicious = true; setMessage("🏆 MUITO SUS!"); playSound("achievement"); }
    if (newState.hunger < 5 && !achievements.almostDead) { newAchievements.almostDead = true; setMessage("🏆 Quase morreu de fome!"); playSound("achievement"); }
    if (!newState.alive && !achievements.died) { newAchievements.died = true; setMessage("🏆 Primeira morte!"); playSound("achievement"); }

    setAchievements(newAchievements);
  };

  const foods = [
    { name: "🌱 Grama", poop: 0, hunger: 10, cost: 2 },
    { name: "🥔 Batata", poop: 2, hunger: 15, cost: 3 },
    { name: "🍔 Hamburger", poop: 5, hunger: 25, cost: 5 },
    { name: "🥤 Refri", poop: 20, hunger: 5, cost: 8 },
    { name: "🫘 Feijão", poop: 10, hunger: 20, cost: 4 },
    { name: "🌭 Hotdog", poop: 7, hunger: 22, cost: 6 },
    { name: "🍕 Pizza", poop: 12, hunger: 30, cost: 10 },
    { name: "🍣 Sushi", poop: 3, hunger: 18, cost: 15 },
    { name: "🌮 Tacos", poop: 8, hunger: 24, cost: 7 },
    { name: "🍦 Sorvete", poop: 15, hunger: 12, cost: 9 },
    { name: "🎂 Bolo", poop: 18, hunger: 20, cost: 12 },
    { name: "🍫 Chocolate", poop: 14, hunger: 8, cost: 8 },
    { name: "🍎 Maçã", poop: 1, hunger: 8, cost: 2 },
    { name: "🍌 Banana", poop: 2, hunger: 12, cost: 2 },
    { name: "🍉 Melancia", poop: 3, hunger: 15, cost: 4 },
    { name: "🍓 Morango", poop: 1, hunger: 10, cost: 5 },
    { name: "🍇 Uva", poop: 2, hunger: 10, cost: 3 },
    { name: "🥕 Cenoura", poop: 1, hunger: 12, cost: 2 },
    { name: "🥦 Brócolis", poop: 4, hunger: 14, cost: 3 },
    { name: "🥬 Espinafre", poop: 3, hunger: 13, cost: 2 },
    { name: "🍅 Tomate", poop: 2, hunger: 11, cost: 2 },
    { name: "🧀 Queijo", poop: 6, hunger: 16, cost: 5 },
    { name: "🥛 Iogurte", poop: 4, hunger: 14, cost: 4 },
    { name: "🥛 Leite", poop: 3, hunger: 13, cost: 3 },
    { name: "🍞 Pão", poop: 5, hunger: 18, cost: 3 },
    { name: "🍚 Arroz", poop: 8, hunger: 20, cost: 4 },
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
      const users = JSON.parse(localStorage.getItem("capyzen_users") || "[]");
      const user = users.find((u: any) => u.username === loginUsername && u.password === loginPassword);
      if (user) {
        setCurrentUser({ username: loginUsername, password: loginPassword });
        localStorage.setItem("capyzen_current_user", JSON.stringify({ username: loginUsername, password: loginPassword }));
        setLoginError("");
        setLoginUsername("");
        setLoginPassword("");
      } else {
        setLoginError("❌ Usuario ou senha incorretos!");
      }
    }
  };

  const handleCreateUser = () => {
    if (!createUsername.trim()) {
      setCreateError("❌ Nome de usuário não pode estar vazio!");
      return;
    }
    if (!createPassword.trim()) {
      setCreateError("❌ Senha não pode estar vazia!");
      return;
    }
    if (createPassword.length < 3) {
      setCreateError("❌ Senha deve ter pelo menos 3 caracteres!");
      return;
    }

    const users = JSON.parse(localStorage.getItem("capyzen_users") || "[]");
    if (users.find((u: any) => u.username === createUsername)) {
      setCreateError("❌ Usuário já existe!");
      return;
    }

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

  const handleDeleteProgress = () => {
    if (confirm("⚠️ Tem certeza que quer DELETAR todo o progresso? Isso não pode ser desfeito!")) {
      const userKey = currentUser ? `capyzen_state_${currentUser.username}` : "capyzen_state";
      localStorage.removeItem(userKey);
      setState(getInitialState());
      setMessage("🗑️ Progresso deletado!");
      setShowSaveMenu(false);
    }
  };

  const handleContinueProgress = () => {
    setShowSaveMenu(false);
    setMessage("✨ Progresso carregado!");
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
      alert("❌ Senha do admin incorreta!");
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
      const foodNames = ["grama", "batata", "hamburger", "refri", "feijao", "hotdog", "pizza", "sushi", "tacos", "sorvete", "bolo", "chocolate", "maçã", "banana", "melancia", "morango", "uva", "cenoura", "brócolis", "espinafre", "tomate", "queijo", "iogurte", "leite", "pão", "arroz"];
      const foodName = foodNames[selectedFood];
      const inv = prev.inventory || {};
      const foodCount = (inv && inv[foodName]) || 0;

      if (!prev.alive || foodCount <= 0) {
        setMessage("🍔 sem comida!");
        return prev;
      }
      const food = foods[selectedFood];
      setMessage(`🍔 comeu ${food.name}! +${food.poop} 💩, +${food.hunger} 🍽️`);
      playSound("eat");
      gainXP(3);
      const newPoop = godMode ? 0 : Math.min(100, prev.poop + food.poop);
      const newHunger = Math.min(100, prev.hunger + food.hunger);
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
      setMessage("💩 Deu uma cagada remunerada! -20 coco");
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
      const foodNames = ["grama", "batata", "hamburger", "refri", "feijao", "hotdog", "pizza", "sushi", "tacos", "sorvete", "bolo", "chocolate", "maçã", "banana", "melancia", "morango", "uva", "cenoura", "brócolis", "espinafre", "tomate", "queijo", "iogurte", "leite", "pão", "arroz"];
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
          updated = getInitialState();
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

  const displayValue = (value: number | null | undefined, maxValue: number = 100) => {
    if (value == null) return "0";
    if (value >= maxValue) return "∞";
    return String(value);
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
        let newHunger = Math.max(0, prev.hunger - 0.5);
        let newHappy = Math.max(0, prev.happy - 0.25);
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
    }, 500);

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
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 p-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md border-4 border-pink-300">
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">🐹</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">Capyzen</h1>
            <p className="text-gray-600 font-semibold">Bem-vindo ao jogo da capivara fofinha!</p>
          </div>

          {!isCreatingUser ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-purple-600">👤 Usuário:</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="w-full p-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-purple-500 bg-pink-50"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-purple-600">🔐 Senha:</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full p-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-purple-500 bg-pink-50"
                />
              </div>
              {loginError && <p className="text-red-600 text-sm mb-4 font-bold">{loginError}</p>}
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 rounded-xl font-bold mb-2 transition transform hover:scale-105 shadow-lg"
              >
                ✨ Entrar
              </button>
              <button
                onClick={() => setIsCreatingUser(true)}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                🎉 Criar Usuário
              </button>
              <p className="text-center text-xs text-gray-600 mt-4 font-semibold">👉 Teste: root / root</p>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-purple-600">👤 Novo Usuário:</label>
                <input
                  type="text"
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  placeholder="Digite o novo usuário"
                  className="w-full p-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-purple-500 bg-pink-50"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-purple-600">🔐 Senha:</label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="w-full p-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-purple-500 bg-pink-50"
                />
              </div>
              {createError && <p className="text-red-600 text-sm mb-4 font-bold">{createError}</p>}
              <button
                onClick={handleCreateUser}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white py-3 rounded-xl font-bold mb-2 transition transform hover:scale-105 shadow-lg"
              >
                ✅ Criar
              </button>
              <button
                onClick={() => {
                  setIsCreatingUser(false);
                  setCreateError("");
                  setCreateUsername("");
                  setCreatePassword("");
                }}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                ⬅️ Voltar
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4">
      <div className="flex gap-6 flex-wrap justify-center">
        {/* Canvas */}
        <div className="bg-gradient-to-br from-pink-200 to-blue-200 rounded-3xl p-4 shadow-2xl border-4 border-pink-300">
          <canvas
            ref={canvasRef}
            width={300}
            height={320}
            className="bg-gradient-to-br from-blue-50 to-pink-50 rounded-2xl border-4 border-purple-300"
          />
        </div>

        {/* Painel Principal */}
        <div className="bg-gradient-to-br from-white to-pink-50 rounded-3xl p-6 shadow-2xl w-96 border-4 border-purple-300">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🐹</div>
            <div className="text-sm text-gray-600 mb-2 font-bold">👤 {currentUser?.username}</div>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-2 border-2 border-purple-300 rounded-xl text-center font-bold mb-2 bg-purple-50 focus:outline-none focus:border-pink-500"
              placeholder="Seu nome"
            />
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-2xl mb-4 border-2 border-pink-300">
            <div className="grid grid-cols-2 gap-2 text-sm font-bold">
              <div>💰 Moedas: <span className="text-pink-600">{displayValue(state.coins, 999999)}</span></div>
              <div>⭐ Nível: <span className="text-purple-600">{displayValue(state.level, 999)}</span></div>
              <div>📊 XP: <span className="text-blue-600">{state.xp >= 99 ? "∞" : state.xp}/100</span></div>
              <div>📏 Tamanho: <span className="text-green-600">{(state.capySize * 100).toFixed(0)}%</span></div>
              <div>💩 Coco: <span className="text-amber-600">{Math.floor(state.poop)}</span></div>
              <div>📈 Score: <span className="text-red-600">{state.totalScore}</span></div>
            </div>
          </div>

          {/* Mensagem */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-3 rounded-2xl mb-4 text-center font-bold text-sm border-2 border-yellow-300 min-h-12 flex items-center justify-center">
            {message}
          </div>

          {/* Achievements Count */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-2 rounded-xl mb-4 text-center text-xs font-bold border-2 border-purple-300">
            🏆 Conquistas: {Object.keys(achievements).length}/50+
          </div>

          {/* Seletor de Comida */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-3 rounded-2xl mb-4 border-2 border-green-300">
            <label className="block text-sm font-bold mb-2 text-green-700">🍽️ Comida:</label>
            <select
              value={String(selectedFood)}
              onChange={(e) => setSelectedFood(Number(e.target.value))}
              className="w-full p-2 border-2 border-green-300 rounded-xl bg-green-50 text-sm font-semibold focus:outline-none focus:border-green-500"
            >
              {foods.map((f, i) => {
                const foodNames = ["grama", "batata", "hamburger", "refri", "feijao", "hotdog", "pizza", "sushi", "tacos", "sorvete", "bolo", "chocolate", "maçã", "banana", "melancia", "morango", "uva", "cenoura", "brócolis", "espinafre", "tomate", "queijo", "iogurte", "leite", "pão", "arroz"];
                const count = (state.inventory && state.inventory[foodNames[i]]) || 0;
                return (
                  <option key={i} value={i}>
                    {f.name} (💩 {f.poop}) - {count}x
                  </option>
                );
              })}
            </select>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-2 mb-4">
            <button
              onClick={work}
              disabled={!state.alive || cooldown}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
            >
              💼 Trabalhar
            </button>
            <button
              onClick={feed}
              disabled={!state.alive}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
            >
              🍔 Comer
            </button>
            <button
              onClick={() => useBathroom()}
              disabled={!state.alive || cooldown}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
            >
              🚽 Banheiro
            </button>
            <button
              onClick={() => giveAffection()}
              disabled={!state.alive || cooldown}
              className="w-full bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
            >
              ❤️ Carinho
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowShop(!showShop)}
                className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                🛒 Loja
              </button>
              <button
                onClick={() => setShowCustomize(!showCustomize)}
                className="bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                🎨 Cores
              </button>
              <button
                onClick={() => setShowMinigame(!showMinigame)}
                className="bg-gradient-to-r from-purple-400 to-violet-500 hover:from-purple-500 hover:to-violet-600 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                🎮 Jogos
              </button>
              <button
                onClick={() => setShowAchievements(!showAchievements)}
                className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                🏆 Conquistas
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAdminClick}
                className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                ⚙️ Admin
              </button>
              <button
                onClick={() => setShowBugReport(!showBugReport)}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                🐛 Bug
              </button>
            </div>

            <button
              onClick={() => {
                if (!state.alive) {
                  setState(getInitialState());
                  setMessage("✨ Capivara revivida!");
                }
              }}
              disabled={state.alive}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
            >
              ✨ Reviver
            </button>

            <button
              onClick={() => setShowSaveMenu(!showSaveMenu)}
              className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
            >
              💾 Progresso
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </div>

      {/* Loja */}
      {showShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white to-pink-50 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-96 overflow-y-auto border-4 border-purple-300">
            <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">🛒 Loja</h2>
            <div className="space-y-2 mb-4">
              {foods.map((f, i) => (
                <div key={i} className="p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl border-2 border-pink-300">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm">{f.name} - {f.cost} 💰</span>
                    <button
                      onClick={() => {
                        setSelectedFood(i);
                        buyFood();
                      }}
                      className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold transition transform hover:scale-105"
                    >
                      Comprar
                    </button>
                  </div>
                  <div className="text-xs text-gray-700">💩 +{f.poop} | 🍽️ +{f.hunger}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShop(false)}
              className="w-full bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white py-2 rounded-xl font-bold transition transform hover:scale-105"
            >
              ❌ Fechar
            </button>
          </div>
        </div>
      )}

      {/* Minigames */}
      {showMinigame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-96 overflow-y-auto border-4 border-purple-300">
            <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">🎮 Jogos</h2>
            <div className="space-y-2 mb-4">
              {games.map((g, i) => (
                <div key={i} className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm">{g.name}</div>
                      <div className="text-xs text-gray-700">Nível: {g.minLevel} | Custo: {g.cost} 💰 | Prêmio: {g.reward} 💰</div>
                      {state.level < g.minLevel && (
                        <div className="text-xs text-red-600 font-bold">🔒 Nível {g.minLevel}</div>
                      )}
                    </div>
                    <button
                      onClick={() => playGame(i)}
                      disabled={state.level < g.minLevel || state.coins < g.cost}
                      className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 disabled:bg-gray-400 text-white px-3 py-1 rounded-lg text-sm font-bold transition transform hover:scale-105"
                    >
                      Jogar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowMinigame(false)}
              className="w-full bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white py-2 rounded-xl font-bold transition transform hover:scale-105"
            >
              ❌ Fechar
            </button>
          </div>
        </div>
      )}

      {/* Customizar */}
      {showCustomize && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white to-pink-50 rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-pink-300">
            <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">🎨 Cores</h2>
            <div className="space-y-2 grid grid-cols-2 gap-2">
              {[
                { name: "Marrom", color: "#8B6914" },
                { name: "Dourado", color: "#FFD700" },
                { name: "Cinza", color: "#808080" },
                { name: "Vermelho", color: "#DC143C" },
                { name: "Verde", color: "#228B22" },
                { name: "Azul", color: "#4169E1" },
                { name: "Rosa", color: "#FF69B4" },
                { name: "Roxo", color: "#9932CC" },
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => setState((prev: any) => ({ ...prev, capyColor: c.color }))}
                  className="p-3 rounded-xl font-bold text-white transition transform hover:scale-110 shadow-lg border-2 border-white"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCustomize(false)}
              className="w-full bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white py-2 rounded-xl font-bold mt-4 transition transform hover:scale-105"
            >
              ❌ Fechar
            </button>
          </div>
        </div>
      )}

      {/* Achievements */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white to-yellow-50 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-96 overflow-y-auto border-4 border-yellow-300">
            <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">🏆 Conquistas ({Object.keys(achievements).length})</h2>
            <div className="space-y-2 text-sm">
              {Object.keys(achievements).length === 0 ? (
                <p className="text-gray-600 text-center font-bold">Nenhuma conquista ainda... Comece a jogar!</p>
              ) : (
                <>
                  {achievements.level5 && <div className="p-2 bg-blue-100 rounded-lg border-2 border-blue-300 font-bold">⭐ Atingiu nível 5</div>}
                  {achievements.level10 && <div className="p-2 bg-blue-100 rounded-lg border-2 border-blue-300 font-bold">⭐ Atingiu nível 10</div>}
                  {achievements.level15 && <div className="p-2 bg-blue-100 rounded-lg border-2 border-blue-300 font-bold">⭐ Atingiu nível 15</div>}
                  {achievements.level20 && <div className="p-2 bg-blue-100 rounded-lg border-2 border-blue-300 font-bold">⭐ Atingiu nível 20</div>}
                  {achievements.level30 && <div className="p-2 bg-blue-100 rounded-lg border-2 border-blue-300 font-bold">⭐ Atingiu nível 30</div>}
                  {achievements.level50 && <div className="p-2 bg-blue-100 rounded-lg border-2 border-blue-300 font-bold">⭐ Atingiu nível 50</div>}
                  {achievements.level100 && <div className="p-2 bg-blue-100 rounded-lg border-2 border-blue-300 font-bold">🌟 LENDÁRIO! Nível 100</div>}
                  {achievements.coins100 && <div className="p-2 bg-green-100 rounded-lg border-2 border-green-300 font-bold">💰 100 moedas</div>}
                  {achievements.coins500 && <div className="p-2 bg-green-100 rounded-lg border-2 border-green-300 font-bold">💰 500 moedas</div>}
                  {achievements.coins1000 && <div className="p-2 bg-green-100 rounded-lg border-2 border-green-300 font-bold">💰 1000 moedas</div>}
                  {achievements.coins5000 && <div className="p-2 bg-green-100 rounded-lg border-2 border-green-300 font-bold">💰 5000 moedas</div>}
                  {achievements.coins10000 && <div className="p-2 bg-green-100 rounded-lg border-2 border-green-300 font-bold">💰 10000 moedas</div>}
                  {achievements.coins50000 && <div className="p-2 bg-green-100 rounded-lg border-2 border-green-300 font-bold">🌟 MILIONÁRIO! 50000</div>}
                  {achievements.score100 && <div className="p-2 bg-purple-100 rounded-lg border-2 border-purple-300 font-bold">📈 Score 100</div>}
                  {achievements.score500 && <div className="p-2 bg-purple-100 rounded-lg border-2 border-purple-300 font-bold">📈 Score 500</div>}
                  {achievements.score1000 && <div className="p-2 bg-purple-100 rounded-lg border-2 border-purple-300 font-bold">📈 Score 1000</div>}
                  {achievements.score5000 && <div className="p-2 bg-purple-100 rounded-lg border-2 border-purple-300 font-bold">📈 Score 5000</div>}
                  {achievements.size1_5 && <div className="p-2 bg-pink-100 rounded-lg border-2 border-pink-300 font-bold">📏 50% maior</div>}
                  {achievements.size2 && <div className="p-2 bg-pink-100 rounded-lg border-2 border-pink-300 font-bold">📏 GIGANTE!</div>}
                  {achievements.size3 && <div className="p-2 bg-pink-100 rounded-lg border-2 border-pink-300 font-bold">📏 MONSTRO!</div>}
                  {achievements.fullHunger && <div className="p-2 bg-yellow-100 rounded-lg border-2 border-yellow-300 font-bold">😋 Super satisfeita</div>}
                  {achievements.fullHappy && <div className="p-2 bg-yellow-100 rounded-lg border-2 border-yellow-300 font-bold">😄 Muito feliz</div>}
                  {achievements.noPoop && <div className="p-2 bg-yellow-100 rounded-lg border-2 border-yellow-300 font-bold">✨ Limpinha</div>}
                  {achievements.grama10 && <div className="p-2 bg-orange-100 rounded-lg border-2 border-orange-300 font-bold">🌱 Colecionador</div>}
                  {achievements.pizza5 && <div className="p-2 bg-orange-100 rounded-lg border-2 border-orange-300 font-bold">🍕 Amante de pizza</div>}
                  {achievements.sushi5 && <div className="p-2 bg-orange-100 rounded-lg border-2 border-orange-300 font-bold">🍣 Gourmet</div>}
                  {achievements.sorvete10 && <div className="p-2 bg-orange-100 rounded-lg border-2 border-orange-300 font-bold">🍦 Viciado</div>}
                  {achievements.susSuspicious && <div className="p-2 bg-red-100 rounded-lg border-2 border-red-300 font-bold">🔴 MUITO SUS!</div>}
                  {achievements.almostDead && <div className="p-2 bg-red-100 rounded-lg border-2 border-red-300 font-bold">💀 Quase morreu</div>}
                  {achievements.died && <div className="p-2 bg-red-100 rounded-lg border-2 border-red-300 font-bold">💀 Primeira morte</div>}
                </>
              )}
            </div>
            <button
              onClick={() => setShowAchievements(false)}
              className="w-full bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white py-2 rounded-xl font-bold mt-4 transition transform hover:scale-105"
            >
              ❌ Fechar
            </button>
          </div>
        </div>
      )}

      {/* Menu de Progresso */}
      {showSaveMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white to-cyan-50 rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-cyan-300">
            <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">💾 Progresso</h2>
            <div className="space-y-3">
              <button
                onClick={handleContinueProgress}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                ✅ Continuar Progresso
              </button>
              <button
                onClick={() => {
                  const userKey = currentUser ? `capyzen_state_${currentUser.username}` : "capyzen_state";
                  const saved = localStorage.getItem(userKey);
                  if (saved) {
                    const data = JSON.parse(saved);
                    const link = document.createElement('a');
                    link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
                    link.download = `capyzen_save_${currentUser?.username || 'backup'}.json`;
                    link.click();
                    setMessage("📥 Progresso baixado!");
                  }
                }}
                className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                📥 Carregar Progresso
              </button>
              <button
                onClick={handleDeleteProgress}
                className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                🗑️ Deletar Progresso
              </button>
              <button
                onClick={() => setShowSaveMenu(false)}
                className="w-full bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                ❌ Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Password Prompt */}
      {showAdminPasswordPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-gray-400">
            <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">🔐 Admin</h2>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Digite a senha"
              className="w-full p-3 border-2 border-gray-400 rounded-xl mb-4 bg-gray-50 focus:outline-none focus:border-gray-600 font-bold"
            />
            <div className="space-y-2">
              <button
                onClick={handleAdminPasswordSubmit}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                ✅ Entrar
              </button>
              <button
                onClick={() => {
                  setShowAdminPasswordPrompt(false);
                  setAdminPassword("");
                }}
                className="w-full bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-96 overflow-y-auto border-4 border-gray-400">
            <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">⚙️ Painel Admin</h2>
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => applyAdminCommand("+coins")} className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">+100 💰</button>
                <button onClick={() => applyAdminCommand("-coins")} className="bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">-100 💰</button>
                <button onClick={() => applyAdminCommand("+happy")} className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">+20 😄</button>
                <button onClick={() => applyAdminCommand("-happy")} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">-20 😢</button>
                <button onClick={() => applyAdminCommand("+hunger")} className="bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">+20 🍔</button>
                <button onClick={() => applyAdminCommand("-hunger")} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">-20 🍔</button>
                <button onClick={() => applyAdminCommand("+sus")} className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">+20 🔴</button>
                <button onClick={() => applyAdminCommand("-sus")} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">-20 🔴</button>
                <button onClick={() => applyAdminCommand("+poop")} className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">+20 💩</button>
                <button onClick={() => applyAdminCommand("-poop")} className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">-20 💩</button>
                <button onClick={() => applyAdminCommand("setCoins")} className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">Moedas</button>
                <button onClick={() => applyAdminCommand("setLevel")} className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">Level</button>
                <button onClick={() => applyAdminCommand("godMode")} className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">GOD MODE</button>
                <button onClick={() => applyAdminCommand("normalMode")} className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">Normal</button>
                <button onClick={() => applyAdminCommand("∞coins")} className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">∞ Moedas</button>
                <button onClick={() => applyAdminCommand("RESET")} className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-black text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg">RESET</button>
              </div>
            </div>
            <button
              onClick={() => setShowAdminPanel(false)}
              className="w-full bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white py-2 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
            >
              ❌ Fechar
            </button>
          </div>
        </div>
      )}

      {/* Bug Report */}
      {showBugReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-orange-300">
            <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">🐛 Reportar Bug</h2>
            <textarea
              value={bugText}
              onChange={(e) => setBugText(e.target.value)}
              className="w-full p-3 border-2 border-orange-300 rounded-xl mb-4 bg-orange-50 focus:outline-none focus:border-orange-500 font-bold"
              placeholder="Descreva o bug..."
              rows={4}
            />
            <div className="space-y-2">
              <button
                onClick={sendBugReport}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                📧 Enviar
              </button>
              <button
                onClick={() => setShowBugReport(false)}
                className="w-full bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
              >
                ❌ Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
